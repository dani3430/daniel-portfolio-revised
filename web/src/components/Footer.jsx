import Link from 'next/link'
import SocialLinks from './SocialLinks'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link
            href="/"
            aria-label="Daniel Temesgen, home"
            className="inline-block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            {/* Light-mode logo (hidden in dark mode) */}
            <img
              src="/logo-full-light.png"
              alt="Daniel Temesgen, Full-Stack Software Developer"
              width="640"
              height="422"
              loading="lazy"
              className="h-auto w-48 dark:hidden"
            />
            {/* Dark-mode logo (hidden in light mode) */}
            <img
              src="/logo-full-dark.png"
              alt="Daniel Temesgen, Full-Stack Software Developer"
              width="640"
              height="422"
              loading="lazy"
             className="hidden h-auto w-48 dark:block"
            />
          </Link>
          <SocialLinks className="mt-6" />
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand">Explore</h2>
          <ul className="mt-4 space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand">Let&apos;s connect</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Open to freelance projects, collaboration and new opportunities in web development.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Get in touch &rarr;
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-sm text-muted sm:text-left">
          &copy; {new Date().getFullYear()} Daniel Temesgen. All rights reserved.
        </p>
      </div>
    </footer>
  )
}