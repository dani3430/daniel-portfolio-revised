'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

const FIX_MESSAGE = 'Please fix the highlighted fields.'
const SAVE_ERROR = 'Could not save this skill group. Please try again.'

// Group ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

// One skill per line. Empty and repeated lines are dropped.
function toLines(text) {
  const parts = String(text ?? '')
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
  return [...new Set(parts)]
}

function readGroup(formData) {
  const values = {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    items: String(formData.get('items') ?? ''),
  }
  const items = toLines(values.items)

  const errors = {}
  if (values.name.length < 2 || values.name.length > 60) {
    errors.name = 'Enter a group name (2 to 60 characters).'
  }
  if (values.description.length > 200) {
    errors.description = 'Keep the description under 200 characters.'
  }
  if (items.length > 20 || items.some((item) => item.length > 60)) {
    errors.items = 'Use at most 20 skills, one per line, each under 60 characters.'
  }

  return { values, items, errors }
}

export async function saveSkillGroupAction(previousState, formData) {
  await requireAdmin()

  const id = readId(formData)
  const isEdit = formData.has('id')
  const { values, items, errors } = readGroup(formData)

  if (isEdit && !id) return { values, errors: {}, message: 'This group could not be found.', saved: false }
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE, saved: false }

  const sql = getSql()
  const itemsJson = JSON.stringify(items)

  try {
    if (isEdit) {
      // Replaces the group details and its skills together, or changes nothing
      await sql.transaction([
        sql`UPDATE skill_groups SET name = ${values.name}, description = ${values.description || null} WHERE id = ${id}`,
        sql`DELETE FROM skills WHERE group_id = ${id}`,
        sql`
          INSERT INTO skills (group_id, name, sort_order)
          SELECT ${id}::bigint, t.name, t.pos - 1
          FROM jsonb_array_elements_text(${itemsJson}::jsonb) WITH ORDINALITY AS t(name, pos)
        `,
      ])
    } else {
      // New groups go to the end of the list
      await sql`
        WITH g AS (
          INSERT INTO skill_groups (name, description, sort_order)
          VALUES (
            ${values.name},
            ${values.description || null},
            (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM skill_groups)
          )
          RETURNING id
        )
        INSERT INTO skills (group_id, name, sort_order)
        SELECT g.id, t.name, t.pos - 1
        FROM g, jsonb_array_elements_text(${itemsJson}::jsonb) WITH ORDINALITY AS t(name, pos)
      `
    }
  } catch (error) {
    console.error('Could not save the skill group:', error)
    return { values, errors: {}, message: SAVE_ERROR, saved: false }
  }

  revalidatePath('/', 'layout')
  // After adding a group, the form is cleared ready for the next one
  const shown = isEdit ? values : { name: '', description: '', items: '' }
  return { values: shown, errors: {}, message: '', saved: true }
}

export async function deleteSkillGroupAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  // The skills inside the group are removed with it
  await getSql()`DELETE FROM skill_groups WHERE id = ${id}`
  revalidatePath('/', 'layout')
  redirect('/admin/skills')
}