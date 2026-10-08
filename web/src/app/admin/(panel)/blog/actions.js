'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { validatePost } from '@/lib/postValidation'

// Post ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

// Makes the public website show the change immediately
function refreshSite() {
  revalidatePath('/', 'layout')
}

// Draft -> published (using today's date if none was set). Published or scheduled -> draft.
export async function togglePostPublishedAction(formData) {
  await requireAdmin()
  const id = readId(formData)
  if (!id) return

  await getSql()`
    UPDATE posts SET
      status = CASE WHEN status = 'published' THEN 'draft' ELSE 'published' END,
      published_at = CASE WHEN status = 'published' THEN published_at ELSE COALESCE(published_at, now()) END,
      updated_at = now()
    WHERE id = ${id}
  `
  refreshSite()
}

export async function togglePostFeaturedAction(formData) {
  await requireAdmin()
  const id = readId(formData)
  if (!id) return

  await getSql()`UPDATE posts SET featured = NOT featured, updated_at = now() WHERE id = ${id}`
  refreshSite()
}

export async function deletePostAction(formData) {
  await requireAdmin()
  const id = readId(formData)
  if (!id) return

  await getSql()`DELETE FROM posts WHERE id = ${id}`
  refreshSite()
  redirect('/admin/blog')
}

// ---------- Create and edit ----------

const FIX_MESSAGE = 'Please fix the highlighted fields.'
const SAVE_ERROR = 'Could not save the post. Please try again.'

async function checkCategory(sql, categoryId) {
  if (!categoryId) return ''
  const rows = await sql`SELECT id FROM categories WHERE id = ${categoryId} AND kind = 'post'`
  return rows.length === 0 ? 'Choose a category from the list.' : ''
}

export async function createPostAction(previousState, formData) {
  await requireAdmin()

  const { values, clean, errors } = validatePost(formData)
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE }

  const sql = getSql()
  try {
    const categoryError = await checkCategory(sql, clean.categoryId)
    if (categoryError) return { values, errors: { categoryId: categoryError }, message: FIX_MESSAGE }

    // One statement: the post and its tags are saved together or not at all
    await sql`
      WITH created AS (
        INSERT INTO posts
          (slug, title, excerpt, content, category_id, featured, status, published_at,
           seo_title, seo_description)
        VALUES
          (${clean.slug}, ${clean.title}, ${clean.excerpt}, ${clean.content}, ${clean.categoryId},
           ${clean.featured}, ${clean.status}, ${clean.publishedAt}::timestamptz,
           ${clean.seoTitle}, ${clean.seoDescription})
        RETURNING id
      ),
      new_tags AS (
        INSERT INTO tags (name, slug)
        SELECT x.name, x.slug
        FROM jsonb_to_recordset(${JSON.stringify(clean.tags)}::jsonb) AS x(name text, slug text)
        ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
        RETURNING id
      )
      INSERT INTO post_tags (post_id, tag_id)
      SELECT created.id, new_tags.id FROM created, new_tags
    `
  } catch (error) {
    // 23505 means the web address (slug) already exists
    if (error?.code === '23505') {
      return {
        values,
        errors: { slug: 'This web address is already used by another post.' },
        message: FIX_MESSAGE,
      }
    }
    console.error('Could not create the post:', error)
    return { values, errors: {}, message: SAVE_ERROR }
  }

  refreshSite()
  redirect('/admin/blog')
}

export async function updatePostAction(previousState, formData) {
  await requireAdmin()

  const id = readId(formData)
  const { values, clean, errors } = validatePost(formData)
  if (!id) return { values, errors: {}, message: 'This post could not be found.' }
  if (Object.keys(errors).length > 0) return { values, errors, message: FIX_MESSAGE }

  const sql = getSql()
  try {
    const categoryError = await checkCategory(sql, clean.categoryId)
    if (categoryError) return { values, errors: { categoryId: categoryError }, message: FIX_MESSAGE }

    const rows = await sql`
      WITH updated AS (
        UPDATE posts SET
          slug = ${clean.slug},
          title = ${clean.title},
          excerpt = ${clean.excerpt},
          content = ${clean.content},
          category_id = ${clean.categoryId},
          featured = ${clean.featured},
          status = ${clean.status},
          published_at = ${clean.publishedAt}::timestamptz,
          seo_title = ${clean.seoTitle},
          seo_description = ${clean.seoDescription},
          updated_at = now()
        WHERE id = ${id}
        RETURNING id
      ),
      new_tags AS (
        INSERT INTO tags (name, slug)
        SELECT x.name, x.slug
        FROM jsonb_to_recordset(${JSON.stringify(clean.tags)}::jsonb) AS x(name text, slug text)
        ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
        RETURNING id
      ),
      removed AS (
        DELETE FROM post_tags
        WHERE post_id IN (SELECT id FROM updated)
          AND tag_id NOT IN (SELECT id FROM new_tags)
      ),
      added AS (
        INSERT INTO post_tags (post_id, tag_id)
        SELECT updated.id, new_tags.id FROM updated, new_tags
        ON CONFLICT DO NOTHING
      )
      SELECT id FROM updated
    `
    if (rows.length === 0) {
      return { values, errors: {}, message: 'This post could not be found. It may have been deleted.' }
    }
  } catch (error) {
    if (error?.code === '23505') {
      return {
        values,
        errors: { slug: 'This web address is already used by another post.' },
        message: FIX_MESSAGE,
      }
    }
    console.error('Could not update the post:', error)
    return { values, errors: {}, message: SAVE_ERROR }
  }

  refreshSite()
  redirect('/admin/blog')
}