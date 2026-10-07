// Checks the project form on the server. Never trust the browser alone.

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const CATEGORY_ID_PATTERN = /^\d{1,18}$/

function readText(formData, name) {
  return String(formData.get(name) ?? '').trim()
}

// "Addis Eats!" becomes "addis-eats"
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

// Only http and https links are allowed
function checkUrl(value) {
  if (!value) return ''
  if (value.length > 500) return 'This web address is too long.'
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return 'The web address must start with https:// or http://'
    }
    return ''
  } catch {
    return 'This is not a valid web address. Example: https://example.com'
  }
}

// Returns the values as typed (to show again if something is wrong),
// the cleaned values (to save), and a list of problems.
export function validateProject(formData) {
  const values = {
    title: readText(formData, 'title'),
    slug: readText(formData, 'slug'),
    shortDescription: readText(formData, 'shortDescription'),
    fullDescription: String(formData.get('fullDescription') ?? '').trim(),
    categoryId: readText(formData, 'categoryId'),
    tech: readText(formData, 'tech'),
    githubUrl: readText(formData, 'githubUrl'),
    liveUrl: readText(formData, 'liveUrl'),
    featured: formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
  }

  const errors = {}

  if (values.title.length < 2 || values.title.length > 150) {
    errors.title = 'The title must be between 2 and 150 characters.'
  }

  const slug = values.slug || slugify(values.title)
  if (!slug || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    errors.slug = 'Use only lowercase letters, numbers and single hyphens (example: addis-eats).'
  }

  if (values.shortDescription.length < 10 || values.shortDescription.length > 400) {
    errors.shortDescription = 'The short description must be between 10 and 400 characters.'
  }

  if (values.fullDescription.length > 5000) {
    errors.fullDescription = 'The full description can be at most 5000 characters.'
  }

  if (values.categoryId && !CATEGORY_ID_PATTERN.test(values.categoryId)) {
    errors.categoryId = 'Choose a category from the list.'
  }

  const tech = [
    ...new Set(
      values.tech
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ]
  if (tech.length > 12) {
    errors.tech = 'Use at most 12 technologies.'
  } else if (tech.some((item) => item.length > 40)) {
    errors.tech = 'Each technology name can be at most 40 characters.'
  }

  const githubError = checkUrl(values.githubUrl)
  if (githubError) errors.githubUrl = githubError
  const liveError = checkUrl(values.liveUrl)
  if (liveError) errors.liveUrl = liveError

  const clean = {
    slug,
    title: values.title,
    shortDescription: values.shortDescription,
    fullDescription: values.fullDescription || null,
    categoryId: values.categoryId || null,
    tech,
    githubUrl: values.githubUrl || null,
    liveUrl: values.liveUrl || null,
    featured: values.featured,
    published: values.published,
  }

  return { values, clean, errors }
}