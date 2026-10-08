'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUploadSignatureAction, saveUploadAction, resetSlotAction } from '@/app/admin/(panel)/branding/actions'

function megabytes(bytes) {
  return `${(bytes / 1_000_000).toFixed(1)} MB`
}

export default function SlotUploader({ slot }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const [status, setStatus] = useState({ type: 'idle', text: '' })
  const [confirmingReset, setConfirmingReset] = useState(false)

  const busy = status.type === 'working'
  const previewSource = slot.current || slot.fallback

  async function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const extension = file.name.split('.').pop().toLowerCase()
    if (!slot.formats.includes(extension)) {
      setStatus({ type: 'error', text: `Use one of these types: ${slot.formats.join(', ')}.` })
      event.target.value = ''
      return
    }
    if (file.size > slot.maxBytes) {
      setStatus({
        type: 'error',
        text: `This file is ${megabytes(file.size)}. The limit is ${megabytes(slot.maxBytes)}.`,
      })
      event.target.value = ''
      return
    }

    setStatus({ type: 'working', text: 'Uploading...' })
    try {
      const permit = await getUploadSignatureAction(slot.key)
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

      const saved = await saveUploadAction(slot.key, data.public_id)
      if (saved.error) throw new Error(saved.error)

      setStatus({ type: 'success', text: 'Saved.' })
      router.refresh()
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'The upload failed.' })
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-fg">{slot.label}</h2>
      <p className="mt-1 text-sm text-muted">{slot.help}</p>

      {/* The preview sits on the colour of the theme it is meant for */}
      <div
        className={`mt-4 flex h-32 items-center justify-center rounded-xl border border-line p-4 ${
          slot.previewTheme === 'dark' ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        <img
          src={previewSource}
          alt={`Current ${slot.label}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        {slot.current ? 'Your uploaded image' : 'Built-in image (nothing uploaded yet)'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label
          className={`cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand ${
            busy ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {busy ? 'Uploading...' : slot.current ? 'Replace image' : 'Upload image'}
          <input
            ref={inputRef}
            type="file"
            accept={slot.formats.map((format) => `.${format}`).join(',')}
            onChange={handleFile}
            disabled={busy}
            className="sr-only"
          />
        </label>

        {slot.current &&
          (confirmingReset ? (
            <form action={resetSlotAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="slot" value={slot.key} />
              <span className="text-sm text-fg">Delete it and use the built-in image?</span>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Yes, remove
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmingReset(false)}
                className="rounded-lg border border-line bg-bg px-3 py-2 text-sm font-semibold text-fg hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="rounded-lg border border-red-500/50 bg-bg px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:text-red-300"
            >
              Remove
            </button>
          ))}
      </div>

      <p className="mt-3 text-xs text-muted">
        Types: {slot.formats.join(', ')}. Up to {megabytes(slot.maxBytes)}.
      </p>

      <p
        role={status.type === 'error' ? 'alert' : 'status'}
        className={`mt-2 min-h-5 text-sm ${
          status.type === 'error'
            ? 'text-red-700 dark:text-red-300'
            : status.type === 'success'
              ? 'text-brand'
              : 'text-muted'
        }`}
      >
        {status.text}
      </p>
    </article>
  )
}