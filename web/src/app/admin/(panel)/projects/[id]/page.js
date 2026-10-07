import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import ProjectForm from '@/components/admin/ProjectForm'
import { updateProjectAction } from '../actions'

export const metadata = {
  title: 'Edit project | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function EditProjectPage({ params }) {
  await requireAdmin()

  const { id } = await params
  if (!/^\d{1,18}$/.test(id)) notFound()

  const sql = getSql()
  const [projects, categories] = await Promise.all([
    sql`
      SELECT id, slug, title, short_description, full_description, category_id, tech,
             github_url, live_url, featured, published
      FROM projects WHERE id = ${id}
    `,
    sql`SELECT id, name FROM categories WHERE kind = 'project' ORDER BY sort_order, id`,
  ])
  if (projects.length === 0) notFound()
  const project = projects[0]

  const initial = {
    title: project.title,
    slug: project.slug,
    shortDescription: project.short_description,
    fullDescription: project.full_description ?? '',
    categoryId: project.category_id ? String(project.category_id) : '',
    tech: project.tech.join(', '),
    githubUrl: project.github_url ?? '',
    liveUrl: project.live_url ?? '',
    featured: project.featured,
    published: project.published,
  }

  return (
    <>
      <Link
        href="/admin/projects"
        className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        &larr; Back to projects
      </Link>
      <h1 className="mt-6 mb-8 break-words font-display text-3xl font-bold text-fg">
        Edit: {project.title}
      </h1>
      <ProjectForm
        action={updateProjectAction}
        initial={initial}
        projectId={String(project.id)}
        categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
        submitLabel="Save changes"
      />
    </>
  )
}