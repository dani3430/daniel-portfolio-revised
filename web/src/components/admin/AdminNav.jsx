'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/branding', label: 'Branding' },
  { href: '/admin/cv', label: 'CV' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/education', label: 'Education' },
  { href: '/admin/timeline', label: 'Timeline' },
  { href: '/admin/links', label: 'Links' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/settings', label: 'Settings' },
]

function UnreadBadge({ count }) {
  return (
    <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-brand-fg">
      {count}
      <span className="sr-only"> unread</span>
    </span>
  )
}

export default function AdminNav({ unreadCount = 0 }) {
  const pathname = usePathname()

  // The mobile menu remembers the page it was opened on, so it closes by itself
  // as soon as you open another page.
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === pathname

  useEffect(() => {
    if (!open) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpenOn(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  function isActive(item) {
    return item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  }

  const current = items.find(isActive) ?? items[0]

  return (
    <nav aria-label="Admin" className="border-b border-line bg-bg">
      {/* Phones and small tablets: one menu button */}
      <div className="md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <p className="flex items-center gap-2 font-display text-base font-semibold text-fg">
            {current.label}
            {unreadCount > 0 && !open && current.href !== '/admin/messages' && (
              <UnreadBadge count={unreadCount} />
            )}
          </p>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="admin-mobile-menu"
            onClick={() => setOpenOn(open ? null : pathname)}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

        {open && (
          <ul
            id="admin-mobile-menu"
            className="mx-auto grid max-w-6xl grid-cols-2 gap-2 border-t border-line px-4 py-3"
          >
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item) ? 'page' : undefined}
                  className={`flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    isActive(item)
                      ? 'border-brand bg-surface text-fg'
                      : 'border-line text-muted hover:text-fg'
                  }`}
                >
                  {item.label}
                  {item.href === '/admin/messages' && unreadCount > 0 && (
                    <UnreadBadge count={unreadCount} />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tablets and computers: the tab bar */}
      <ul className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-4 md:flex">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item) ? 'page' : undefined}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand ${
                isActive(item)
                  ? 'border-brand text-fg'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {item.label}
              {item.href === '/admin/messages' && unreadCount > 0 && (
                <UnreadBadge count={unreadCount} />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}