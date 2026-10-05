const MAX_MESSAGE_CHARS = 3000

// Sends a plain-text alert to your Telegram chat. Plain text means visitor text can never break the format.
export async function sendTelegramNotification(data) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    throw new Error('Telegram settings are missing')
  }

  const oneLine = (value) => String(value).replace(/[\r\n]+/g, ' ').trim()
  const message =
    data.message.length > MAX_MESSAGE_CHARS
      ? `${data.message.slice(0, MAX_MESSAGE_CHARS)}...`
      : data.message

  const text = [
    'NEW PORTFOLIO CONTACT',
    '',
    `Name: ${oneLine(data.name)}`,
    `Email: ${oneLine(data.email)}`,
    `Subject: ${oneLine(data.subject)}`,
    data.phone ? `Phone: ${oneLine(data.phone)}` : null,
    data.company ? `Company: ${oneLine(data.company)}` : null,
    '',
    'Message:',
    message,
    '',
    'Time:',
    new Date().toUTCString(),
  ]
    .filter((line) => line !== null)
    .join('\n')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
    // Never wait longer than 5 seconds for Telegram
    signal: AbortSignal.timeout(5000),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.ok) {
    // The error mentions Telegram's reason only, never the token
    throw new Error(`Telegram error: ${result.description || response.status}`)
  }
}