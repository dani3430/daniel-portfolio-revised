import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import LocalTime from '@/components/admin/LocalTime'

export const metadata = {
  title: 'Messages | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

const FILTERS = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
  { key: 'archived', label: 'Archived' },
  { key: 'all', label: 'All' },
]

// Makes visitor-typed search text safe to use inside a LIKE pattern
function escapeLike(text) {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`)
}

function buildUrl({ filter, q, page }) {
  const params = new URLSearchParams()
  if (filter && filter !== 'inbox') params.set('filter', filter)
  if (q) params.set('q', q)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/admin/messages?${query}` : '/admin/messages'
}

export default async function MessagesPage({ searchParams }) {
  await requireAdmin()

  // What the admin asked for in the address bar (all of it is checked)
  const query = await searchParams
  const filter = FILTERS.some((item) => item.key === query.filter) ? query.filter : 'inbox'
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const requestedPage = Number.parseInt(query.page, 10)
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 10000
      ? requestedPage
      : 1

  // Build the WHERE part with numbered placeholders, so nothing typed is ever pasted into SQL
  const conditions = []
  const params = []
  if (filter === 'inbox') {
    conditions.push(`status <> 'archived'`)
  } else if (filter !== 'all') {
    params.push(filter)
    conditions.push(`status = $${params.length}`)
  }
  if (q) {
    params.push(`%${escapeLike(q)}%`)
    const n = params.length
    conditions.push(
      `(name ILIKE $${n} OR email ILIKE $${n} OR subject ILIKE $${n} OR message ILIKE $${n} OR COALESCE(company, '') ILIKE $${n})`,
    )
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const sql = getSql()
  const [countRows, totalRows] = await Promise.all([
    sql`
      SELECT count(*) FILTER (WHERE status <> 'archived')::int AS inbox,
             count(*) FILTER (WHERE status = 'unread')::int AS unread,
             count(*) FILTER (WHERE status = 'read')::int AS read,
             count(*) FILTER (WHERE status = 'archived')::int AS archived,
             count(*)::int AS "all"
      FROM messages
    `,
    sql.query(`SELECT count(*)::int AS total FROM messages ${where}`, params),
  ])
  const counts = countRows[0]
  const total = totalRows[0].total
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const offset = (currentPage - 1) * PAGE_SIZE

  const rows = await sql.query(
    `SELECT id, name, email, subject, left(message, 140) AS preview, status, created_at,
            (NOT email_notified OR NOT autoreply_sent OR NOT telegram_notified) AS notify_issue
     FROM messages
     ${where}
     ORDER BY created_at DESC
     LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    params,
  )

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Messages</h1>
      <p className="mt-2 text-sm text-muted">Messages sent through your contact form.</p>

      {/* Filters */}
      <nav aria-label="Message filters" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = item.key === filter
          return (
            <Link
              key={item.key}
              href={buildUrl({ filter: item.key, q, page: 1 })}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                active
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'border-line bg-surface text-muted hover:border-brand hover:text-fg'
              }`}
            >
              {item.label} ({counts[item.key]})
            </Link>
          )
        })}
      </nav>

      {/* Search */}
      <form action="/admin/messages" method="get" role="search" className="mt-4 flex max-w-xl gap-2">
        {filter !== 'inbox' && <input type="hidden" name="filter" value={filter} />}
        <label htmlFor="search" className="sr-only">
          Search messages
        </label>
        <input
          id="search"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          placeholder="Search name, email, subject or text"
          className="block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Search
        </button>
        {q && (
          <Link
            href={buildUrl({ filter, q: '', page: 1 })}
            className="flex items-center px-2 text-sm text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Clear
          </Link>
        )}
      </form>

      {/* List */}
      {rows.length === 0 ? (
        <div className="mt-8 max-w-md rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">
            {q ? 'No messages match your search' : 'No messages here'}
          </p>
          <p className="mt-2 text-sm text-muted">
            {q
              ? 'Try different words, or clear the search.'
              : 'New messages from your contact form will appear here.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {rows.map((row) => {
            const unread = row.status === 'unread'
            return (
              <li key={row.id}>
                <Link
                  href={`/admin/messages/${row.id}`}
                  className="flex gap-3 px-4 py-4 transition-colors hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${unread ? 'bg-brand' : 'bg-transparent'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className={`truncate text-sm text-fg ${unread ? 'font-semibold' : ''}`}>
                        {unread && <span className="sr-only">Unread. </span>}
                        {row.status === 'archived' && <span className="sr-only">Archived. </span>}
                        {row.name} <span className="font-normal text-muted">&lt;{row.email}&gt;</span>
                      </p>
                      <p className="text-xs text-muted">
                        <LocalTime value={new Date(row.created_at).toISOString()} />
                      </p>
                    </div>
                    <p className={`mt-1 truncate text-sm text-fg ${unread ? 'font-semibold' : ''}`}>
                      {row.subject}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">{row.preview}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.status === 'archived' && (
                        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                          Archived
                        </span>
                      )}
                      {row.notify_issue && (
                        <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                          Some notifications did not send
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {/* Pages */}
      {totalPages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between text-sm">
          {currentPage > 1 ? (
            <Link
              href={buildUrl({ filter, q, page: currentPage - 1 })}
              className="rounded-lg border border-line bg-surface px-4 py-2 font-medium text-fg hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
             Newer
            </Link>
          ) : (
            <span />
          )}
          <p className="text-muted">
            Page {currentPage} of {totalPages}
          </p>
          {currentPage < totalPages ? (
            <Link
              href={buildUrl({ filter, q, page: currentPage + 1 })}
              className="rounded-lg border border-line bg-surface px-4 py-2 font-medium text-fg hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  )
}