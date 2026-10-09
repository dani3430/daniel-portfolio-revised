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

export async function saveEducationAction(previousState, formData) {
  await requireAdmin()

  const id = readId(formData)
  const isEdit = formData.has('id')

  const values = {
    title: String(formData.get('title') ?? '').trim(),
    place: String(formData.get('place') ?? '').trim(),
    note: String(formData.get('note') ?? '').trim(),
  }

  const errors = {}
  if (values.title.length < 2 || values.title.length > 120) {
    errors.title = 'Enter a title (2 to 120 characters).'
  }
  if (values.place.length < 2 || values.place.length > 120) {
    errors.place = 'Enter the school or place (2 to 120 characters).'
  }
  if (values.note.length > 300) {
    errors.note = 'Keep the note under 300 characters.'
  }

  if (isEdit && !id) return { values, errors: {}, message: 'This item could not be found.', saved: false }
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE, saved: false }

  const sql = getSql()
  try {
    if (isEdit) {
      await sql`
        UPDATE education
        SET title = ${values.title}, place = ${values.place}, note = ${values.note || null}
        WHERE id = ${id}
      `
    } else {
      // New items go to the end of the list
      await sql`
        INSERT INTO education (title, place, note, sort_order)
        VALUES (
          ${values.title}, ${values.place}, ${values.note || null},
          (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM education)
        )
      `
    }
  } catch (error) {
    console.error('Could not save the education item:', error)
    return { values, errors: {}, message: SAVE_ERROR, saved: false }
  }

  refreshSite()
  // After adding an item, the form is cleared ready for the next one
  const shown = isEdit ? values : { title: '', place: '', note: '' }
  return { values: shown, errors: {}, message: '', saved: true }
}

// Moves an item one place up or down by swapping it with its neighbour
export async function moveEducationAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  const direction = String(formData.get('direction') ?? '')
  if (!id || !['up', 'down'].includes(direction)) return

  const sql = getSql()
  const rows = await sql`SELECT id FROM education ORDER BY sort_order, id`
  const ids = rows.map((row) => String(row.id))

  const index = ids.indexOf(id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= ids.length) return

  ;[ids[index], ids[target]] = [ids[target], ids[index]]

  // Writes the new positions 0, 1, 2... in one query
  const order = ids.map((value, position) => ({ id: Number(value), pos: position }))
  await sql`
    UPDATE education SET sort_order = t.pos
    FROM jsonb_to_recordset(${JSON.stringify(order)}::jsonb) AS t(id bigint, pos int)
    WHERE education.id = t.id
  `
  refreshSite()
}

export async function deleteEducationAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  await getSql()`DELETE FROM education WHERE id = ${id}`
  refreshSite()
  redirect('/admin/education')
}