import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is missing. Check that web/.env.local exists.')
  process.exit(1)
}

const sql = neon(url)
const rows = await sql.query(
      'SELECT id, name, subject, status, email_notified, autoreply_sent, telegram_notified, created_at FROM messages ORDER BY created_at DESC LIMIT 10',
)
console.table(rows)