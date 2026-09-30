import ThemeToggle from './components/ThemeToggle'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-lg">
        <h1 className="font-display text-3xl font-bold text-fg">Daniel Temesgen</h1>
        <p className="mt-2 text-lg font-medium text-brand">Full-Stack Software Developer</p>
        <p className="mt-4 text-sm text-muted">Theme toggle is working.</p>
      </div>
    </main>
  )
}

export default App