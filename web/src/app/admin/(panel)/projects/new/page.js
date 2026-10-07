import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import ProjectForm from '@/components/admin/ProjectForm'
import { createProjectAction } from '../actions'

export const metadata = {
  title: 'New project | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const emptyProject = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  categoryId: '',
  tech: '',
  githubUrl: '',
  liveUrl: '',
  featured: false,
  published: false,
}

export default async function NewProjectPage() {
  await requireAdmin()

  const categories = await getSql()`
    SELECT id, name FROM categories WHERE kind = 'project' ORDER BY sort_order, id
  `

  return (
    <>
      <Link
        href="/admin/projects"
        className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        &larr; Back to projects
      </Link>
      <h1 className="mt-6 mb-8 font-display text-3xl font-bold text-fg">New project</h1>
      <ProjectForm
        action={createProjectAction}
        initial={emptyProject}
        categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
        submitLabel="Create project"
      />
    </>
  )
}