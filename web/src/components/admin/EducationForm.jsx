'use client'

import { useActionState } from 'react'
import { saveEducationAction } from '@/app/admin/(panel)/education/actions'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-red-500'

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

// itemId is given when editing an item, and left out when adding a new one
export default function EducationForm({ initial, itemId, submitLabel }) {
  const [state, formAction, pending] = useActionState(saveEducationAction, {
    values: initial,
    errors: {},
    message: '',
    saved: false,
  })
  const { values, errors } = state
  const key = itemId ? `edu-${itemId}` : 'edu-new'

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {itemId && <input type="hidden" name="id" value={itemId} />}

      {state.message && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        >
          {state.message}
        </p>
      )}
      {state.saved && (
        <p
          role="status"
          className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-fg"
        >
          Saved. Your website will show the change within moments.
        </p>
      )}

      <Field id={`${key}-title`} label="Title" error={errors.title}>
        <input
          id={`${key}-title`}
          name="title"
          type="text"
          required
          maxLength={120}
          defaultValue={values.title}
          aria-invalid={errors.title ? 'true' : undefined}
          aria-describedby={errors.title ? `${key}-title-error` : undefined}
          className={inputClass}
        />
      </Field>

      <Field id={`${key}-place`} label="School or place" error={errors.place}>
        <input
          id={`${key}-place`}
          name="place"
          type="text"
          required
          maxLength={120}
          defaultValue={values.place}
          aria-invalid={errors.place ? 'true' : undefined}
          aria-describedby={errors.place ? `${key}-place-error` : undefined}
          className={inputClass}
        />
      </Field>

      <Field id={`${key}-note`} label="Note (optional)" error={errors.note}>
        <textarea
          id={`${key}-note`}
          name="note"
          rows={3}
          maxLength={300}
          defaultValue={values.note}
          aria-invalid={errors.note ? 'true' : undefined}
          aria-describedby={errors.note ? `${key}-note-error` : undefined}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}