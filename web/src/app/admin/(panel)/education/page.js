import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import EducationForm from '@/components/admin/EducationForm'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { moveEducationAction, deleteEducationAction } from './actions'

export const metadata = {
  title: 'Education | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const moveButtonClass =
  'rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40'

function MoveButton({ id, direction, label, disabled }) {
  return (
    <form action={moveEducationAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" disabled={disabled} className={moveButtonClass}>
        {label}
      </button>
    </form>
  )
}

export default async function EducationPage() {
  await requireAdmin()

  const items = await getSql()`
    SELECT id, title, place, note FROM education ORDER BY sort_order, id
  `

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Education</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Shown on the About page, in the order below. Use Move up and Move down to change the
        order.
      </p>

      <section className="mt-8 max-w-2xl rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-fg">Add an education item</h2>
        <div className="mt-4">
          <EducationForm initial={{ title: '', place: '', note: '' }} submitLabel="Add item" />
        </div>
      </section>

      {items.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">No education items yet</p>
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
              <EducationForm
                itemId={String(item.id)}
                initial={{ title: item.title, place: item.place, note: item.note ?? '' }}
                submitLabel="Save item"
              />
              <div className="mt-4 border-t border-line pt-4">
                <ConfirmDeleteButton
                  id={String(item.id)}
                  action={deleteEducationAction}
                  itemName="education item"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}