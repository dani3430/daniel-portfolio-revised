'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

const FIX_MESSAGE = 'Please fix the highlighted fields.'
const SAVE_ERROR = 'Could not save your profile. Please try again.'

function clean(formData) {
  return {
    fullName: String(formData.get('fullName') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    tagline: String(formData.get('tagline') ?? '').trim(),
    bio: String(formData.get('bio') ?? '').trim(),
  }
}

// Checks every field on the server too. Browser checks alone are never trusted.
function validate(values) {
  const errors = {}

  if (values.fullName.length < 2 || values.fullName.length > 80) {
    errors.fullName = 'Enter your name (2 to 80 characters).'
  }
  if (values.title.length < 2 || values.title.length > 100) {
    errors.title = 'Enter your professional title (2 to 100 characters).'
  }
  if (values.tagline.length > 300) {
    errors.tagline = 'Keep the introduction under 300 characters.'
  }
  if (values.bio.length > 3000) {
    errors.bio = 'Keep the short bio under 3000 characters.'
  }

  return errors
}

export async function saveProfileAction(previousState, formData) {
  await requireAdmin()

  const values = clean(formData)
  const errors = validate(values)
  if (Object.keys(errors).length > 0) {
    return { values, errors, message: FIX_MESSAGE, saved: false }
  }

  try {
    // Creates the profile row the first time, and updates only these four fields after that
    await getSql()`
      INSERT INTO profile (id, full_name, title, tagline, bio)
      VALUES (1, ${values.fullName}, ${values.title}, ${values.tagline || null}, ${values.bio || null})
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        title = EXCLUDED.title,
        tagline = EXCLUDED.tagline,
        bio = EXCLUDED.bio,
        updated_at = now()
    `
  } catch (error) {
    console.error('Could not save the profile:', error)
    return { values, errors: {}, message: SAVE_ERROR, saved: false }
  }

  // Makes the public website show the change right away
  revalidatePath('/', 'layout')
  return { values, errors: {}, message: '', saved: true }
}

// ---------- About page content ----------

// Blank line between paragraphs. Empty and repeated paragraphs are dropped.
function toParagraphs(text) {
  const parts = String(text ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
  return [...new Set(parts)]
}

// One item per line. Empty and repeated lines are dropped.
function toLines(text) {
  const parts = String(text ?? '')
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
  return [...new Set(parts)]
}

function tooLong(items, max) {
  return items.some((item) => item.length > max)
}

export async function saveAboutAction(previousState, formData) {
  await requireAdmin()

  const raw = {
    journey: String(formData.get('journey') ?? ''),
    goals: String(formData.get('goals') ?? ''),
    interests: String(formData.get('interests') ?? ''),
  }
  const journey = toParagraphs(raw.journey)
  const goals = toLines(raw.goals)
  const interests = toLines(raw.interests)

  const errors = {}
  if (journey.length > 8 || tooLong(journey, 1500)) {
    errors.journey = 'Use at most 8 paragraphs, each under 1500 characters.'
  }
  if (goals.length > 10 || tooLong(goals, 60)) {
    errors.goals = 'Use at most 10 goals, one per line, each under 60 characters.'
  }
  if (interests.length > 12 || tooLong(interests, 80)) {
    errors.interests = 'Use at most 12 interests, one per line, each under 80 characters.'
  }
  if (Object.keys(errors).length > 0) {
    return { values: raw, errors, message: FIX_MESSAGE, saved: false }
  }

  try {
    const rows = await getSql()`
      UPDATE profile
      SET journey = ${JSON.stringify(journey)}::jsonb,
          goals = ${JSON.stringify(goals)}::jsonb,
          interests = ${JSON.stringify(interests)}::jsonb,
          updated_at = now()
      WHERE id = 1
      RETURNING id
    `
    if (rows.length === 0) {
      return {
        values: raw,
        errors: {},
        message: 'Save your name and title in the form above first.',
        saved: false,
      }
    }
  } catch (error) {
    console.error('Could not save the About content:', error)
    return { values: raw, errors: {}, message: 'Could not save. Please try again.', saved: false }
  }

  revalidatePath('/', 'layout')
  return { values: raw, errors: {}, message: '', saved: true }
}