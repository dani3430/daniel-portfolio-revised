import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NotFoundContent from '@/components/NotFoundContent'

// Shown for any address that does not exist. Built once, so it costs nothing to serve.
export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </div>
  )
}