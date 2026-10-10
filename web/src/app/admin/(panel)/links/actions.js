'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

const FIX_MESSAGE = 'Please fix the highlighted fields.'
const SAVE_ERROR = 'Could not save. Please try again.'

// Only these kinds of address are accepted. This blocks harmful links such as "javascript:".
const ALLOWED_PROTOCOLS = ['https:', 'mailto:', 'tel:']

// Ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

function refreshSite() {
  revalidatePath('/', 'layout')
}

function isAllowedLink(href) {
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(href).protocol)
  } catch {
    return false
  }
}

// The type is worked out from the address, so you never have to choose it
function kindFor(href) {
  if (href.startsWith('mailto:')) return 'email'
  if (href.startsWith('tel:')) return 'phone'
  return 'social'
}

export async function saveLinkAction(previousState, formData) {
  await requireAdmin()

  const id = readId(formData)
  const isEdit = formData.has('id')

  const values = {
    label: String(formData.get('label') ?? '').trim(),
    value: String(formData.get('value') ?? '').trim(),
    href: String(formData.get('href') ?? '').trim(),
    visible: formData.get('visible') === 'on',
  }

  const errors = {}
  if (values.label.length < 2 || values.label.length > 50) {
    errors.label = 'Enter a name (2 to 50 characters), for example GitHub.'
  }
  if (values.value.length < 2 || values.value.length > 200) {
    errors.value = 'Enter the text to show (2 to 200 characters).'
  }
  if (values.href.length > 500 || !isAllowedLink(values.href)) {
    errors.href = 'Enter a full address starting with https://, mailto: or tel:.'
  }

  if (isEdit && !id) return { values, errors: {}, message: 'This link could not be found.', saved: false }
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE, saved: false }

  const kind = kindFor(values.href)
  const sql = getSql()
  try {
    if (isEdit) {
      await sql`
        UPDATE contact_links
        SET kind = ${kind}, label = ${values.label}, value = ${values.value},
            href = ${values.href}, visible = ${values.visible}
        WHERE id = ${id}
      `
    } else {
      // New links go to the end of the list
      await sql`
        INSERT INTO contact_links (kind, label, value, href, visible, sort_order)
        VALUES (
          ${kind}, ${values.label}, ${values.value}, ${values.href}, ${values.visible},
          (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM contact_links)
        )
      `
    }
  } catch (error) {
    console.error('Could not save the link:', error)
    return { values, errors: {}, message: SAVE_ERROR, saved: false }
  }

  refreshSite()
  // After adding a link, the form is cleared ready for the next one
  const shown = isEdit ? values : { label: '', value: '', href: '', visible: true }
  return { values: shown, errors: {}, message: '', saved: true }
}

// Moves a link one place up or down by swapping it with its neighbour
export async function moveLinkAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  const direction = String(formData.get('direction') ?? '')
  if (!id || !['up', 'down'].includes(direction)) return

  const sql = getSql()
  const rows = await sql`SELECT id FROM contact_links ORDER BY sort_order, id`
  const ids = rows.map((row) => String(row.id))

  const index = ids.indexOf(id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= ids.length) return

  ;[ids[index], ids[target]] = [ids[target], ids[index]]

  // Writes the new positions 0, 1, 2... in one query
  const order = ids.map((value, position) => ({ id: Number(value), pos: position }))
  await sql`
    UPDATE contact_links SET sort_order = t.pos
    FROM jsonb_to_recordset(${JSON.stringify(order)}::jsonb) AS t(id bigint, pos int)
    WHERE contact_links.id = t.id
  `
  refreshSite()
}

export async function deleteLinkAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  await getSql()`DELETE FROM contact_links WHERE id = ${id}`
  refreshSite()
  redirect('/admin/links')
}