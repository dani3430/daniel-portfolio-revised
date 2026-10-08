'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { SLOTS, SLOT_KEYS, CLOUD_FOLDER } from '@/lib/brandingSlots'
import { getCloudConfig, signParams, fetchResource, destroyResource } from '@/lib/cloudinary'

const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_\-/]{1,200}$/

const MIME_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

function slotFolder(slot) {
  return `${CLOUD_FOLDER}/${SLOTS[slot].folder}`
}

function refreshSite() {
  revalidatePath('/', 'layout')
}

// Deletes a media row and its file at Cloudinary. A failure is logged, never fatal.
async function removeMedia(sql, mediaId) {
  try {
    const rows = await sql`DELETE FROM media WHERE id = ${mediaId} RETURNING storage_key`
    if (rows[0]) await destroyResource(rows[0].storage_key)
  } catch (error) {
    console.error('Could not remove the old image:', error)
  }
}

// Step 1: a one-time signed permit so the browser may upload to Cloudinary
export async function getUploadSignatureAction(slot) {
  await requireAdmin()
  if (typeof slot !== 'string' || !SLOT_KEYS.includes(slot)) {
    return { error: 'Unknown image slot.' }
  }

  try {
    const { cloudName, apiKey } = getCloudConfig()
    const timestamp = Math.floor(Date.now() / 1000)
    const params = {
      allowed_formats: SLOTS[slot].formats.join(','),
      folder: slotFolder(slot),
      timestamp,
    }
    return {
      ok: true,
      cloudName,
      apiKey,
      timestamp,
      folder: params.folder,
      allowedFormats: params.allowed_formats,
      signature: signParams(params),
    }
  } catch (error) {
    console.error('Could not prepare the upload:', error)
    return { error: 'Image storage is not set up. Check the Cloudinary settings.' }
  }
}

// Step 2: after the browser uploaded, confirm with Cloudinary and save it in a slot
export async function saveUploadAction(slot, publicId) {
  await requireAdmin()

  if (
    typeof slot !== 'string' ||
    !SLOT_KEYS.includes(slot) ||
    typeof publicId !== 'string' ||
    !PUBLIC_ID_PATTERN.test(publicId) ||
    publicId.includes('..') ||
    !publicId.startsWith(`${slotFolder(slot)}/`)
  ) {
    return { error: 'This upload could not be saved.' }
  }

  const rules = SLOTS[slot]

  // We trust only what Cloudinary itself tells us, never what the browser says
  let resource
  try {
    resource = await fetchResource(publicId)
  } catch (error) {
    console.error('Could not confirm the upload:', error)
    return { error: 'Could not confirm the upload with the image service. Please try again.' }
  }

  const format = String(resource.format ?? '').toLowerCase()
  const url = String(resource.secure_url ?? '')
  const tooBig = !Number.isFinite(resource.bytes) || resource.bytes > rules.maxBytes
  const problem =
    resource.public_id !== publicId ||
    !rules.formats.includes(format) ||
    !url.startsWith('https://res.cloudinary.com/') ||
    tooBig

  if (problem) {
    try {
      await destroyResource(publicId)
    } catch (error) {
      console.error('Could not remove a rejected upload:', error)
    }
    return { error: 'This file was not accepted. Check its type and size.' }
  }

  const sql = getSql()
  try {
    // One statement: save the file record, put it in the slot, and report the old one
    const rows = await sql`
      WITH old AS (
        SELECT (value ->> ${slot}::text)::bigint AS id
        FROM site_settings WHERE key = 'branding'
      ),
      created AS (
        INSERT INTO media
          (kind, storage_provider, storage_key, url, mime_type, size_bytes, width, height, alt_text)
        VALUES
          (${rules.kind}, 'cloudinary', ${publicId}, ${url}, ${MIME_TYPES[format]},
           ${resource.bytes}, ${resource.width ?? null}, ${resource.height ?? null}, ${rules.alt})
        RETURNING id
      ),
      saved AS (
        INSERT INTO site_settings (key, value)
        SELECT 'branding', jsonb_build_object(${slot}::text, created.id) FROM created
        ON CONFLICT (key) DO UPDATE
          SET value = site_settings.value || EXCLUDED.value, updated_at = now()
        RETURNING key
      )
      SELECT (SELECT id FROM old) AS old_id FROM created, saved
    `

    const oldId = rows[0]?.old_id
    if (oldId) await removeMedia(sql, oldId)
  } catch (error) {
    console.error('Could not save the image:', error)
    try {
      await destroyResource(publicId)
    } catch {
      // nothing more we can do
    }
    return { error: 'Could not save the image. Please try again.' }
  }

  refreshSite()
  return { ok: true }
}

// Back to the built-in image, and delete the uploaded one
export async function resetSlotAction(formData) {
  await requireAdmin()

  const slot = String(formData.get('slot') ?? '')
  if (!SLOT_KEYS.includes(slot)) return

  const sql = getSql()
  const rows = await sql`
    WITH old AS (
      SELECT (value ->> ${slot}::text)::bigint AS id
      FROM site_settings WHERE key = 'branding'
    ),
    cleared AS (
      UPDATE site_settings SET value = value - ${slot}::text, updated_at = now()
      WHERE key = 'branding'
      RETURNING key
    )
    SELECT id FROM old
  `
  if (rows[0]?.id) await removeMedia(sql, rows[0].id)

  refreshSite()
}