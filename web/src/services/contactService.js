// Sends the contact form to our own API route, which saves it in the database
export async function sendContactMessage(data) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  let result = {}
  try {
    result = await response.json()
  } catch {
    // The server sent no readable reply; we handle that below
  }

  if (!response.ok) {
    const error = new Error(result.error || 'Request failed')
    error.status = response.status
    error.fieldErrors = result.errors
    throw error
  }

  return result
}