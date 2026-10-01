import { useState } from 'react'
import { sendContactMessage } from '../services/contactService'

const initialValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
  phone: '',
  company: '',
  website: '', // honeypot: real visitors never see or fill this
}

// Client-side validation. The backend will repeat these checks later.
function validate(values) {
  const errors = {}
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Please enter a valid email address.'
  if (values.subject.trim().length < 3) errors.subject = 'Please enter a subject.'
  if (values.message.trim().length < 10)
    errors.message = 'Your message should be at least 10 characters.'
  if (values.message.length > 2000)
    errors.message = 'Your message is too long (maximum 2000 characters).'
  if (values.phone && !/^[+\d\s()-]{6,20}$/.test(values.phone.trim()))
    errors.phone = 'Please enter a valid phone number, or leave it empty.'
  return errors
}

function TextField({ id, label, required, error, as: Tag = 'input', ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-brand"> *</span>
        ) : (
          <span className="text-muted"> (optional)</span>
        )}
      </label>
      <Tag
        id={id}
        name={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 block w-full rounded-lg border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          error ? 'border-red-500' : 'border-line'
        }`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
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
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors)
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
      <div role="status" className="rounded-2xl border border-brand bg-surface p-8 text-center">
        <h3 className="font-display text-xl font-semibold text-fg">Message sent</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
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
      className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="name" label="Name" required value={values.name} onChange={handleChange} error={errors.name} autoComplete="name" />
        <TextField id="email" label="Email" required type="email" value={values.email} onChange={handleChange} error={errors.email} autoComplete="email" />
      </div>

      <TextField id="subject" label="Subject" required value={values.subject} onChange={handleChange} error={errors.subject} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="phone" label="Phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} autoComplete="tel" />
        <TextField id="company" label="Company" value={values.company} onChange={handleChange} error={errors.company} autoComplete="organization" />
      </div>

      <TextField id="message" label="Message" required as="textarea" rows={6} value={values.message} onChange={handleChange} error={errors.message} />

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
        className="w-full rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}