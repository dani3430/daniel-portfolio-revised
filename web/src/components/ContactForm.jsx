'use client'

import { useState } from 'react'
import { sendContactMessage } from '@/services/contactService'

const initialValues = {
  name: '',
  email: '',
  subject: '',
  phone: '',
  company: '',
  message: '',
  website: '', // honeypot: real visitors never see or fill this
}

// A phone number must start with "+" and a country code, then 8 to 15 digits in total
function isValidPhone(value) {
  const cleaned = value.replace(/[\s\-().]/g, '')
  return /^\+[1-9]\d{7,14}$/.test(cleaned)
}

// Client-side validation. The backend will repeat these checks later.
// Errors are added in the same order as the fields appear on screen.
function validate(values) {
  const errors = {}
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'Please enter a valid email address, like name@example.com.'
  if (values.subject.trim().length < 3) errors.subject = 'Please enter a short subject.'
  if (values.phone.trim() && !isValidPhone(values.phone))
    errors.phone = 'Please enter a valid number with your country code, like +251 911 223 344.'
  if (values.message.trim().length < 10)
    errors.message = 'Please write at least 10 characters.'
  return errors
}

function TextField({ id, label, required, error, hint, as: Tag = 'input', ...props }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-brand"> *</span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      <Tag
        id={id}
        name={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        className={`mt-1.5 block w-full rounded-lg border bg-bg px-3.5 text-sm text-fg transition-colors placeholder:text-muted/70 focus:border-brand focus-visible:outline-2 focus-visible:outline-brand ${
          Tag === 'textarea' ? 'min-h-36 resize-y py-3' : 'h-11'
        } ${error ? 'border-red-500' : 'border-line hover:border-muted'}`}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default function ContactForm() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear the error for a field as soon as the visitor edits it
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    // Spam bots fill the hidden field: pretend success and send nothing
    if (values.website) {
      setStatus('success')
      return
    }

    const foundErrors = validate(values)
    const firstInvalid = Object.keys(foundErrors)[0]
    if (firstInvalid) {
      setErrors(foundErrors)
      // Move the cursor to the first field that needs attention
      document.getElementById(firstInvalid)?.focus()
      return
    }

    setStatus('submitting')
    try {
      await sendContactMessage(values)
      setValues(initialValues)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-line bg-surface p-8 text-center shadow-sm sm:p-10"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-fg">Message sent</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Thank you for contacting me. Your message has been received, and I will get back to you as
          soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 rounded-lg border border-line bg-bg px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Send another message
        </button>
      </div>
    )
  }

  const isSubmitting = status === 'submitting'

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-fg">Send me a message</h2>
        <p className="mt-1 text-sm text-muted">
          Fields marked <span className="text-brand">*</span> are required.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="name" label="Full name" required placeholder="Your full name" maxLength={100} value={values.name} onChange={handleChange} error={errors.name} autoComplete="name" />
        <TextField id="email" label="Email" required type="email" placeholder="you@example.com" maxLength={254} value={values.email} onChange={handleChange} error={errors.email} autoComplete="email" />
      </div>

      <TextField id="subject" label="Subject" required placeholder="What is this about?" maxLength={150} value={values.subject} onChange={handleChange} error={errors.subject} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="phone"
          label="Phone"
          type="tel"
          placeholder="+251 9XX XXX XXX"
          hint="Include your country code, like +251."
          maxLength={25}
          value={values.phone}
          onChange={handleChange}
          error={errors.phone}
          autoComplete="tel"
        />
        <TextField id="company" label="Company" placeholder="Company or organization" maxLength={100} value={values.company} onChange={handleChange} error={errors.company} autoComplete="organization" />
      </div>

      <div>
        <TextField
          id="message"
          label="Message"
          required
          as="textarea"
          rows={6}
          placeholder="Tell me about your project, opportunity or question..."
          maxLength={2000}
          value={values.message}
          onChange={handleChange}
          error={errors.message}
        />
        <p className="mt-1.5 text-right text-xs text-muted" aria-hidden="true">
          {values.message.length} / 2000
        </p>
      </div>

      {/* Honeypot field: hidden from people, visible to bots */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={handleChange} />
      </div>

      {status === 'error' && (
        <p role="alert" className="rounded-lg border border-red-500 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          Sorry, your message could not be sent. Please try again, or contact me directly using the
          links on this page.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
          </svg>
        )}
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}