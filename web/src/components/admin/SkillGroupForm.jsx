'use client'

import { useActionState } from 'react'
import { saveSkillGroupAction } from '@/app/admin/(panel)/skills/actions'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-red-500'

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

function describedBy(id, hasHint, hasError) {
  return [hasHint ? `${id}-hint` : null, hasError ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
}

// groupId is given when editing a group, and left out when adding a new one
export default function SkillGroupForm({ initial, groupId, submitLabel }) {
  const [state, formAction, pending] = useActionState(saveSkillGroupAction, {
    values: initial,
    errors: {},
    message: '',
    saved: false,
  })
  const { values, errors } = state
  const key = groupId ? `group-${groupId}` : 'new-group'

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {groupId && <input type="hidden" name="id" value={groupId} />}

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

      <Field id={`${key}-name`} label="Group name" error={errors.name}>
        <input
          id={`${key}-name`}
          name="name"
          type="text"
          required
          maxLength={60}
          defaultValue={values.name}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={describedBy(`${key}-name`, false, errors.name)}
          className={inputClass}
        />
      </Field>

      <Field id={`${key}-description`} label="Description" error={errors.description}>
        <input
          id={`${key}-description`}
          name="description"
          type="text"
          maxLength={200}
          defaultValue={values.description}
          aria-invalid={errors.description ? 'true' : undefined}
          aria-describedby={describedBy(`${key}-description`, false, errors.description)}
          className={inputClass}
        />
      </Field>

      <Field
        id={`${key}-items`}
        label="Skills"
        hint="One skill per line."
        error={errors.items}
      >
        <textarea
          id={`${key}-items`}
          name="items"
          rows={6}
          defaultValue={values.items}
          aria-invalid={errors.items ? 'true' : undefined}
          aria-describedby={describedBy(`${key}-items`, true, errors.items)}
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