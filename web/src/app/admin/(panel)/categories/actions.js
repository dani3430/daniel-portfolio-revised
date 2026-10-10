'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { slugify } from '@/lib/projectValidation'

const FIX_MESSAGE = 'Please fix the highlighted field.'
const SAVE_ERROR = 'Could not save. Please try again.'
const KINDS = ['project', 'post']

// Ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

function refreshSite() {
  revalidatePath('/', 'layout')
}

export async function saveCategoryAction(previousState, formData) {
  await requireAdmin()

  const id = readId(formData)
  const isEdit = formData.has('id')
  const kind = String(formData.get('kind') ?? '')
  const values = { name: String(formData.get('name') ?? '').trim() }

  const errors = {}
  if (values.name.length < 2 || values.name.length > 60) {
    errors.name = 'Enter a name (2 to 60 characters).'
  }
  const slug = slugify(values.name)
  if (!errors.name && !slug) {
    errors.name = 'Use at least some letters or numbers (a to z, 0 to 9).'
  }

  if (isEdit && !id) return { values, errors: {}, message: 'This category could not be found.', saved: false }
  if (!isEdit && !KINDS.includes(kind)) return { values, errors: {}, message: SAVE_ERROR, saved: false }
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE, saved: false }

  const sql = getSql()
  try {
    if (isEdit) {
      // Only the name changes. The web address part (slug) stays the same.
      await sql`UPDATE categories SET name = ${values.name} WHERE id = ${id}`
    } else {
      // New categories go to the end of their list. A repeated name is refused.
      const rows = await sql`
        INSERT INTO categories (kind, name, slug, sort_order)
        VALUES (
          ${kind}, ${values.name}, ${slug},
          (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM categories WHERE kind = ${kind})
        )
        ON CONFLICT (kind, slug) DO NOTHING
        RETURNING id
      `
      if (rows.length === 0) {
        return {
          values,
          errors: { name: 'A category with this name already exists.' },
          message: FIX_MESSAGE,
          saved: false,
        }
      }
    }
  } catch (error) {
    console.error('Could not save the category:', error)
    return { values, errors: {}, message: SAVE_ERROR, saved: false }
  }

  refreshSite()
  // After adding a category, the form is cleared ready for the next one
  return { values: isEdit ? values : { name: '' }, errors: {}, message: '', saved: true }
}

// Moves a category one place up or down inside its own list
export async function moveCategoryAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  const direction = String(formData.get('direction') ?? '')
  if (!id || !['up', 'down'].includes(direction)) return

  const sql = getSql()
  const found = await sql`SELECT kind FROM categories WHERE id = ${id}`
  if (found.length === 0) return

  const rows = await sql`
    SELECT id FROM categories WHERE kind = ${found[0].kind} ORDER BY sort_order, id
  `
  const ids = rows.map((row) => String(row.id))

  const index = ids.indexOf(id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= ids.length) return

  ;[ids[index], ids[target]] = [ids[target], ids[index]]

  // Writes the new positions 0, 1, 2... in one query
  const order = ids.map((value, position) => ({ id: Number(value), pos: position }))
  await sql`
    UPDATE categories SET sort_order = t.pos
    FROM jsonb_to_recordset(${JSON.stringify(order)}::jsonb) AS t(id bigint, pos int)
    WHERE categories.id = t.id
  `
  refreshSite()
}

// Projects and posts that used this category are kept. They simply have no category afterwards.
export async function deleteCategoryAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  await getSql()`DELETE FROM categories WHERE id = ${id}`
  refreshSite()
  redirect('/admin/categories')
}