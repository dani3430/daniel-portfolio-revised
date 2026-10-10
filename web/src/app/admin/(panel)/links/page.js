import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import LinkForm from '@/components/admin/LinkForm'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { moveLinkAction, deleteLinkAction } from './actions'

export const metadata = {
  title: 'Links | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const moveButtonClass =
  'rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40'

function MoveButton({ id, direction, label, disabled }) {
  return (
    <form action={moveLinkAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" disabled={disabled} className={moveButtonClass}>
        {label}
      </button>
    </form>
  )
}

export default async function LinksPage() {
  await requireAdmin()

  const links = await getSql()`
    SELECT id, label, value, href, visible FROM contact_links ORDER BY sort_order, id
  `

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">Contact and social links</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Shown on the Contact page and in the footer, in the order below. Untick &quot;Show on the
        website&quot; to hide a link without deleting it.
      </p>

      <section className="mt-8 max-w-2xl rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-fg">Add a link</h2>
        <div className="mt-4">
          <LinkForm
            initial={{ label: '', value: '', href: '', visible: true }}
            submitLabel="Add link"
          />
        </div>
      </section>

      {links.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">No links yet</p>
          <p className="mt-1 text-sm text-muted">Add your first link above.</p>
        </div>
      ) : (
        <ul className="mt-8 max-w-2xl space-y-6">
          {links.map((link, index) => (
            <li key={String(link.id)} className="rounded-2xl border border-line bg-surface p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <MoveButton
                  id={String(link.id)}
                  direction="up"
                  label="Move up"
                  disabled={index === 0}
                />
                <MoveButton
                  id={String(link.id)}
                  direction="down"
                  label="Move down"
                  disabled={index === links.length - 1}
                />
                {!link.visible && (
                  <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">
                    Hidden
                  </span>
                )}
              </div>
              <LinkForm
                linkId={String(link.id)}
                initial={{
                  label: link.label,
                  value: link.value,
                  href: link.href ?? '',
                  visible: link.visible,
                }}
                submitLabel="Save link"
              />
              <div className="mt-4 border-t border-line pt-4">
                <ConfirmDeleteButton
                  id={String(link.id)}
                  action={deleteLinkAction}
                  itemName="link"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}