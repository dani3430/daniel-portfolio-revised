'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, { error: '', email: '' })

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-fg">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          defaultValue={state.email}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-fg">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}