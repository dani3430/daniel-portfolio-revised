'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

const FIX_MESSAGE = 'Please fix the highlighted fields.'
const SAVE_ERROR = 'Could not save. Please try again.'

// Ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

function refreshSite() {
  revalidatePath('/', 'layout')
}

export async function saveTimelineAction(previousState, formData) {
  await requireAdmin()

  const id = readId(formData)
  const isEdit = formData.has('id')

  const values = {
    title: String(formData.get('title') ?? '').trim(),
    text: String(formData.get('text') ?? '').trim(),
  }

  const errors = {}
  if (values.title.length < 2 || values.title.length > 120) {
    errors.title = 'Enter a title (2 to 120 characters).'
  }
  if (values.text.length < 2 || values.text.length > 600) {
    errors.text = 'Enter a description (2 to 600 characters).'
  }

  if (isEdit && !id) return { values, errors: {}, message: 'This item could not be found.', saved: false }
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE, saved: false }

  const sql = getSql()
  try {
    if (isEdit) {
      await sql`
        UPDATE timeline_items SET title = ${values.title}, text = ${values.text} WHERE id = ${id}
      `
    } else {
      // New items go to the end of the list
      await sql`
        INSERT INTO timeline_items (title, text, sort_order)
        VALUES (
          ${values.title}, ${values.text},
          (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM timeline_items)
        )
      `
    }
  } catch (error) {
    console.error('Could not save the timeline item:', error)
    return { values, errors: {}, message: SAVE_ERROR, saved: false }
  }

  refreshSite()
  // After adding an item, the form is cleared ready for the next one
  const shown = isEdit ? values : { title: '', text: '' }
  return { values: shown, errors: {}, message: '', saved: true }
}

// Moves an item one place up or down by swapping it with its neighbour
export async function moveTimelineAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  const direction = String(formData.get('direction') ?? '')
  if (!id || !['up', 'down'].includes(direction)) return

  const sql = getSql()
  const rows = await sql`SELECT id FROM timeline_items ORDER BY sort_order, id`
  const ids = rows.map((row) => String(row.id))

  const index = ids.indexOf(id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= ids.length) return

  ;[ids[index], ids[target]] = [ids[target], ids[index]]

  // Writes the new positions 0, 1, 2... in one query
  const order = ids.map((value, position) => ({ id: Number(value), pos: position }))
  await sql`
    UPDATE timeline_items SET sort_order = t.pos
    FROM jsonb_to_recordset(${JSON.stringify(order)}::jsonb) AS t(id bigint, pos int)
    WHERE timeline_items.id = t.id
  `
  refreshSite()
}

export async function deleteTimelineAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  await getSql()`DELETE FROM timeline_items WHERE id = ${id}`
  refreshSite()
  redirect('/admin/timeline')
}