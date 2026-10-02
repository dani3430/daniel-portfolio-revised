export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Daniel Temesgen. All rights reserved.</p>
        <p>Full-Stack Software Developer</p>
      </div>
    </footer>
  )
}