import readline from 'node:readline'
import { neon } from '@neondatabase/serverless'
import { hashPassword } from '../src/lib/password.mjs'

// Usage: node --env-file=.env.local scripts/create-admin.mjs
// Creates the admin account, or changes its password if the email already exists.

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

function isConnectionError(error) {
  const text = `${error?.message ?? ''} ${error?.sourceError?.message ?? ''}`
  return /fetch failed|Error connecting to database|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|network/i.test(text)
}

async function q(text, params = []) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await sql.query(text, params)
    } catch (error) {
      if (!isConnectionError(error) || attempt === MAX_ATTEMPTS) throw error
      console.log(`  Connection dropped, retrying (${attempt}/${MAX_ATTEMPTS - 1})...`)
      await wait(1500 * attempt)
    }
  }
}

// Asks a question in the terminal. When hidden is true, typing is not shown.
function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    })
    let muted = false
    rl._writeToOutput = (text) => {
      if (!muted) rl.output.write(text)
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) process.stdout.write('\n')
      resolve(answer)
    })
    muted = hidden
  })
}

const email = (await ask('Admin email: ')).trim().toLowerCase()
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
  console.error('That does not look like a valid email address.')
  process.exit(1)
}

const password = await ask('Admin password (at least 12 characters, hidden): ', true)
if (password.length < 12) {
  console.error('The password must be at least 12 characters long.')
  process.exit(1)
}
if (password.toLowerCase() === email) {
  console.error('The password must not be the same as the email.')
  process.exit(1)
}

const confirm = await ask('Type the password again: ', true)
if (confirm !== password) {
  console.error('The two passwords do not match. Nothing was saved.')
  process.exit(1)
}

const passwordHash = await hashPassword(password)

const rows = await q(
  `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
   RETURNING id`,
  [email, passwordHash],
)

// If the password was changed, every old login session stops working
await q(`DELETE FROM admin_sessions WHERE user_id = $1`, [rows[0].id])

console.log(`Done. Admin account saved for ${email}.`)