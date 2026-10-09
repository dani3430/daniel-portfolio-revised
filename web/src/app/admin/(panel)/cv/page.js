import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import CvUploader from '@/components/admin/CvUploader'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { setCurrentCvAction, unpublishCvAction, deleteCvAction } from './actions'

export const metadata = {
  title: 'CV | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

function kilobytes(bytes) {
  return `${Math.max(1, Math.round(bytes / 1000))} KB`
}

export default async function CvPage() {
  await requireAdmin()

  const sql = getSql()
  const files = await sql`
    SELECT c.id, c.title, c.version, c.published, c.is_current, c.created_at,
           m.url, m.size_bytes
    FROM cv_files c
    JOIN media m ON m.id = c.media_id
    ORDER BY c.created_at DESC
  `

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-fg">CV</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Upload your CV as a PDF. The Download CV buttons on your website will use the current,
        published CV.
      </p>

<CvUploader />

      {files.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-fg">No CV uploaded yet</p>
          <p className="mt-1 text-sm text-muted">
               Upload one above. Until a CV is published, the Download CV buttons stay hidden on the live site.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {files.map((file) => (
            <li key={String(file.id)} className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-display text-lg font-semibold text-fg">
                {file.title}
                {file.version ? ` (${file.version})` : ''}
              </p>
              <p className="mt-1 text-sm text-muted">
                {kilobytes(file.size_bytes)} · {file.is_current ? 'Current' : 'Not current'} ·{' '}
                {file.published ? 'Published' : 'Not published'}
              </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-line bg-bg px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Preview
                </a>
                {file.is_current && file.published ? (
                  <form action={unpublishCvAction}>
                    <input type="hidden" name="id" value={String(file.id)} />
                    <button
                      type="submit"
                      className="rounded-lg border border-line bg-bg px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Unpublish
                    </button>
                  </form>
                ) : (
                  <form action={setCurrentCvAction}>
                    <input type="hidden" name="id" value={String(file.id)} />
                    <button
                      type="submit"
                      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Publish as current CV
                    </button>
                  </form>
                )}
                <div className="ml-auto">
                  <ConfirmDeleteButton
                    id={String(file.id)}
                    action={deleteCvAction}
                    itemName="CV"
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