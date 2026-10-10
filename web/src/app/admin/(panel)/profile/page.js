import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import ProfileForm from '@/components/admin/ProfileForm'
import AboutContentForm from '@/components/admin/AboutContentForm'

export const metadata = {
  title: 'Profile | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  await requireAdmin()

  const rows = await getSql()`
    SELECT full_name, title, tagline, bio, journey, goals, principles, interests FROM profile WHERE id = 1
  `
  const row = rows[0]

  const initial = {
    fullName: row?.full_name ?? '',
    title: row?.title ?? '',
    tagline: row?.tagline ?? '',
    bio: row?.bio ?? '',
  }

  const asList = (value) => (Array.isArray(value) ? value : [])
  const aboutInitial = {
    journey: asList(row?.journey).join('\n\n'),
    goals: asList(row?.goals).join('\n'),
    principles: asList(row?.principles)
      .map((item) => `${item.title}\n${item.text}`)
      .join('\n\n'),
    interests: asList(row?.interests).join('\n'),
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Profile</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Your name, title and introduction. These appear on the home page, the About page and in
        search results.
      </p>

      <ProfileForm initial={initial} />

      <h2 className="mt-14 font-display text-2xl font-bold text-fg">About page content</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Your story, goals and interests. These are saved separately from the form above.
      </p>

      <AboutContentForm initial={aboutInitial} />
    </>
  )
}