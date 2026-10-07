'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { validateProject } from '@/lib/projectValidation'

// Project ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

// Makes the public website show the change immediately
function refreshSite() {
  revalidatePath('/', 'layout')
}

export async function togglePublishedAction(formData) {
  await requireAdmin()
  const id = readId(formData)
  if (!id) return

  await getSql()`UPDATE projects SET published = NOT published, updated_at = now() WHERE id = ${id}`
  refreshSite()
}

export async function toggleFeaturedAction(formData) {
  await requireAdmin()
  const id = readId(formData)
  if (!id) return

  await getSql()`UPDATE projects SET featured = NOT featured, updated_at = now() WHERE id = ${id}`
  refreshSite()
}

// Moves a project one place up or down by swapping it with its neighbour
export async function moveProjectAction(formData) {
  await requireAdmin()
  const id = readId(formData)
  const direction = String(formData.get('direction') ?? '')
  if (!id || !['up', 'down'].includes(direction)) return

  const sql = getSql()
  const rows = await sql`SELECT id FROM projects ORDER BY sort_order, id`
  const ids = rows.map((row) => String(row.id))

  const index = ids.indexOf(id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= ids.length) return

  ;[ids[index], ids[target]] = [ids[target], ids[index]]

  // Writes the new positions 0, 1, 2... in one query
  const order = ids.map((value, position) => ({ id: Number(value), pos: position }))
  await sql`
    UPDATE projects SET sort_order = t.pos
    FROM jsonb_to_recordset(${JSON.stringify(order)}::jsonb) AS t(id bigint, pos int)
    WHERE projects.id = t.id
  `
  refreshSite()
}

export async function deleteProjectAction(formData) {
  await requireAdmin()
  const id = readId(formData)
  if (!id) return

  await getSql()`DELETE FROM projects WHERE id = ${id}`
  refreshSite()
  redirect('/admin/projects')
}

// ---------- Create and edit ----------

const FIX_MESSAGE = 'Please fix the highlighted fields.'
const SAVE_ERROR = 'Could not save the project. Please try again.'

// Returns an error text if the chosen category is not a real project category
async function checkCategory(sql, categoryId) {
  if (!categoryId) return ''
  const rows = await sql`SELECT id FROM categories WHERE id = ${categoryId} AND kind = 'project'`
  return rows.length === 0 ? 'Choose a category from the list.' : ''
}

export async function createProjectAction(previousState, formData) {
  await requireAdmin()

  const { values, clean, errors } = validateProject(formData)
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE }

  const sql = getSql()
  try {
    const categoryError = await checkCategory(sql, clean.categoryId)
    if (categoryError) return { values, errors: { categoryId: categoryError }, message: FIX_MESSAGE }

    // New projects go to the end of the list
    await sql`
      INSERT INTO projects
        (slug, title, short_description, full_description, category_id, tech,
         github_url, live_url, featured, published, sort_order)
      VALUES
        (${clean.slug}, ${clean.title}, ${clean.shortDescription}, ${clean.fullDescription},
         ${clean.categoryId},
         ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(clean.tech)}::jsonb)),
         ${clean.githubUrl}, ${clean.liveUrl}, ${clean.featured}, ${clean.published},
         (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM projects))
    `
  } catch (error) {
    // 23505 means the web address (slug) already exists
    if (error?.code === '23505') {
      return {
        values,
        errors: { slug: 'This web address is already used by another project.' },
        message: FIX_MESSAGE,
      }
    }
    console.error('Could not create the project:', error)
    return { values, errors: {}, message: SAVE_ERROR }
  }

  refreshSite()
  redirect('/admin/projects')
}

export async function updateProjectAction(previousState, formData) {
  await requireAdmin()

  const id = readId(formData)
  const { values, clean, errors } = validateProject(formData)
  if (!id) return { values, errors: {}, message: 'This project could not be found.' }
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE }

  const sql = getSql()
  try {
    const categoryError = await checkCategory(sql, clean.categoryId)
    if (categoryError) return { values, errors: { categoryId: categoryError }, message: FIX_MESSAGE }

    const rows = await sql`
      UPDATE projects SET
        slug = ${clean.slug},
        title = ${clean.title},
        short_description = ${clean.shortDescription},
        full_description = ${clean.fullDescription},
        category_id = ${clean.categoryId},
        tech = ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(clean.tech)}::jsonb)),
        github_url = ${clean.githubUrl},
        live_url = ${clean.liveUrl},
        featured = ${clean.featured},
        published = ${clean.published},
        updated_at = now()
      WHERE id = ${id}
      RETURNING id
    `
    if (rows.length === 0) {
      return { values, errors: {}, message: 'This project could not be found. It may have been deleted.' }
    }
  } catch (error) {
    if (error?.code === '23505') {
      return {
        values,
        errors: { slug: 'This web address is already used by another project.' },
        message: FIX_MESSAGE,
      }
    }
    console.error('Could not update the project:', error)
    return { values, errors: {}, message: SAVE_ERROR }
  }

  refreshSite()
  redirect('/admin/projects')
}