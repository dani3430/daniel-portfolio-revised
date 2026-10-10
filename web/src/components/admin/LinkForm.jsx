'use client'

import { useActionState } from 'react'
import { saveLinkAction } from '@/app/admin/(panel)/links/actions'

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

// linkId is given when editing a link, and left out when adding a new one
export default function LinkForm({ initial, linkId, submitLabel }) {
  const [state, formAction, pending] = useActionState(saveLinkAction, {
    values: initial,
    errors: {},
    message: '',
    saved: false,
  })
  const { values, errors } = state
  const key = linkId ? `link-${linkId}` : 'link-new'

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {linkId && <input type="hidden" name="id" value={linkId} />}

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

      <Field
        id={`${key}-label`}
        label="Name"
        hint="Icons show for Email, GitHub, LinkedIn and Telegram."
        error={errors.label}
      >
        <input
          id={`${key}-label`}
          name="label"
          type="text"
          required
          maxLength={50}
          defaultValue={values.label}
          aria-invalid={errors.label ? 'true' : undefined}
          aria-describedby={describedBy(`${key}-label`, true, errors.label)}
          className={inputClass}
        />
      </Field>

      <Field id={`${key}-value`} label="Text to show" error={errors.value}>
        <input
          id={`${key}-value`}
          name="value"
          type="text"
          required
          maxLength={200}
          defaultValue={values.value}
          aria-invalid={errors.value ? 'true' : undefined}
          aria-describedby={describedBy(`${key}-value`, false, errors.value)}
          className={inputClass}
        />
      </Field>

      <Field
        id={`${key}-href`}
        label="Address"
        hint="Start with https:// for websites, mailto: for email, or tel: for a phone number."
        error={errors.href}
      >
        <input
          id={`${key}-href`}
          name="href"
          type="text"
          required
          maxLength={500}
          defaultValue={values.href}
          aria-invalid={errors.href ? 'true' : undefined}
          aria-describedby={describedBy(`${key}-href`, true, errors.href)}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          id={`${key}-visible`}
          name="visible"
          type="checkbox"
          defaultChecked={values.visible}
          className="h-4 w-4 accent-brand"
        />
        <label htmlFor={`${key}-visible`} className="text-sm font-medium text-fg">
          Show on the website
        </label>
      </div>

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