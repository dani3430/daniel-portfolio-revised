'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCoverSignatureAction,
  saveCoverAction,
  removeCoverAction,
} from '@/app/admin/(panel)/covers/actions'

const MAX_BYTES = 3_000_000
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// A small copy of the image is enough for the preview
function previewUrl(url) {
  return url.startsWith('https://res.cloudinary.com/')
    ? url.replace('/image/upload/', '/image/upload/f_auto,q_auto,c_limit,w_600/')
    : url
}

// kind is "project" or "post". currentUrl is empty when there is no cover image yet.
export default function CoverImageUploader({ kind, itemId, currentUrl, itemTitle }) {
  const router = useRouter()
  const fileRef = useRef(null)
  const [status, setStatus] = useState({ type: 'idle', text: '' })
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  const busy = status.type === 'working'

  async function handleUpload(event) {
    event.preventDefault()
    const file = fileRef.current?.files?.[0]

    if (!file) {
      setStatus({ type: 'error', text: 'Choose an image first.' })
      return
    }
    if (!ALLOWED_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension))) {
      setStatus({ type: 'error', text: 'Only JPG, PNG or WebP images are allowed.' })
      return
    }
    if (file.size > MAX_BYTES) {
      setStatus({
        type: 'error',
        text: `This image is ${(file.size / 1_000_000).toFixed(1)} MB. The limit is 3 MB.`,
      })
      return
    }

    setStatus({ type: 'working', text: 'Uploading...' })
    try {
      const permit = await getCoverSignatureAction(kind)
      if (permit.error) throw new Error(permit.error)

      const body = new FormData()
      body.append('file', file)
      body.append('api_key', permit.apiKey)
      body.append('timestamp', String(permit.timestamp))
      body.append('signature', permit.signature)
      body.append('folder', permit.folder)
      body.append('allowed_formats', permit.allowedFormats)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${permit.cloudName}/image/upload`,
        { method: 'POST', body },
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error?.message || 'The upload failed.')

      const saved = await saveCoverAction(kind, itemId, data.public_id)
      if (saved.error) throw new Error(saved.error)

      if (fileRef.current) fileRef.current.value = ''
      setStatus({ type: 'success', text: 'Cover image saved.' })
      router.refresh()
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'The upload failed.' })
    }
  }

  async function handleRemove() {
    setConfirmingRemove(false)
    setStatus({ type: 'working', text: 'Removing...' })
    const result = await removeCoverAction(kind, itemId)
    if (result.error) {
      setStatus({ type: 'error', text: result.error })
      return
    }
    setStatus({ type: 'success', text: 'Cover image removed.' })
    router.refresh()
  }

  return (
    <section className="mb-10 max-w-2xl rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-fg">Cover image</h2>
      <p className="mt-1 text-xs text-muted">
        Saved right away, you do not need to press Save changes. JPG, PNG or WebP, up to 3 MB.
      </p>

      <div className="mt-4">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl(currentUrl)}
            alt={`Current cover image for ${itemTitle}`}
            className="max-h-56 w-auto rounded-xl border border-line object-cover"
          />
        ) : (
          <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
            No cover image yet
          </div>
        )}
      </div>

      <form onSubmit={handleUpload} className="mt-4">
        <label htmlFor={`cover-file-${kind}`} className="block text-sm font-medium text-fg">
          {currentUrl ? 'Replace the image' : 'Choose an image'}
        </label>
        <input
          id={`cover-file-${kind}`}
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          disabled={busy}
          className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-bg file:px-3 file:py-2 file:text-sm file:font-semibold file:text-fg"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Working...' : currentUrl ? 'Upload new image' : 'Upload image'}
          </button>

          {currentUrl && !confirmingRemove && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingRemove(true)}
              className="rounded-lg border border-red-500/50 bg-bg px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60 dark:text-red-300"
            >
              Remove image
            </button>
          )}
          {currentUrl && confirmingRemove && (
            <>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Yes, remove it
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                className="rounded-lg border border-line bg-bg px-4 py-2 text-sm font-semibold text-fg"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <p
          role={status.type === 'error' ? 'alert' : 'status'}
          className={`mt-3 text-sm ${
            status.type === 'error'
              ? 'text-red-700 dark:text-red-300'
              : status.type === 'success'
                ? 'text-brand'
                : 'text-muted'
          }`}
        >
          {status.text}
        </p>
      </form>
    </section>
  )
}