import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import LocalTime from '@/components/admin/LocalTime'
import ConfirmDeleteButton from '@/components/admin/ConfirmDeleteButton'
import { setMessageStatusAction, deleteMessageAction } from '../actions'

export const metadata = {
  title: 'Message | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const secondaryButton =
  'rounded-lg border border-line bg-bg px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

function StatusForm({ id, status, label }) {
  return (
    <form action={setMessageStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={secondaryButton}>
        {label}
      </button>
    </form>
  )
}

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-words text-sm text-fg sm:col-span-2">{children}</dd>
    </div>
  )
}

export default async function MessageDetailPage({ params }) {
  await requireAdmin()

  const { id } = await params
  // Ids are numbers only
  if (!/^\d{1,18}$/.test(id)) notFound()

  const sql = getSql()
  const rows = await sql`
    SELECT id, name, email, subject, message, phone, company, status,
           email_notified, autoreply_sent, telegram_notified, created_at
    FROM messages
    WHERE id = ${id}
  `
  if (rows.length === 0) notFound()
  let message = rows[0]

  // Opening an unread message marks it as read
  if (message.status === 'unread') {
    await sql`UPDATE messages SET status = 'read' WHERE id = ${id}`
    message = { ...message, status: 'read' }
  }

  const replySubject = encodeURIComponent(`Re: ${message.subject}`)
  const sentLabel = (sent) => (sent ? 'Sent' : 'Not sent')

  return (
    <>
      <Link
        href="/admin/messages"
        className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        &larr; Back to messages
      </Link>

      <h1 className="mt-6 break-words font-display text-2xl font-bold text-fg sm:text-3xl">
        {message.subject}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {message.status === 'archived' ? 'Archived' : message.status === 'read' ? 'Read' : 'Unread'}
        {' \u00b7 '}
        <LocalTime value={new Date(message.created_at).toISOString()} />
      </p>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${message.email}?subject=${replySubject}`}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Reply by email
        </a>
        <StatusForm id={message.id} status="unread" label="Mark as unread" />
        {message.status === 'archived' ? (
          <StatusForm id={message.id} status="read" label="Move to inbox" />
        ) : (
          <StatusForm id={message.id} status="archived" label="Archive" />
        )}
        <ConfirmDeleteButton id={message.id} action={deleteMessageAction} />
      </div>

      {/* Message text. React escapes it, so visitor text can never run as code. */}
      <section aria-labelledby="message-heading" className="mt-8">
        <h2 id="message-heading" className="sr-only">
          Message
        </h2>
        <div className="whitespace-pre-wrap break-words rounded-2xl border border-line bg-surface p-5 text-base leading-relaxed text-fg">
          {message.message}
        </div>
      </section>

      {/* Sender */}
      <section aria-labelledby="sender-heading" className="mt-8">
        <h2 id="sender-heading" className="font-display text-lg font-semibold text-fg">
          Sender
        </h2>
        <dl className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface px-5">
          <DetailRow label="Name">{message.name}</DetailRow>
          <DetailRow label="Email">{message.email}</DetailRow>
          {message.phone && <DetailRow label="Phone">{message.phone}</DetailRow>}
          {message.company && <DetailRow label="Company">{message.company}</DetailRow>}
        </dl>
      </section>

      {/* Did the notifications reach you? */}
      <section aria-labelledby="delivery-heading" className="mt-8">
        <h2 id="delivery-heading" className="font-display text-lg font-semibold text-fg">
          Notifications
        </h2>
        <dl className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface px-5">
          <DetailRow label="Email to you">{sentLabel(message.email_notified)}</DetailRow>
          <DetailRow label="Auto-reply to sender">{sentLabel(message.autoreply_sent)}</DetailRow>
          <DetailRow label="Telegram alert">{sentLabel(message.telegram_notified)}</DetailRow>
        </dl>
      </section>
    </>
  )
}