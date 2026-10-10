'use client'

import { useActionState } from 'react'
import { saveSettingsAction } from '@/app/admin/(panel)/settings/actions'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-red-500'

function describedBy(id, hasError) {
  return [`${id}-hint`, hasError ? `${id}-error` : null].filter(Boolean).join(' ')
}

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">
        {hint}
      </p>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

export default function SettingsForm({ initial }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, {
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
          Settings saved. Your website will show the change within moments.
        </p>
      )}

      <Field
        id="siteTitle"
        label="Site title"
        hint="Shown in the browser tab and in search results for the home page."
        error={errors.siteTitle}
      >
        <input
          id="siteTitle"
          name="siteTitle"
          type="text"
          required
          maxLength={70}
          defaultValue={values.siteTitle}
          aria-invalid={errors.siteTitle ? 'true' : undefined}
          aria-describedby={describedBy('siteTitle', errors.siteTitle)}
          className={inputClass}
        />
      </Field>

      <Field
        id="siteDescription"
        label="Site description"
        hint="The short summary search engines show under your title. About 150 characters works best."
        error={errors.siteDescription}
      >
        <textarea
          id="siteDescription"
          name="siteDescription"
          rows={3}
          required
          maxLength={200}
          defaultValue={values.siteDescription}
          aria-invalid={errors.siteDescription ? 'true' : undefined}
          aria-describedby={describedBy('siteDescription', errors.siteDescription)}
          className={inputClass}
        />
      </Field>

      <Field
        id="heroTech"
        label="Technology highlights"
        hint="One technology per line. Shown under your introduction on the home page."
        error={errors.heroTech}
      >
        <textarea
          id="heroTech"
          name="heroTech"
          rows={6}
          defaultValue={values.heroTech}
          aria-invalid={errors.heroTech ? 'true' : undefined}
          aria-describedby={describedBy('heroTech', errors.heroTech)}
          className={inputClass}
        />
      </Field>

      <Field
        id="footerText"
        label="Footer text"
        hint="The short sentence in the footer."
        error={errors.footerText}
      >
        <textarea
          id="footerText"
          name="footerText"
          rows={3}
          maxLength={200}
          defaultValue={values.footerText}
          aria-invalid={errors.footerText ? 'true' : undefined}
          aria-describedby={describedBy('footerText', errors.footerText)}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Saving...' : 'Save settings'}
      </button>
    </form>
  )
}