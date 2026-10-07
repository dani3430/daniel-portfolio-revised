import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Refresh all public pages from the database at most once a minute
export const revalidate = 60

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Lets keyboard users skip the navigation */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}