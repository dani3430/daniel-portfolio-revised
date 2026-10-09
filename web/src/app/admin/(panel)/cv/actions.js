'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { CLOUD_FOLDER } from '@/lib/brandingSlots'
import { getCloudConfig, signParams, fetchResource, destroyResource } from '@/lib/cloudinary'

const CV_FOLDER = `${CLOUD_FOLDER}/cv`
const CV_MAX_BYTES = 5_000_000
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_\-/]{1,200}$/

// Step 1: a one-time signed permit so the browser may upload a PDF to Cloudinary
export async function getCvUploadSignatureAction() {
  await requireAdmin()

  try {
    const { cloudName, apiKey } = getCloudConfig()
    const timestamp = Math.floor(Date.now() / 1000)
    const params = { allowed_formats: 'pdf', folder: CV_FOLDER, timestamp }
    return {
      ok: true,
      cloudName,
      apiKey,
      timestamp,
      folder: CV_FOLDER,
      allowedFormats: 'pdf',
      signature: signParams(params),
    }
  } catch (error) {
    console.error('Could not prepare the CV upload:', error)
    return { error: 'File storage is not set up. Check the Cloudinary settings.' }
  }
}

// Step 2: after the browser uploaded, confirm with Cloudinary and save the CV record
export async function saveCvAction(publicId, rawTitle, rawVersion) {
  await requireAdmin()

  const title = String(rawTitle ?? '').trim()
  const version = String(rawVersion ?? '').trim()

  if (title.length < 2 || title.length > 100) {
    return { error: 'Enter a title between 2 and 100 characters.' }
  }
  if (version.length > 30) {
    return { error: 'The version can be at most 30 characters.' }
  }
  if (
    typeof publicId !== 'string' ||
    !PUBLIC_ID_PATTERN.test(publicId) ||
    publicId.includes('..') ||
    !publicId.startsWith(`${CV_FOLDER}/`)
  ) {
    return { error: 'This upload could not be saved.' }
  }

  // We trust only what Cloudinary itself tells us, never what the browser says
  let resource
  try {
    resource = await fetchResource(publicId)
  } catch (error) {
    console.error('Could not confirm the CV upload:', error)
    return { error: 'Could not confirm the upload with the file service. Please try again.' }
  }

  const url = String(resource.secure_url ?? '')
  const problem =
    resource.public_id !== publicId ||
    String(resource.format ?? '').toLowerCase() !== 'pdf' ||
    !url.startsWith('https://res.cloudinary.com/') ||
    !Number.isFinite(resource.bytes) ||
    resource.bytes > CV_MAX_BYTES

  if (problem) {
    try {
      await destroyResource(publicId)
    } catch (error) {
      console.error('Could not remove a rejected CV upload:', error)
    }
    return { error: 'This file was not accepted. It must be a PDF of 5 MB or less.' }
  }

  const sql = getSql()
  try {
    // One statement: save the file record and the CV record together
    await sql`
      WITH created AS (
        INSERT INTO media
          (kind, storage_provider, storage_key, url, mime_type, size_bytes)
        VALUES
          ('document', 'cloudinary', ${publicId}, ${url}, 'application/pdf', ${resource.bytes})
        RETURNING id
      )
      INSERT INTO cv_files (title, version, media_id)
      SELECT ${title}, ${version || null}, created.id FROM created
    `
  } catch (error) {
    console.error('Could not save the CV:', error)
    try {
      await destroyResource(publicId)
    } catch {
      // nothing more we can do
    }
    return { error: 'Could not save the CV. Please try again.' }
  }

  revalidatePath('/admin/cv')
  return { ok: true }
}

// CV ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

// Makes one CV the current, public one. Only one CV can be current at a time.
export async function setCurrentCvAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  const sql = getSql()
  // A transaction runs both changes together, or neither
  await sql.transaction([
    sql`UPDATE cv_files SET is_current = false WHERE is_current AND id <> ${id}`,
    sql`UPDATE cv_files SET is_current = true, published = true WHERE id = ${id}`,
  ])

  revalidatePath('/admin/cv')
}

// Hides the CV from the public website. The file stays saved for later.
export async function unpublishCvAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  await getSql()`UPDATE cv_files SET published = false, is_current = false WHERE id = ${id}`

  revalidatePath('/admin/cv')
}

// Deletes the CV record, then the stored file
export async function deleteCvAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  const sql = getSql()
  const rows = await sql`
    SELECT m.id AS media_id, m.storage_key
    FROM cv_files c
    JOIN media m ON m.id = c.media_id
    WHERE c.id = ${id}
  `
  if (rows.length === 0) return

  const { media_id: mediaId, storage_key: storageKey } = rows[0]

  await sql.transaction([
    sql`DELETE FROM cv_files WHERE id = ${id}`,
    sql`DELETE FROM media WHERE id = ${mediaId}`,
  ])

  // The record is already gone. If the stored file cannot be removed, we only log it.
  try {
    await destroyResource(storageKey)
  } catch (error) {
    console.error('Could not remove the CV file from storage:', error)
  }

  revalidatePath('/admin/cv')
}