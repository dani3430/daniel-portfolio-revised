import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import LocalTime from '@/components/admin/LocalTime'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import {
  togglePublishedAction,
  toggleFeaturedAction,
  moveProjectAction,
  deleteProjectAction,
} from './actions'

export const metadata = {
  title: 'Projects | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const smallButton =
  'rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg'

// A small button that sends one action for one project
function ActionButton({ action, id, label, ariaLabel, extra, disabled = false }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {extra &&
        Object.entries(extra).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <button type="submit" className={smallButton} disabled={disabled} aria-label={ariaLabel}>
        {label}
      </button>
    </form>
  )
}

export default async function AdminProjectsPage() {
  await requireAdmin()

  const projects = await getSql()`
    SELECT p.id, p.title, p.slug, p.short_description, p.tech, p.featured, p.published,
           p.updated_at, c.name AS category
    FROM projects p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.sort_order, p.id
  `

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-fg">Projects</h1>
          <p className="mt-2 text-sm text-muted">
            Projects shown on your website. Use the arrows to change their order.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-8 max-w-md rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">No projects yet</p>
          <p className="mt-2 text-sm text-muted">Add your first project to show it on your website.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-display text-lg font-semibold text-fg">
                    {project.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {project.category || 'No category'} &middot; Updated{' '}
                    <LocalTime value={new Date(project.updated_at).toISOString()} />
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      project.published
                        ? 'border-brand/50 bg-brand/10 text-brand'
                        : 'border-line text-muted'
                    }`}
                  >
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                  {project.featured && (
                    <span className="rounded-full border border-brand/50 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted">{project.short_description}</p>

              {project.tech.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technologies">
                  {project.tech.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line bg-bg px-2.5 py-0.5 text-xs text-fg"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Link href={`/admin/projects/${project.id}`} className={smallButton}>
                  Edit
                </Link>
                <ActionButton
                  action={togglePublishedAction}
                  id={project.id}
                  label={project.published ? 'Unpublish' : 'Publish'}
                />
                <ActionButton
                  action={toggleFeaturedAction}
                  id={project.id}
                  label={project.featured ? 'Unfeature' : 'Feature'}
                />
                <ActionButton
                  action={moveProjectAction}
                  id={project.id}
                  extra={{ direction: 'up' }}
                  label={'\u2191'}
                  ariaLabel={`Move ${project.title} up`}
                  disabled={index === 0}
                />
                <ActionButton
                  action={moveProjectAction}
                  id={project.id}
                  extra={{ direction: 'down' }}
                  label={'\u2193'}
                  ariaLabel={`Move ${project.title} down`}
                  disabled={index === projects.length - 1}
                />
                <div className="ml-auto">
                  <ConfirmDeleteButton
                    id={project.id}
                    action={deleteProjectAction}
                    itemName="project"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}