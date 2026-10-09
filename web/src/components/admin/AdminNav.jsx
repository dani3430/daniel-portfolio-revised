'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/branding', label: 'Branding' },
  { href: '/admin/cv', label: 'CV' },
]

export default function AdminNav({ unreadCount = 0 }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="border-b border-line bg-bg">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {items.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand ${
                  active
                    ? 'border-brand text-fg'
                    : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                {item.label}
                {item.href === '/admin/messages' && unreadCount > 0 && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-brand-fg">
                    {unreadCount}
                    <span className="sr-only"> unread</span>
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}