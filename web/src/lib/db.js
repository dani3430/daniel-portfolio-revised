import { neon, neonConfig } from '@neondatabase/serverless'

const MAX_ATTEMPTS = 3

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// A brief network hiccup is retried instead of crashing the page.
// Only network failures are retried. Database errors and wrong passwords are not.
neonConfig.fetchFunction = async (...args) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(...args)
    } catch (error) {
      console.warn(`[db] network error (attempt ${attempt}): ${error?.cause?.code || error?.message}`)
      if (attempt >= MAX_ATTEMPTS) throw error
      await wait(300 * attempt)
    }
  }
}

// Creates the database connection when it is first needed.
// Doing it lazily means a missing setting never breaks the site build.
export function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}