import { redirect } from 'next/navigation'
import { getAdmin } from '@/lib/auth'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Admin login',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Already signed in? Go straight to the dashboard
  if (await getAdmin()) redirect('/admin')

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Admin</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-fg">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Daniel Temesgen portfolio dashboard</p>
        <LoginForm />
      </div>
    </main>
  )
}