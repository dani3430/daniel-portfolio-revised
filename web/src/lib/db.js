import { neon } from '@neondatabase/serverless'

// Creates the database connection when it is first needed.
// Doing it lazily means a missing setting never breaks the site build.
export function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}