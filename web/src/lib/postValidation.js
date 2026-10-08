// Checks the blog post form on the server. Never trust the browser alone.

import { slugify } from '@/lib/projectValidation'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const CATEGORY_ID_PATTERN = /^\d{1,18}$/
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

function readText(formData, name) {
  return String(formData.get(name) ?? '').trim()
}

// Turns "2026-10-12T09:30" plus the browser's time zone offset into a real moment (ISO text)
function parsePublishDate(local, offsetText) {
  if (!local) return { iso: '', error: '' }

  const match = LOCAL_DATE_PATTERN.exec(local)
  const offset = Number.parseInt(offsetText, 10)
  if (!match || !Number.isInteger(offset) || Math.abs(offset) > 840) {
    return { iso: '', error: 'This date could not be understood.' }
  }

  const [, year, month, day, hour, minute] = match.map(Number)
  const check = new Date(Date.UTC(year, month - 1, day))
  const valid =
    year >= 2000 && year <= 2100 &&
    month >= 1 && month <= 12 &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day &&
    hour <= 23 && minute <= 59
  if (!valid) return { iso: '', error: 'This date does not exist.' }

  // getTimezoneOffset() is "UTC minus local" in minutes, so adding it gives UTC
  const moment = new Date(Date.UTC(year, month - 1, day, hour, minute) + offset * 60000)
  return { iso: moment.toISOString(), error: '' }
}

export function validatePost(formData) {
  const values = {
    title: readText(formData, 'title'),
    slug: readText(formData, 'slug'),
    excerpt: readText(formData, 'excerpt'),
    content: String(formData.get('content') ?? '').replace(/\r\n/g, '\n').trim(),
    categoryId: readText(formData, 'categoryId'),
    tags: readText(formData, 'tags'),
    status: formData.get('status') === 'published' ? 'published' : 'draft',
    publishedAt: '',
    featured: formData.get('featured') === 'on',
    seoTitle: readText(formData, 'seoTitle'),
    seoDescription: readText(formData, 'seoDescription'),
  }

  const errors = {}

  if (values.title.length < 2 || values.title.length > 200) {
    errors.title = 'The title must be between 2 and 200 characters.'
  }

  const slug = values.slug || slugify(values.title)
  if (!slug || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    errors.slug = 'Use only lowercase letters, numbers and single hyphens (example: my-first-post).'
  }

  if (values.excerpt.length < 10 || values.excerpt.length > 400) {
    errors.excerpt = 'The summary must be between 10 and 400 characters.'
  }

  if (values.content.length > 50000) {
    errors.content = 'The text can be at most 50,000 characters.'
  } else if (values.status === 'published' && values.content.length < 20) {
    errors.content = 'Write some text before publishing (at least 20 characters).'
  }

  if (values.categoryId && !CATEGORY_ID_PATTERN.test(values.categoryId)) {
    errors.categoryId = 'Choose a category from the list.'
  }

  // Tags: "React, Next.js" becomes [{ name, slug }]
  const seen = new Set()
  const tags = []
  let tagProblem = ''
  for (const name of values.tags.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)) {
    const tagSlug = slugify(name)
    if (name.length > 40) tagProblem = 'Each tag can be at most 40 characters.'
    else if (!tagSlug) tagProblem = 'Each tag needs at least one letter or number.'
    else if (!seen.has(tagSlug)) {
      seen.add(tagSlug)
      tags.push({ name, slug: tagSlug })
    }
  }
  if (!tagProblem && tags.length > 10) tagProblem = 'Use at most 10 tags.'
  if (tagProblem) errors.tags = tagProblem

  const date = parsePublishDate(readText(formData, 'publishedAtLocal'), readText(formData, 'tzOffset'))
  if (date.error) errors.publishedAt = date.error
  values.publishedAt = date.iso

  if (values.seoTitle.length > 70) errors.seoTitle = 'The search title can be at most 70 characters.'
  if (values.seoDescription.length > 200) {
    errors.seoDescription = 'The search description can be at most 200 characters.'
  }

  // A published post with no date goes live right now
  const publishedAt =
    date.iso || (values.status === 'published' ? new Date().toISOString() : null)

  const clean = {
    slug,
    title: values.title,
    excerpt: values.excerpt,
    content: values.content,
    categoryId: values.categoryId || null,
    tags,
    status: values.status,
    publishedAt,
    featured: values.featured,
    seoTitle: values.seoTitle || null,
    seoDescription: values.seoDescription || null,
  }

  return { values, clean, errors }
}