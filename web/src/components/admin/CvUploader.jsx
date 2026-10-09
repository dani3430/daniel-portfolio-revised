'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCvUploadSignatureAction, saveCvAction } from '@/app/admin/(panel)/cv/actions'

const MAX_BYTES = 5_000_000

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

export default function CvUploader() {
  const router = useRouter()
  const fileRef = useRef(null)
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState({ type: 'idle', text: '' })

  const busy = status.type === 'working'

  async function handleSubmit(event) {
    event.preventDefault()
    const file = fileRef.current?.files?.[0]

    if (title.trim().length < 2) {
      setStatus({ type: 'error', text: 'Enter a title for this CV.' })
      return
    }
    if (!file) {
      setStatus({ type: 'error', text: 'Choose a PDF file first.' })
      return
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus({ type: 'error', text: 'Only PDF files are allowed.' })
      return
    }
    if (file.size > MAX_BYTES) {
      setStatus({
        type: 'error',
        text: `This file is ${(file.size / 1_000_000).toFixed(1)} MB. The limit is 5 MB.`,
      })
      return
    }

    setStatus({ type: 'working', text: 'Uploading...' })
    try {
      const permit = await getCvUploadSignatureAction()
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

      const saved = await saveCvAction(data.public_id, title, version)
      if (saved.error) throw new Error(saved.error)

      setTitle('')
      setVersion('')
      if (fileRef.current) fileRef.current.value = ''
      setStatus({ type: 'success', text: 'CV uploaded.' })
      router.refresh()
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'The upload failed.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-fg">Upload a CV</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cv-title" className="text-sm font-medium text-fg">
            Title
          </label>
          <input
            id="cv-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            placeholder="Daniel Temesgen CV"
            disabled={busy}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cv-version" className="text-sm font-medium text-fg">
            Version (optional)
          </label>
          <input
            id="cv-version"
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            maxLength={30}
            placeholder="2026"
            disabled={busy}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="cv-file" className="text-sm font-medium text-fg">
          PDF file
        </label>
        <input
          id="cv-file"
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          disabled={busy}
          className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-bg file:px-3 file:py-2 file:text-sm file:font-semibold file:text-fg"
        />
        <p className="mt-1 text-xs text-muted">PDF only, up to 5 MB.</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {busy ? 'Uploading...' : 'Upload CV'}
        </button>
        <p
          role={status.type === 'error' ? 'alert' : 'status'}
          className={`text-sm ${
            status.type === 'error'
              ? 'text-red-700 dark:text-red-300'
              : status.type === 'success'
                ? 'text-brand'
                : 'text-muted'
          }`}
        >
          {status.text}
        </p>
      </div>
    </form>
  )
}