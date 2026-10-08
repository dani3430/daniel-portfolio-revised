import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import LocalTime from '@/components/admin/LocalTime'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import {
  togglePostPublishedAction,
  togglePostFeaturedAction,
  deletePostAction,
} from './actions'

export const metadata = {
  title: 'Blog | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'draft', label: 'Drafts' },
]

// Fixed SQL for each filter. Nothing from the address bar is ever pasted into SQL.
const WHERE = {
  all: '',
  published: `WHERE p.status = 'published' AND p.published_at <= now()`,
  scheduled: `WHERE p.status = 'published' AND p.published_at > now()`,
  draft: `WHERE p.status = 'draft'`,
}

const smallButton =
  'rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

function ActionButton({ action, id, label }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={smallButton}>
        {label}
      </button>
    </form>
  )
}

export default async function AdminBlogPage({ searchParams }) {
  await requireAdmin()

  const query = await searchParams
  const filter = FILTERS.some((item) => item.key === query.filter) ? query.filter : 'all'

  const sql = getSql()
  const [countRows, posts] = await Promise.all([
    sql`
      SELECT count(*)::int AS "all",
             count(*) FILTER (WHERE status = 'published' AND published_at <= now())::int AS published,
             count(*) FILTER (WHERE status = 'published' AND published_at > now())::int AS scheduled,
             count(*) FILTER (WHERE status = 'draft')::int AS draft
      FROM posts
    `,
    sql.query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.status, p.featured, p.published_at, p.updated_at,
             (p.status = 'published' AND p.published_at > now()) AS scheduled,
             c.name AS category
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      ${WHERE[filter]}
      ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id DESC
    `),
  ])
  const counts = countRows[0]

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-fg">Blog</h1>
          <p className="mt-2 text-sm text-muted">
            Write, publish and schedule your articles. Only published posts are visible to visitors.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          New post
        </Link>
      </div>

      <nav aria-label="Post filters" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = item.key === filter
          return (
            <Link
              key={item.key}
              href={item.key === 'all' ? '/admin/blog' : `/admin/blog?filter=${item.key}`}
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

      {posts.length === 0 ? (
        <div className="mt-8 max-w-md rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">No posts here</p>
          <p className="mt-2 text-sm text-muted">
            {filter === 'all'
              ? 'Write your first article with the New post button.'
              : 'There are no posts in this group at the moment.'}
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {posts.map((post) => {
            const state = post.status === 'draft' ? 'Draft' : post.scheduled ? 'Scheduled' : 'Published'
            const isLive = state === 'Published'
            return (
              <li key={post.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-display text-lg font-semibold text-fg">
                      {post.title}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      {post.category || 'No category'} &middot;{' '}
                      {state === 'Draft' ? 'Updated' : state === 'Scheduled' ? 'Goes live' : 'Published'}{' '}
                      <LocalTime
                        value={new Date(state === 'Draft' ? post.updated_at : post.published_at).toISOString()}
                      />
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        isLive
                          ? 'border-brand/50 bg-brand/10 text-brand'
                          : state === 'Scheduled'
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            : 'border-line text-muted'
                      }`}
                    >
                      {state}
                    </span>
                    {post.featured && (
                      <span className="rounded-full border border-brand/50 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted">{post.excerpt}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <Link href={`/admin/blog/${post.id}`} className={smallButton}>
                    Edit
                  </Link>
                  <ActionButton
                    action={togglePostPublishedAction}
                    id={post.id}
                    label={post.status === 'published' ? 'Unpublish' : 'Publish'}
                  />
                  <ActionButton
                    action={togglePostFeaturedAction}
                    id={post.id}
                    label={post.featured ? 'Unfeature' : 'Feature'}
                  />
                  {isLive && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className={smallButton}
                    >
                      View &nearr;
                    </Link>
                  )}
                  <div className="ml-auto">
                    <ConfirmDeleteButton id={post.id} action={deletePostAction} itemName="post" />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}