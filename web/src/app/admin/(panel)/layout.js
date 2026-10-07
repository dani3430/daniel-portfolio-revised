import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import AdminNav from '@/components/admin/AdminNav'
import { logoutAction } from '../actions'

export const metadata = {
  title: 'Admin | Daniel Temesgen',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

async function getUnreadCount() {
  try {
    const rows = await getSql()`SELECT count(*)::int AS total FROM messages WHERE status = 'unread'`
    return rows[0].total
  } catch (error) {
    console.error('Could not count unread messages:', error)
    return 0
  }
}

export default async function AdminLayout({ children }) {
  const admin = await requireAdmin()
  const unreadCount = await getUnreadCount()

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <p className="font-display text-base font-semibold text-fg">Admin</p>
            <Link
              href="/"
              target="_blank"
              className="text-sm text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View site
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{admin.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-line bg-bg px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <AdminNav unreadCount={unreadCount} />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  )
}