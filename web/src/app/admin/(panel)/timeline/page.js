import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import TimelineForm from '@/components/admin/TimelineForm'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { moveTimelineAction, deleteTimelineAction } from './actions'

export const metadata = {
  title: 'Timeline | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const moveButtonClass =
  'rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40'

function MoveButton({ id, direction, label, disabled }) {
  return (
    <form action={moveTimelineAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" disabled={disabled} className={moveButtonClass}>
        {label}
      </button>
    </form>
  )
}

export default async function TimelinePage() {
  await requireAdmin()

  const items = await getSql()`
    SELECT id, title, text FROM timeline_items ORDER BY sort_order, id
  `

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Timeline</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        The steps of your journey, shown on the About page in the order below. Use Move up and
        Move down to change the order.
      </p>

      <section className="mt-8 max-w-2xl rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-fg">Add a timeline item</h2>
        <div className="mt-4">
          <TimelineForm initial={{ title: '', text: '' }} submitLabel="Add item" />
        </div>
      </section>

      {items.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">No timeline items yet</p>
          <p className="mt-1 text-sm text-muted">Add your first item above.</p>
        </div>
      ) : (
        <ul className="mt-8 max-w-2xl space-y-6">
          {items.map((item, index) => (
            <li key={String(item.id)} className="rounded-2xl border border-line bg-surface p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <MoveButton
                  id={String(item.id)}
                  direction="up"
                  label="Move up"
                  disabled={index === 0}
                />
                <MoveButton
                  id={String(item.id)}
                  direction="down"
                  label="Move down"
                  disabled={index === items.length - 1}
                />
              </div>
              <TimelineForm
                itemId={String(item.id)}
                initial={{ title: item.title, text: item.text }}
                submitLabel="Save item"
              />
              <div className="mt-4 border-t border-line pt-4">
                <ConfirmDeleteButton
                  id={String(item.id)}
                  action={deleteTimelineAction}
                  itemName="timeline item"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}