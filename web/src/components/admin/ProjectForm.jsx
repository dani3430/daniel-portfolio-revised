'use client'

import Link from 'next/link'
import { useActionState } from 'react'

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

export default function ProjectForm({ action, initial, categories, projectId, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {
    values: initial,
    errors: {},
    message: '',
  })
  const { values, errors } = state

  return (
    <form action={formAction} className="max-w-2xl space-y-6" noValidate>
      {projectId && <input type="hidden" name="id" value={projectId} />}

      {state.message && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        >
          {state.message}
        </p>
      )}

      <Field id="title" label="Title" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={150}
          defaultValue={values.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={describedBy('title', false, errors.title)}
          className={inputClass}
        />
      </Field>

      <Field
        id="slug"
        label="Web address name (slug)"
        hint="Leave empty to create it from the title. Example: addis-eats"
        error={errors.slug}
      >
        <input
          id="slug"
          name="slug"
          type="text"
          maxLength={80}
          defaultValue={values.slug}
          aria-invalid={Boolean(errors.slug)}
          aria-describedby={describedBy('slug', true, errors.slug)}
          className={inputClass}
        />
      </Field>

      <Field
        id="shortDescription"
        label="Short description"
        hint="Shown on the project card. 10 to 400 characters."
        error={errors.shortDescription}
      >
        <textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          required
          maxLength={400}
          defaultValue={values.shortDescription}
          aria-invalid={Boolean(errors.shortDescription)}
          aria-describedby={describedBy('shortDescription', true, errors.shortDescription)}
          className={inputClass}
        />
      </Field>

      <Field
        id="fullDescription"
        label="Full description (optional)"
        hint="Saved now. It will be shown when single-project pages are added."
        error={errors.fullDescription}
      >
        <textarea
          id="fullDescription"
          name="fullDescription"
          rows={6}
          maxLength={5000}
          defaultValue={values.fullDescription}
          aria-invalid={Boolean(errors.fullDescription)}
          aria-describedby={describedBy('fullDescription', true, errors.fullDescription)}
          className={inputClass}
        />
      </Field>

      <Field id="categoryId" label="Category" error={errors.categoryId}>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={values.categoryId}
          aria-invalid={Boolean(errors.categoryId)}
          aria-describedby={describedBy('categoryId', false, errors.categoryId)}
          className={inputClass}
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="tech"
        label="Technologies"
        hint="Separate with commas. Example: React, Next.js, Tailwind CSS (up to 12)"
        error={errors.tech}
      >
        <input
          id="tech"
          name="tech"
          type="text"
          defaultValue={values.tech}
          aria-invalid={Boolean(errors.tech)}
          aria-describedby={describedBy('tech', true, errors.tech)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="githubUrl" label="GitHub link (optional)" error={errors.githubUrl}>
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            maxLength={500}
            placeholder="https://github.com/..."
            defaultValue={values.githubUrl}
            aria-invalid={Boolean(errors.githubUrl)}
            aria-describedby={describedBy('githubUrl', false, errors.githubUrl)}
            className={inputClass}
          />
        </Field>
        <Field id="liveUrl" label="Live demo link (optional)" error={errors.liveUrl}>
          <input
            id="liveUrl"
            name="liveUrl"
            type="url"
            maxLength={500}
            placeholder="https://..."
            defaultValue={values.liveUrl}
            aria-invalid={Boolean(errors.liveUrl)}
            aria-describedby={describedBy('liveUrl', false, errors.liveUrl)}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-fg">Visibility</legend>
        <label className="flex items-center gap-3 text-sm text-fg">
          <input
            type="checkbox"
            name="published"
            defaultChecked={values.published}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Published (visible on the website)
        </label>
        <label className="flex items-center gap-3 text-sm text-fg">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={values.featured}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Featured (shown on the Home page)
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Saving...' : submitLabel}
        </button>
        <Link
          href="/admin/projects"
          className="rounded-lg border border-line bg-bg px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}