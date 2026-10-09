import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
   import { getBranding, getCurrentCv } from '@/lib/content'

// Refresh all public pages from the database at most once a minute
export const revalidate = 60

export default async function PublicLayout({ children }) {
     const [branding, cv] = await Promise.all([getBranding(), getCurrentCv()])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Lets keyboard users skip the navigation */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
      >
        Skip to content
      </a>
         <Navbar marks={{ light: branding.mark_light, dark: branding.mark_dark }} cv={cv} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}