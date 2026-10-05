import nodemailer from 'nodemailer'

function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error('Email settings are missing')
  }

  const port = Number(EMAIL_PORT || 465)
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
    // Short timeouts, so a slow mail server can never hang the website
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  })
}

// Makes visitor text safe to place inside an HTML email
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Removes line breaks, so visitor text can never inject extra email headers
function oneLine(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim()
}

// Email #1: an alert to you
export async function sendOwnerNotification(data) {
  const transporter = createTransporter()
  const when = new Date().toUTCString()

  const lines = [
    `Name: ${oneLine(data.name)}`,
    `Email: ${oneLine(data.email)}`,
    `Subject: ${oneLine(data.subject)}`,
    data.phone ? `Phone: ${oneLine(data.phone)}` : null,
    data.company ? `Company: ${oneLine(data.company)}` : null,
    `Received: ${when}`,
    '',
    'Message:',
    data.message,
  ].filter((line) => line !== null)

  const row = (label, value) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${label}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:600px">
      <h2 style="color:#047857;margin:0 0 16px">New portfolio message</h2>
      <table style="border-collapse:collapse;font-size:14px">
        ${row('Name', oneLine(data.name))}
        ${row('Email', oneLine(data.email))}
        ${row('Subject', oneLine(data.subject))}
        ${data.phone ? row('Phone', oneLine(data.phone)) : ''}
        ${data.company ? row('Company', oneLine(data.company)) : ''}
        ${row('Received', when)}
      </table>
      <h3 style="margin:20px 0 8px">Message</h3>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;border-left:3px solid #047857;padding-left:12px">${escapeHtml(data.message)}</div>
      <p style="color:#64748b;font-size:12px;margin-top:24px">Press Reply to answer ${escapeHtml(oneLine(data.name))} directly.</p>
    </div>`

  await transporter.sendMail({
    from: `"Portfolio website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    replyTo: oneLine(data.email),
    subject: `New portfolio message: ${oneLine(data.subject)}`,
    text: lines.join('\n'),
    html,
  })
}

// Email #2: a professional automatic reply to the visitor
export async function sendAutoReply(data) {
  const transporter = createTransporter()
  const siteUrl = process.env.SITE_URL || ''
  const contactEmail = process.env.EMAIL_TO || process.env.EMAIL_USER
  const name = oneLine(data.name)

  const text = [
    `Hello ${name},`,
    '',
    'Thank you for contacting Daniel. Your message has been received successfully.',
    'I will review it and get back to you as soon as possible.',
    '',
    `Your subject: ${oneLine(data.subject)}`,
    '',
    'Best regards,',
    'Daniel Temesgen',
    'Full-Stack Software Developer',
    siteUrl,
    contactEmail,
  ]
    .filter((line, index, all) => line !== '' || all[index - 1] !== '')
    .join('\n')

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:600px;line-height:1.6">
      <h2 style="color:#047857;margin:0 0 16px">Thank you for contacting Daniel</h2>
      <p>Hello ${escapeHtml(name)},</p>
      <p>Your message has been received successfully. I will review it and get back to you as soon as possible.</p>
      <p style="color:#64748b;font-size:14px">Your subject: ${escapeHtml(oneLine(data.subject))}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
      <p style="margin:0"><strong>Daniel Temesgen</strong></p>
      <p style="margin:0;color:#047857">Full-Stack Software Developer</p>
      <p style="margin:8px 0 0;font-size:14px;color:#64748b">
        ${siteUrl ? `<a href="${escapeHtml(siteUrl)}" style="color:#047857">${escapeHtml(siteUrl)}</a><br />` : ''}
        ${escapeHtml(contactEmail)}
      </p>
    </div>`

  await transporter.sendMail({
    from: `"Daniel Temesgen" <${process.env.EMAIL_USER}>`,
    to: oneLine(data.email),
    subject: 'Thank you for contacting Daniel Temesgen',
    text,
    html,
  })
}