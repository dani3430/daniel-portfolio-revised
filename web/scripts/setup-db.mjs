import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is missing. Check that web/.env.local exists and has the line.')
  process.exit(1)
}

const sql = neon(url)

// Read the schema file and run each statement one by one
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
const statements = schema
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean)

for (const statement of statements) {
  await sql.query(statement)
}

// Show which tables exist now (names only, no secrets)
const tables = await sql.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
)
console.log('Database is ready. Tables:', tables.map((t) => t.table_name).join(', '))