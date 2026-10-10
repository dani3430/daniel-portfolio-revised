'use client'

import { useActionState } from 'react'
import { saveAboutAction } from '@/app/admin/(panel)/profile/actions'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-red-500'

function describedBy(id, hasError) {
  return [`${id}-hint`, hasError ? `${id}-error` : null].filter(Boolean).join(' ')
}

function Field({ id, label, hint, error, rows, name, defaultValue }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">
        {hint}
      </p>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, error)}
        className={inputClass}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

export default function AboutContentForm({ initial }) {
  const [state, formAction, pending] = useActionState(saveAboutAction, {
    values: initial,
    errors: {},
    message: '',
    saved: false,
  })
  const { values, errors } = state

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-6" noValidate>
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
          About content saved. Your website will show the change within moments.
        </p>
      )}

      <Field
        id="journey"
        name="journey"
        label="My journey"
        hint="The story on the About page. Leave a blank line between paragraphs."
        rows={14}
        error={errors.journey}
        defaultValue={values.journey}
      />
      <Field
        id="goals"
        name="goals"
        label="Goals"
        hint="One goal per line. Shown as pills on the About page."
        rows={5}
        error={errors.goals}
        defaultValue={values.goals}
      />
            <Field
        id="principles"
        name="principles"
        label="Development philosophy"
        hint="One principle per block. Put the title on the first line and the description on the next line. Leave a blank line between principles."
        rows={12}
        error={errors.principles}
        defaultValue={values.principles}
      />
      <Field
        id="interests"
        name="interests"
        label="Areas of interest"
        hint="One interest per line. Shown in the About preview on the home page."
        rows={6}
        error={errors.interests}
        defaultValue={values.interests}
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Saving...' : 'Save About content'}
      </button>
    </form>
  )
}