import { requireAdmin } from '@/lib/auth'
import { getSiteSettings } from '@/lib/content'
import SettingsForm from '@/components/admin/SettingsForm'

export const metadata = {
  title: 'Settings | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  await requireAdmin()

  const settings = await getSiteSettings()

  const initial = {
    siteTitle: settings.site?.title ?? '',
    siteDescription: settings.site?.description ?? '',
    heroTech: (settings.hero?.tech ?? []).join('\n'),
    footerText: settings.footer?.text ?? '',
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Search engine information, the technology highlights on the home page, and the footer
        text.
      </p>

      <SettingsForm initial={initial} />
    </>
  )
}