'use client'

import Link from 'next/link'
import { useActionState, useSyncExternalStore } from 'react'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-red-500'

const subscribe = () => () => {}

function describedBy(id, hasHint, hasError) {
  return [hasHint ? `${id}-hint` : null, hasError ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
}

// "2026-10-12T06:30:00.000Z" -> "2026-10-12T09:30" in this browser's own time zone
function isoToLocalInput(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
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

export default function PostForm({ action, initial, categories, postId, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {
    values: initial,
    errors: {},
    message: '',
  })
  const { values, errors } = state

  // The date needs this browser's time zone, which the server cannot know
  const isBrowser = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  return (
    <form action={formAction} className="max-w-3xl space-y-6" noValidate>
      {postId && <input type="hidden" name="id" value={postId} />}
      <input type="hidden" name="tzOffset" value={isBrowser ? new Date().getTimezoneOffset() : 0} />

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
          maxLength={200}
          defaultValue={values.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={describedBy('title', false, errors.title)}
          className={inputClass}
        />
      </Field>

      <Field
        id="slug"
        label="Web address name (slug)"
        hint="Leave empty to create it from the title. Example: my-first-post"
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
        id="excerpt"
        label="Summary"
        hint="Shown on the blog cards and in search results. 10 to 400 characters."
        error={errors.excerpt}
      >
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          required
          maxLength={400}
          defaultValue={values.excerpt}
          aria-invalid={Boolean(errors.excerpt)}
          aria-describedby={describedBy('excerpt', true, errors.excerpt)}
          className={inputClass}
        />
      </Field>

      <Field
        id="content"
        label="Text"
        hint="Leave a blank line between paragraphs. Plain text only for now."
        error={errors.content}
      >
        <textarea
          id="content"
          name="content"
          rows={16}
          maxLength={50000}
          defaultValue={values.content}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={describedBy('content', true, errors.content)}
          className={`${inputClass} leading-relaxed`}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
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
          id="tags"
          label="Tags"
          hint="Separate with commas. Up to 10."
          error={errors.tags}
        >
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={values.tags}
            aria-invalid={Boolean(errors.tags)}
            aria-describedby={describedBy('tags', true, errors.tags)}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-fg">Status</legend>
        <label className="flex items-center gap-3 text-sm text-fg">
          <input
            type="radio"
            name="status"
            value="draft"
            defaultChecked={values.status !== 'published'}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Draft (only you can see it)
        </label>
        <label className="flex items-center gap-3 text-sm text-fg">
          <input
            type="radio"
            name="status"
            value="published"
            defaultChecked={values.status === 'published'}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Published (visible once its date has arrived)
        </label>
      </fieldset>

      <Field
        id="publishedAtLocal"
        label="Publish date and time (optional)"
        hint="Empty means now. A future date schedules the post. Your own time zone is used."
        error={errors.publishedAt}
      >
        {isBrowser ? (
          <input
            key={values.publishedAt}
            id="publishedAtLocal"
            name="publishedAtLocal"
            type="datetime-local"
            defaultValue={isoToLocalInput(values.publishedAt)}
            aria-invalid={Boolean(errors.publishedAt)}
            aria-describedby={describedBy('publishedAtLocal', true, errors.publishedAt)}
            className={inputClass}
          />
        ) : (
          <div className={`${inputClass} h-[46px]`} aria-hidden="true" />
        )}
      </Field>

      <label className="flex items-center gap-3 text-sm text-fg">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={values.featured}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        Featured post
      </label>

      <fieldset className="space-y-6 rounded-2xl border border-line p-5">
        <legend className="px-2 text-sm font-medium text-fg">Search engines (optional)</legend>
        <Field
          id="seoTitle"
          label="Search title"
          hint="Up to 70 characters. Empty means the post title is used."
          error={errors.seoTitle}
        >
          <input
            id="seoTitle"
            name="seoTitle"
            type="text"
            maxLength={70}
            defaultValue={values.seoTitle}
            aria-invalid={Boolean(errors.seoTitle)}
            aria-describedby={describedBy('seoTitle', true, errors.seoTitle)}
            className={inputClass}
          />
        </Field>
        <Field
          id="seoDescription"
          label="Search description"
          hint="Up to 200 characters. Empty means the summary is used."
          error={errors.seoDescription}
        >
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={2}
            maxLength={200}
            defaultValue={values.seoDescription}
            aria-invalid={Boolean(errors.seoDescription)}
            aria-describedby={describedBy('seoDescription', true, errors.seoDescription)}
            className={inputClass}
          />
        </Field>
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
          href="/admin/blog"
          className="rounded-lg border border-line bg-bg px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}