'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

const FIX_MESSAGE = 'Please fix the highlighted fields.'
const SAVE_ERROR = 'Could not save the settings. Please try again.'

// One item per line. Empty and repeated lines are dropped.
function toLines(text) {
  const parts = String(text ?? '')
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
  return [...new Set(parts)]
}

export async function saveSettingsAction(previousState, formData) {
  await requireAdmin()

  const values = {
    siteTitle: String(formData.get('siteTitle') ?? '').trim(),
    siteDescription: String(formData.get('siteDescription') ?? '').trim(),
    heroTech: String(formData.get('heroTech') ?? ''),
    footerText: String(formData.get('footerText') ?? '').trim(),
  }
  const tech = toLines(values.heroTech)

  const errors = {}
  if (values.siteTitle.length < 5 || values.siteTitle.length > 70) {
    errors.siteTitle = 'Enter a site title (5 to 70 characters).'
  }
  if (values.siteDescription.length < 20 || values.siteDescription.length > 200) {
    errors.siteDescription = 'Enter a description (20 to 200 characters).'
  }
  if (tech.length > 10 || tech.some((item) => item.length > 30)) {
    errors.heroTech = 'Use at most 10 technologies, one per line, each under 30 characters.'
  }
  if (values.footerText.length > 200) {
    errors.footerText = 'Keep the footer text under 200 characters.'
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors, message: FIX_MESSAGE, saved: false }
  }

  const entries = {
    site: { title: values.siteTitle, description: values.siteDescription },
    hero: { tech },
    footer: { text: values.footerText },
  }

  try {
    const sql = getSql()
    // All three settings are saved together, or none of them
    await sql.transaction(
      Object.entries(entries).map(
        ([key, value]) => sql`
          INSERT INTO site_settings (key, value)
          VALUES (${key}, ${JSON.stringify(value)}::jsonb)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        `,
      ),
    )
  } catch (error) {
    console.error('Could not save the settings:', error)
    return { values, errors: {}, message: SAVE_ERROR, saved: false }
  }

  revalidatePath('/', 'layout')
  return { values, errors: {}, message: '', saved: true }
}