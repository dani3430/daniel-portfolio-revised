import { createHash } from 'node:crypto'
import { getSql } from '@/lib/db'
import { validateContact } from '@/lib/contactValidation'
import { sendOwnerNotification, sendAutoReply } from '@/lib/email'
import { sendTelegramNotification } from '@/lib/telegram'

const MAX_BODY_BYTES = 10_000
const MAX_MESSAGES_PER_HOUR = 3

function json(body, status = 200) {
  return Response.json(body, { status })
}

// Visitors are identified only by a salted hash of their IP address, never the address itself
function hashIp(request) {
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const ip = request.headers.get('x-nf-client-connection-ip') ?? forwarded.split(',')[0].trim()
  return createHash('sha256')
    .update(`${process.env.IP_HASH_SALT ?? ''}${ip || 'unknown'}`)
    .digest('hex')
}

export async function POST(request) {
  // Only accept requests that come from our own website
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin) {
    let originHost = ''
    try {
      originHost = new URL(origin).host
    } catch {
      return json({ error: 'Invalid request.' }, 400)
    }
    if (originHost !== host) {
      return json({ error: 'Invalid request.' }, 403)
    }
  }

  // Refuse oversized requests
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) {
    return json({ error: 'Request is too large.' }, 413)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  // Spam bots fill the hidden field: pretend success and save nothing
  if (body?.website) {
    return json({ ok: true })
  }

  const { clean, errors } = validateContact(body)
  if (Object.keys(errors).length > 0) {
    return json({ error: 'Please check the form.', errors }, 400)
  }

  let sql
  let messageId
  try {
    sql = getSql()
    const ipHash = hashIp(request)

    // Allow only a few messages per visitor per hour
    const recent = await sql`
      SELECT count(*)::int AS total FROM messages
      WHERE ip_hash = ${ipHash} AND created_at > now() - interval '1 hour'
    `
    if (recent[0].total >= MAX_MESSAGES_PER_HOUR) {
      return json({ error: 'Too many messages. Please try again later.' }, 429)
    }

    // Save the message FIRST, before any notification can fail
    const inserted = await sql`
      INSERT INTO messages (name, email, subject, message, phone, company, ip_hash)
      VALUES (
        ${clean.name}, ${clean.email}, ${clean.subject}, ${clean.message},
        ${clean.phone || null}, ${clean.company || null}, ${ipHash}
      )
      RETURNING id
    `
    messageId = inserted[0].id
  } catch (error) {
    // Details go to the server log only, never to the visitor
    console.error('Contact form error:', error)
    return json({ error: 'Something went wrong. Please try again later.' }, 500)
  }

  // The message is safe in the database. Now try the notifications.
  // A failure here is recorded, but it never turns the visitor's success into an error.
    try {
    const [ownerResult, replyResult, telegramResult] = await Promise.allSettled([
           sendOwnerNotification({ ...clean, id: messageId }),
      sendAutoReply(clean),
      sendTelegramNotification(clean),
    ])

    const emailNotified = ownerResult.status === 'fulfilled'
    const autoreplySent = replyResult.status === 'fulfilled'
    const telegramNotified = telegramResult.status === 'fulfilled'
    if (!emailNotified) console.error('Owner email failed:', ownerResult.reason)
    if (!autoreplySent) console.error('Auto-reply failed:', replyResult.reason)
    if (!telegramNotified) console.error('Telegram notification failed:', telegramResult.reason)

    await sql`
      UPDATE messages
      SET email_notified = ${emailNotified},
          autoreply_sent = ${autoreplySent},
          telegram_notified = ${telegramNotified}
      WHERE id = ${messageId}
    `
  } catch (error) {
    console.error('Notification step failed:', error)
  }
  return json({ ok: true })
}