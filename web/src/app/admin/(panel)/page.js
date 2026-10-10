import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

export const metadata = {
  title: 'Dashboard | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })

function formatDate(value) {
  return value ? dateFormat.format(new Date(value)) : ''
}

function Badge({ children, tone = 'plain' }) {
  const tones = {
    plain: 'border-line text-muted',
    good: 'border-brand/50 text-brand',
    alert: 'border-red-500/50 text-red-700 dark:text-red-300',
  }
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

function RecentList({ title, viewAllHref, emptyText, items }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block rounded-lg py-3 transition-colors hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0 font-medium text-fg">
                    <span className="block truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="block truncate text-sm font-normal text-muted">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                  {item.badge}
                </span>
                <span className="mt-1 block text-xs text-muted">{item.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default async function AdminDashboardPage() {
  // Checked here as well as in the layout, so this page is protected on its own
  await requireAdmin()

  const sql = getSql()
  const [counts, recentMessages, recentProjects, recentPosts] = await Promise.all([
    sql`
      SELECT
        (SELECT count(*)::int FROM messages) AS messages_total,
        (SELECT count(*)::int FROM messages WHERE status = 'unread') AS messages_unread,
        (SELECT count(*)::int FROM projects) AS projects_total,
        (SELECT count(*)::int FROM projects WHERE published) AS projects_published,
        (SELECT count(*)::int FROM posts) AS posts_total,
        (SELECT count(*)::int FROM posts WHERE status = 'published') AS posts_published,
        (SELECT count(*)::int FROM cv_files WHERE is_current AND published) AS cv_live
    `,
    sql`SELECT id, name, subject, status, created_at FROM messages ORDER BY created_at DESC LIMIT 5`,
    sql`SELECT id, title, published, updated_at FROM projects ORDER BY updated_at DESC LIMIT 5`,
    sql`SELECT id, title, status, updated_at FROM posts ORDER BY updated_at DESC LIMIT 5`,
  ])
  const c = counts[0]

  const cards = [
    { label: 'Messages', value: c.messages_total, note: `${c.messages_unread} unread` },
    {
      label: 'Projects',
      value: c.projects_total,
      note: `${c.projects_published} published`,
    },
    {
      label: 'Blog posts',
      value: c.posts_total,
      note: `${c.posts_published} published, ${c.posts_total - c.posts_published} draft`,
    },
    {
      label: 'CV',
      value: c.cv_live > 0 ? 'Live' : 'None',
      note: c.cv_live > 0 ? 'Visitors can download it' : 'No CV published',
    },
  ]

  const messageItems = recentMessages.map((row) => ({
    id: String(row.id),
    href: `/admin/messages/${row.id}`,
    title: row.name,
    subtitle: row.subject,
    date: formatDate(row.created_at),
    badge: row.status === 'unread' ? <Badge tone="alert">Unread</Badge> : null,
  }))

  const projectItems = recentProjects.map((row) => ({
    id: String(row.id),
    href: `/admin/projects/${row.id}`,
    title: row.title,
    date: `Updated ${formatDate(row.updated_at)}`,
    badge: <Badge tone={row.published ? 'good' : 'plain'}>{row.published ? 'Published' : 'Hidden'}</Badge>,
  }))

  const postItems = recentPosts.map((row) => ({
    id: String(row.id),
    href: `/admin/blog/${row.id}`,
    title: row.title,
    date: `Updated ${formatDate(row.updated_at)}`,
    badge: <Badge tone={row.status === 'published' ? 'good' : 'plain'}>{row.status === 'published' ? 'Published' : 'Draft'}</Badge>,
  }))

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">A quick look at your portfolio.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl font-bold text-fg">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.note}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <RecentList
          title="Recent messages"
          viewAllHref="/admin/messages"
          emptyText="No messages yet."
          items={messageItems}
        />
        <RecentList
          title="Recent projects"
          viewAllHref="/admin/projects"
          emptyText="No projects yet."
          items={projectItems}
        />
        <RecentList
          title="Recent blog posts"
          viewAllHref="/admin/blog"
          emptyText="No blog posts yet."
          items={postItems}
        />
      </div>
    </>
  )
}