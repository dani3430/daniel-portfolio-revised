import { getContactLinks } from '@/lib/content'

// Simple outline icons, one per link label
const icons = {
  Email: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  GitHub: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  Telegram: (
    <>
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </>
  ),
}

export default async function SocialLinks({ className = '' }) {
  const contactLinks = await getContactLinks()

  return (
    <ul className={`flex flex-wrap gap-3 ${className}`} aria-label="Social links">
      {contactLinks.map((link) => {
        const icon = icons[link.label]
        if (!icon) return null

        // Email opens the mail app; other links open in a new tab
        const isExternal = !link.href.startsWith('mailto:')

        return (
          <li key={link.label}>
            <a
              href={link.href}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={link.label}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-muted transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:bg-brand hover:text-brand-fg hover:shadow-lg hover:shadow-brand/30 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {icon}
              </svg>

              {/* Small label that slides in above the icon */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-9 rounded-md bg-fg px-2 py-1 text-xs font-medium text-bg opacity-0 transition-all duration-200 group-hover:-top-10 group-hover:opacity-100 group-focus-visible:-top-10 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                {link.label}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}