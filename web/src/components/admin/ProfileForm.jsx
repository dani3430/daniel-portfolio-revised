'use client'

import { useActionState } from 'react'
import { saveProfileAction } from '@/app/admin/(panel)/profile/actions'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-red-500'

function describedBy(id, hasHint, hasError) {
  return [hasHint ? `${id}-hint` : null, hasError ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
}

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

export default function ProfileForm({ initial }) {
  const [state, formAction, pending] = useActionState(saveProfileAction, {
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
          Profile saved. Your website will show the change within moments.
        </p>
      )}

      <Field id="fullName" label="Name" error={errors.fullName}>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          maxLength={80}
          defaultValue={values.fullName}
          aria-invalid={errors.fullName ? 'true' : undefined}
          aria-describedby={describedBy('fullName', false, errors.fullName)}
          className={inputClass}
        />
      </Field>

      <Field id="title" label="Professional title" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={values.title}
          aria-invalid={errors.title ? 'true' : undefined}
          aria-describedby={describedBy('title', false, errors.title)}
          className={inputClass}
        />
      </Field>

      <Field
        id="tagline"
        label="Introduction"
        hint="The short sentence under your name at the top of the home page. Up to 300 characters."
        error={errors.tagline}
      >
        <textarea
          id="tagline"
          name="tagline"
          rows={3}
          maxLength={300}
          defaultValue={values.tagline}
          aria-invalid={errors.tagline ? 'true' : undefined}
          aria-describedby={describedBy('tagline', true, errors.tagline)}
          className={inputClass}
        />
      </Field>

      <Field
        id="bio"
        label="Short bio"
        hint="Shown in the About preview on the home page. Leave a blank line between paragraphs."
        error={errors.bio}
      >
        <textarea
          id="bio"
          name="bio"
          rows={8}
          maxLength={3000}
          defaultValue={values.bio}
          aria-invalid={errors.bio ? 'true' : undefined}
          aria-describedby={describedBy('bio', true, errors.bio)}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}