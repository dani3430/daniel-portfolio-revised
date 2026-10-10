import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import CategoryForm from '@/components/admin/CategoryForm'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { moveCategoryAction, deleteCategoryAction } from './actions'

export const metadata = {
  title: 'Categories | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const moveButtonClass =
  'rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40'

function MoveButton({ id, direction, label, disabled }) {
  return (
    <form action={moveCategoryAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" disabled={disabled} className={moveButtonClass}>
        {label}
      </button>
    </form>
  )
}

function CategorySection({ title, kind, categories, usageLabel }) {
  return (
    <section className="mt-10 max-w-2xl">
      <h2 className="font-display text-2xl font-bold text-fg">{title}</h2>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
        <CategoryForm
          kind={kind}
          initial={{ name: '' }}
          label="Add a category"
          submitLabel="Add"
        />
      </div>

      {categories.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
          <p className="text-sm text-muted">No categories yet. Add your first one above.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {categories.map((category, index) => (
            <li key={String(category.id)} className="rounded-2xl border border-line bg-surface p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <MoveButton
                  id={String(category.id)}
                  direction="up"
                  label="Move up"
                  disabled={index === 0}
                />
                <MoveButton
                  id={String(category.id)}
                  direction="down"
                  label="Move down"
                  disabled={index === categories.length - 1}
                />
                <span className="text-sm text-muted">
                  {category.used} {usageLabel}
                  {category.used === 1 ? '' : 's'}
                </span>
              </div>
              <CategoryForm
                categoryId={String(category.id)}
                initial={{ name: category.name }}
                label="Name"
                submitLabel="Rename"
              />
              <div className="mt-4 border-t border-line pt-4">
                <ConfirmDeleteButton
                  id={String(category.id)}
                  action={deleteCategoryAction}
                  itemName="category"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default async function CategoriesPage() {
  await requireAdmin()

  const rows = await getSql()`
    SELECT c.id, c.kind, c.name,
           (SELECT COUNT(*) FROM projects p WHERE p.category_id = c.id)::int AS project_count,
           (SELECT COUNT(*) FROM posts b WHERE b.category_id = c.id)::int AS post_count
    FROM categories c
    ORDER BY c.sort_order, c.id
  `

  const projectCategories = rows
    .filter((row) => row.kind === 'project')
    .map((row) => ({ id: row.id, name: row.name, used: row.project_count }))
  const postCategories = rows
    .filter((row) => row.kind === 'post')
    .map((row) => ({ id: row.id, name: row.name, used: row.post_count }))

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Categories</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Project categories become the filter buttons on the Projects page. Blog categories group
        your posts. Deleting a category never deletes the projects or posts inside it. They just
        end up with no category.
      </p>

      <CategorySection
        title="Project categories"
        kind="project"
        categories={projectCategories}
        usageLabel="project"
      />
      <CategorySection
        title="Blog categories"
        kind="post"
        categories={postCategories}
        usageLabel="post"
      />
    </>
  )
}