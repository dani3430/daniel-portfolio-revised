'use client'

import { useActionState } from 'react'
import { saveCategoryAction } from '@/app/admin/(panel)/categories/actions'

const inputClass =
  'block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-red-500'

// categoryId is given when renaming a category. kind is given when adding a new one.
export default function CategoryForm({ initial, kind, categoryId, label, submitLabel }) {
  const [state, formAction, pending] = useActionState(saveCategoryAction, {
    values: initial,
    errors: {},
    message: '',
    saved: false,
  })
  const { values, errors } = state
  const key = categoryId ? `category-${categoryId}` : `category-new-${kind}`

  return (
    <form action={formAction} noValidate>
      {categoryId ? (
        <input type="hidden" name="id" value={categoryId} />
      ) : (
        <input type="hidden" name="kind" value={kind} />
      )}

      <label htmlFor={`${key}-name`} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="mt-1 flex flex-wrap gap-2">
        <div className="min-w-[12rem] flex-1">
          <input
            id={`${key}-name`}
            name="name"
            type="text"
            required
            maxLength={60}
            defaultValue={values.name}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? `${key}-error` : undefined}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Saving...' : submitLabel}
        </button>
      </div>

      {errors.name && (
        <p id={`${key}-error`} role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">
          {errors.name}
        </p>
      )}
      {state.message && !errors.name && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {state.message}
        </p>
      )}
      {state.saved && (
        <p role="status" className="mt-2 text-sm text-brand">
          Saved.
        </p>
      )}
    </form>
  )
}