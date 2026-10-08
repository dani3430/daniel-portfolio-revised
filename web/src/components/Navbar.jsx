'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import DownloadCvButton from './DownloadCvButton'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

// Home matches only "/"; other links also match their sub-pages (like /blog/my-post)
function isActive(pathname, href) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

function linkClass(active) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    active ? 'text-brand' : 'text-muted hover:text-fg'
  }`
}

export default function Navbar({ marks = { light: '/mark-light.png', dark: '/mark-dark.png' } }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4"
        aria-label="Main"
      >
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:gap-2.5"
          onClick={() => setOpen(false)}
        >
          {/* Light-mode symbol (hidden in dark mode) */}
          <img
           src={marks.light}
            alt=""
            width="232"
            height="192"
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:h-9 dark:hidden"
          />
          {/* Dark-mode symbol (hidden in light mode) */}
          <img
           src={marks.dark}
            alt=""
            width="232"
            height="192"
            className="hidden h-8 w-auto transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:h-9 dark:block"
          />
          <span className="whitespace-nowrap font-display text-base font-bold text-fg sm:text-lg">
            Daniel Temesgen
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = isActive(pathname, l.href)
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={linkClass(active)}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          {/* The wrapper is hidden below large screens, so the button never crowds the phone navbar */}
          <div className="hidden lg:block">
            <DownloadCvButton variant="primary" compact />
          </div>

          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-fg md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul id="mobile-menu" className="border-t border-line bg-bg px-4 py-3 md:hidden">
          {links.map((l) => {
            const active = isActive(pathname, l.href)
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block ${linkClass(active)}`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
          <li className="pt-3">
            <DownloadCvButton variant="secondary" className="w-full" />
          </li>
        </ul>
      )}
    </header>
  )
}