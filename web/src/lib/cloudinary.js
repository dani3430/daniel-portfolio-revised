// Talks to Cloudinary from the server. The secret never leaves the server.

import { createHash } from 'node:crypto'

export function getCloudConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary settings are missing')
  }
  return { cloudName, apiKey, apiSecret }
}

// Cloudinary's signing rule: sort the parameters, join them as key=value&key=value,
// add the secret at the end, and take the SHA-1 fingerprint.
export function signParams(params) {
  const { apiSecret } = getCloudConfig()
  const text = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(text + apiSecret).digest('hex')
}

// Asks Cloudinary for the real details of an uploaded image
export async function fetchResource(publicId) {
  const { cloudName, apiKey, apiSecret } = getCloudConfig()
  const login = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const path = publicId.split('/').map(encodeURIComponent).join('/')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${path}`,
    { headers: { Authorization: `Basic ${login}` }, cache: 'no-store' },
  )
  if (!response.ok) {
    throw new Error(`Cloudinary lookup failed (${response.status})`)
  }
  return response.json()
}

// Deletes an image from Cloudinary (and clears it from their CDN cache)
export async function destroyResource(publicId) {
  const { cloudName, apiKey } = getCloudConfig()
  const timestamp = String(Math.floor(Date.now() / 1000))
  const params = { invalidate: 'true', public_id: publicId, timestamp }

  const body = new URLSearchParams({
    ...params,
    api_key: apiKey,
    signature: signParams(params),
  })
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body,
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Cloudinary delete failed (${response.status})`)
  }
}