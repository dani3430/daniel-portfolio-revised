import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import SkillGroupForm from '@/components/admin/SkillGroupForm'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { deleteSkillGroupAction } from './actions'

export const metadata = {
  title: 'Skills | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SkillsPage() {
  await requireAdmin()

  const groups = await getSql()`
    SELECT g.id, g.name, g.description,
           COALESCE(
             array_agg(s.name ORDER BY s.sort_order, s.id) FILTER (WHERE s.id IS NOT NULL),
             '{}'
           ) AS items
    FROM skill_groups g
    LEFT JOIN skills s ON s.group_id = g.id
    GROUP BY g.id
    ORDER BY g.sort_order, g.id
  `

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Skills</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Skills are shown on the home page and the About page, grouped by topic.
      </p>

      <section className="mt-8 max-w-2xl rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-fg">Add a skill group</h2>
        <div className="mt-4">
          <SkillGroupForm
            initial={{ name: '', description: '', items: '' }}
            submitLabel="Add group"
          />
        </div>
      </section>

      {groups.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">No skill groups yet</p>
          <p className="mt-1 text-sm text-muted">Add your first group above.</p>
        </div>
      ) : (
        <ul className="mt-8 max-w-2xl space-y-6">
          {groups.map((group) => (
            <li key={String(group.id)} className="rounded-2xl border border-line bg-surface p-5">
              <SkillGroupForm
                groupId={String(group.id)}
                initial={{
                  name: group.name,
                  description: group.description ?? '',
                  items: (group.items ?? []).join('\n'),
                }}
                submitLabel="Save group"
              />
              <div className="mt-4 border-t border-line pt-4">
                <ConfirmDeleteButton
                  id={String(group.id)}
                  action={deleteSkillGroupAction}
                  itemName="skill group"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}