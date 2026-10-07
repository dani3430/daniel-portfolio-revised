import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

// Usage: node --env-file=.env.local scripts/migrate.mjs 002_cms_schema.sql
const fileName = process.argv[2]
if (!fileName || !/^[\w.-]+\.sql$/.test(fileName)) {
  console.error('Tell me which file in db/ to apply, for example: 002_cms_schema.sql')
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is missing. Check that .env.local exists.')
  process.exit(1)
}

const sql = neon(url)

const MAX_ATTEMPTS = 6

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// A dropped connection is worth retrying. A real SQL error is not.
function isConnectionError(error) {
  const text = `${error?.message ?? ''} ${error?.sourceError?.message ?? ''}`
  return /fetch failed|Error connecting to database|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|network/i.test(text)
}

// Runs one statement, retrying a few times if the connection drops
async function runWithRetry(statement) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await sql.query(statement)
    } catch (error) {
      if (!isConnectionError(error) || attempt === MAX_ATTEMPTS) throw error
      console.log(`  Connection dropped, retrying (${attempt}/${MAX_ATTEMPTS - 1})...`)
      await wait(1500 * attempt)
    }
  }
}

// Read the SQL file and run each statement one by one.
// Every statement uses IF NOT EXISTS, so running this twice is safe.
const schema = readFileSync(new URL(`../db/${fileName}`, import.meta.url), 'utf8')
const statements = schema
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean)

let done = 0
for (const statement of statements) {
  try {
    await runWithRetry(statement)
    done += 1
    console.log(`OK ${done}/${statements.length}`)
  } catch (error) {
    console.error(`Failed on statement ${done + 1} of ${statements.length}:`)
    console.error(statement.slice(0, 200))
    console.error('Reason:', error.message)
    process.exit(1)
  }
}

// Show which tables exist now (names only, no secrets)
const tables = await runWithRetry(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
)
console.log(`Applied ${done} statements from db/${fileName}.`)
console.log('Tables now:', tables.map((t) => t.table_name).join(', '))