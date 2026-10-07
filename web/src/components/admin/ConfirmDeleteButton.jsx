'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'

function ConfirmButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Deleting...' : 'Yes, delete permanently'}
    </button>
  )
}

export default function ConfirmDeleteButton({ id, action, itemName = 'message' }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-500/50 bg-bg px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:text-red-300"
      >
        Delete
      </button>
    )
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-fg" role="alert">
        Delete this {itemName} forever?
      </p>
      <ConfirmButton />
      <button
        type="button"
        autoFocus
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-line bg-bg px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Cancel
      </button>
    </form>
  )
}