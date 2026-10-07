'use server'

import { redirect } from 'next/navigation'
import {
  checkCredentials,
  createSession,
  getIpHash,
  isLoginLocked,
  recordLoginAttempt,
} from '@/lib/auth'

export async function loginAction(previousState, formData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  // Server-side validation (never trust the browser alone)
  if (!email || !password || email.length > 254 || password.length > 200) {
    return { error: 'Enter your email and password.', email }
  }

  let user = null
  try {
    const ipHash = await getIpHash()

    if (await isLoginLocked(ipHash)) {
      return { error: 'Too many failed attempts. Please wait 15 minutes and try again.', email }
    }

    user = await checkCredentials(email, password)
    await recordLoginAttempt(ipHash, Boolean(user))
    if (user) await createSession(user.id)
  } catch (error) {
    console.error('Login failed unexpectedly:', error)
    return { error: 'Something went wrong. Please try again.', email }
  }

  // The same message for a wrong email and a wrong password
  if (!user) return { error: 'Incorrect email or password.', email }

  redirect('/admin')
}