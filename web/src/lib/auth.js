// Admin sessions, login checks and login rate limiting.
// Only used on the server. Passwords are checked with scrypt (see password.mjs).

import { createHash, randomBytes } from 'node:crypto'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSql } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password.mjs'

// "__Host-" makes browsers accept the cookie only over HTTPS for this exact site
const COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session'
const SESSION_DAYS = 7
const MAX_FAILED_LOGINS = 5

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

// Visitors are identified only by a salted hash of their IP address
export async function getIpHash() {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for') ?? ''
  const ip = headerList.get('x-nf-client-connection-ip') ?? forwarded.split(',')[0].trim()
  return sha256(`${process.env.IP_HASH_SALT ?? ''}${ip || 'unknown'}`)
}

// ---------- Login rate limiting ----------

export async function isLoginLocked(ipHash) {
  const sql = getSql()
  const rows = await sql`
    SELECT count(*)::int AS failures
    FROM login_attempts
    WHERE ip_hash = ${ipHash}
      AND succeeded = false
      AND created_at > now() - interval '15 minutes'
  `
  return rows[0].failures >= MAX_FAILED_LOGINS
}

export async function recordLoginAttempt(ipHash, succeeded) {
  const sql = getSql()
  await sql`INSERT INTO login_attempts (ip_hash, succeeded) VALUES (${ipHash}, ${succeeded})`
  // Housekeeping: old attempts are not needed
  await sql`DELETE FROM login_attempts WHERE created_at < now() - interval '1 day'`
}

// ---------- Checking the email and password ----------

let dummyHashPromise
function getDummyHash() {
  dummyHashPromise ??= hashPassword('this-is-not-a-real-password')
  return dummyHashPromise
}

// Returns { id, email } when the login is correct, otherwise null.
// An unknown email still does the same slow work, so timing reveals nothing.
export async function checkCredentials(email, password) {
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${email}
  `
  const user = rows[0]
  const hash = user ? user.password_hash : await getDummyHash()
  const matches = await verifyPassword(password, hash)
  return matches && user ? { id: user.id, email: user.email } : null
}

// ---------- Sessions ----------

export async function createSession(userId) {
  const sql = getSql()
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  // Only the hash of the token is stored
  await sql`
    INSERT INTO admin_sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${sha256(token)}, ${expiresAt.toISOString()})
  `
  await sql`UPDATE admin_users SET last_login_at = now() WHERE id = ${userId}`
  await sql`DELETE FROM admin_sessions WHERE expires_at < now()`

  const store = await cookies()
  store.set(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: SESSION_DAYS * 24 * 60 * 60 })
}

// The logged-in admin for this request, or null. Cached so it runs once per request.
export const getAdmin = cache(async () => {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token || token.length > 100) return null

  try {
    const sql = getSql()
    const rows = await sql`
      SELECT u.id, u.email
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ${sha256(token)} AND s.expires_at > now()
    `
    return rows[0] ? { id: rows[0].id, email: rows[0].email } : null
  } catch (error) {
    // If anything is wrong, nobody gets in
    console.error('Could not check the admin session:', error)
    return null
  }
})

// Call this at the top of every admin page and admin action
export async function requireAdmin() {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}

export async function destroySession() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value

  if (token) {
    try {
      const sql = getSql()
      await sql`DELETE FROM admin_sessions WHERE token_hash = ${sha256(token)}`
    } catch (error) {
      console.error('Could not delete the admin session:', error)
    }
  }
  store.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
}