import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

export default async function AdminDashboardPage() {
  // Checked here as well as in the layout, so this page is protected on its own
  await requireAdmin()

  const sql = getSql()
  const [messages, projects, posts] = await Promise.all([
    sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE status = 'unread')::int AS unread FROM messages`,
    sql`SELECT count(*)::int AS total FROM projects`,
    sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE status = 'published')::int AS published FROM posts`,
  ])

  const cards = [
    { label: 'Messages', value: messages[0].total, note: `${messages[0].unread} unread` },
    { label: 'Projects', value: projects[0].total, note: 'in the database' },
    { label: 'Blog posts', value: posts[0].total, note: `${posts[0].published} published` },
  ]

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        You are signed in. More tools (messages, projects, blog, CV) will appear here.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
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
    </>
  )
}