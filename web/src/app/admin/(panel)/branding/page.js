import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { SLOTS, SLOT_KEYS } from '@/lib/brandingSlots'
import SlotUploader from '@/components/admin/SlotUploader'

export const metadata = {
  title: 'Branding | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function BrandingPage() {
  await requireAdmin()

  const sql = getSql()
  const settings = await sql`SELECT value FROM site_settings WHERE key = 'branding'`
  const branding = settings[0]?.value ?? {}

  // Look up the files that are assigned to a slot
  const ids = SLOT_KEYS.map((key) => branding[key]).filter(Boolean)
  const files =
    ids.length > 0
      ? await sql`
          SELECT id, url FROM media
          WHERE id IN (SELECT (jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb))::bigint)
        `
      : []
  const urlById = new Map(files.map((file) => [String(file.id), file.url]))

  const slots = SLOT_KEYS.map((key) => ({
    key,
    ...SLOTS[key],
    current: urlById.get(String(branding[key])) ?? null,
  }))

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Branding</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Upload your logo, profile photo and favicon. Images go to Cloudinary, and an old image is
        deleted when you replace it. Your original files stay safe on your own computer.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {slots.map((slot) => (
          <SlotUploader key={slot.key} slot={slot} />
        ))}
      </div>
    </>
  )
}