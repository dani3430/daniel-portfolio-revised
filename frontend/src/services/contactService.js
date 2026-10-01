// TEMPORARY: while there is no backend, pretend the message was sent.
// Set this to false (or delete the mock block) when the real API exists.
const USE_MOCK = true

export async function sendContactMessage(data) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return { ok: true }
  }

  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }
  return response.json()
}