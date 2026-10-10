'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { CLOUD_FOLDER } from '@/lib/brandingSlots'
import { getCloudConfig, signParams, fetchResource, destroyResource } from '@/lib/cloudinary'

// Cover images for projects and for blog posts share this one set of actions
const FORMATS = ['jpg', 'jpeg', 'png', 'webp']
const MIME_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
const MAX_BYTES = 3_000_000
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_\-/]{1,200}$/
const FOLDERS = { project: `${CLOUD_FOLDER}/projects`, post: `${CLOUD_FOLDER}/posts` }

function isKind(kind) {
  return kind === 'project' || kind === 'post'
}

function isId(id) {
  return typeof id === 'string' && /^\d{1,18}$/.test(id)
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
    console.error('Could not remove the old cover image:', error)
  }
}

async function itemExists(sql, kind, itemId) {
  const rows =
    kind === 'project'
      ? await sql`SELECT id FROM projects WHERE id = ${itemId}`
      : await sql`SELECT id FROM posts WHERE id = ${itemId}`
  return rows.length > 0
}

// Step 1: a one-time signed permit so the browser may upload to Cloudinary
export async function getCoverSignatureAction(kind) {
  await requireAdmin()
  if (!isKind(kind)) return { error: 'Unknown item type.' }

  try {
    const { cloudName, apiKey } = getCloudConfig()
    const timestamp = Math.floor(Date.now() / 1000)
    const params = { allowed_formats: FORMATS.join(','), folder: FOLDERS[kind], timestamp }
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
    console.error('Could not prepare the cover upload:', error)
    return { error: 'Image storage is not set up. Check the Cloudinary settings.' }
  }
}

// Step 2: after the browser uploaded, confirm with Cloudinary and use it as the cover
export async function saveCoverAction(kind, itemId, publicId) {
  await requireAdmin()

  if (
    !isKind(kind) ||
    !isId(itemId) ||
    typeof publicId !== 'string' ||
    !PUBLIC_ID_PATTERN.test(publicId) ||
    publicId.includes('..') ||
    !publicId.startsWith(`${FOLDERS[kind]}/`)
  ) {
    return { error: 'This upload could not be saved.' }
  }

  // We trust only what Cloudinary itself tells us, never what the browser says
  let resource
  try {
    resource = await fetchResource(publicId)
  } catch (error) {
    console.error('Could not confirm the cover upload:', error)
    return { error: 'Could not confirm the upload with the image service. Please try again.' }
  }

  const format = String(resource.format ?? '').toLowerCase()
  const url = String(resource.secure_url ?? '')
  const problem =
    resource.public_id !== publicId ||
    !FORMATS.includes(format) ||
    !url.startsWith('https://res.cloudinary.com/') ||
    !Number.isFinite(resource.bytes) ||
    resource.bytes > MAX_BYTES

  if (problem) {
    try {
      await destroyResource(publicId)
    } catch (error) {
      console.error('Could not remove a rejected cover upload:', error)
    }
    return { error: 'This file was not accepted. Use a JPG, PNG or WebP of 3 MB or less.' }
  }

  const sql = getSql()
  let mediaId = null
  try {
    if (!(await itemExists(sql, kind, itemId))) {
      await destroyResource(publicId).catch(() => {})
      return { error: 'This item could not be found. It may have been deleted.' }
    }

    const created = await sql`
      INSERT INTO media
        (kind, storage_provider, storage_key, url, mime_type, size_bytes, width, height, alt_text)
      VALUES
        ('image', 'cloudinary', ${publicId}, ${url}, ${MIME_TYPES[format]}, ${resource.bytes},
         ${resource.width ?? null}, ${resource.height ?? null}, 'Cover image')
      RETURNING id
    `
    mediaId = created[0].id

    // Makes it the cover, and reports the previous cover so it can be cleaned up
    const rows =
      kind === 'project'
        ? await sql`
            WITH old AS (SELECT cover_media_id AS id FROM projects WHERE id = ${itemId}),
            attached AS (
              UPDATE projects SET cover_media_id = ${mediaId}, updated_at = now()
              WHERE id = ${itemId} RETURNING id
            )
            SELECT (SELECT id FROM old) AS old_id FROM attached
          `
        : await sql`
            WITH old AS (SELECT cover_media_id AS id FROM posts WHERE id = ${itemId}),
            attached AS (
              UPDATE posts SET cover_media_id = ${mediaId}, updated_at = now()
              WHERE id = ${itemId} RETURNING id
            )
            SELECT (SELECT id FROM old) AS old_id FROM attached
          `

    const oldId = rows[0]?.old_id
    if (oldId) await removeMedia(sql, oldId)
  } catch (error) {
    console.error('Could not save the cover image:', error)
    if (mediaId) await removeMedia(sql, mediaId)
    else await destroyResource(publicId).catch(() => {})
    return { error: 'Could not save the image. Please try again.' }
  }

  refreshSite()
  return { ok: true }
}

// Removes the cover image and deletes the stored file
export async function removeCoverAction(kind, itemId) {
  await requireAdmin()
  if (!isKind(kind) || !isId(itemId)) return { error: 'This image could not be removed.' }

  const sql = getSql()
  try {
    const rows =
      kind === 'project'
        ? await sql`
            WITH old AS (SELECT cover_media_id AS id FROM projects WHERE id = ${itemId}),
            cleared AS (
              UPDATE projects SET cover_media_id = NULL, updated_at = now()
              WHERE id = ${itemId} RETURNING id
            )
            SELECT (SELECT id FROM old) AS old_id FROM cleared
          `
        : await sql`
            WITH old AS (SELECT cover_media_id AS id FROM posts WHERE id = ${itemId}),
            cleared AS (
              UPDATE posts SET cover_media_id = NULL, updated_at = now()
              WHERE id = ${itemId} RETURNING id
            )
            SELECT (SELECT id FROM old) AS old_id FROM cleared
          `
    if (rows[0]?.old_id) await removeMedia(sql, rows[0].old_id)
  } catch (error) {
    console.error('Could not remove the cover image:', error)
    return { error: 'Could not remove the image. Please try again.' }
  }

  refreshSite()
  return { ok: true }
}