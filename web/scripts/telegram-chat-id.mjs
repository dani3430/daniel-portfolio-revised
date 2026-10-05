const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is missing. Check web/.env.local.')
  process.exit(1)
}

let data
try {
  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`)
  data = await response.json()
} catch {
  console.error('Could not reach Telegram. Check your internet connection.')
  process.exit(1)
}

if (!data.ok) {
  console.error('Telegram said:', data.description)
  process.exit(1)
}

// Collect each distinct chat that has written to the bot
const chats = new Map()
for (const update of data.result) {
  const chat = update.message?.chat
  if (chat) chats.set(chat.id, chat)
}

if (chats.size === 0) {
  console.log('No messages found. Open your bot in Telegram, press Start, send "hello", then run this again.')
}
for (const chat of chats.values()) {
  console.log(`Chat ID: ${chat.id} (${chat.type}, ${chat.first_name ?? chat.title ?? ''})`)
}