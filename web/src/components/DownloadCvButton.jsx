import { cv as fallbackCv } from '@/data/cv'

// Colors for each look, so the button fits each place on the site
const looks = {
  primary: 'bg-brand text-brand-fg hover:opacity-90',
  secondary: 'border border-line bg-surface text-fg hover:border-brand hover:text-brand',
  link: 'text-brand hover:underline',
}

const baseClass =
  'inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}

export default function DownloadCvButton({
  cv = fallbackCv,
  variant = 'secondary',
  compact = false,
  className = '',
}) {
  // Shape and size: plain links have none; buttons are smaller when compact
  const shape = variant === 'link' ? '' : compact ? 'rounded-lg px-4 py-2' : 'rounded-lg px-6 py-3'

  if (!cv.published) {
    // On the public website, show nothing until a CV is published
    if (process.env.NODE_ENV !== 'development') return null

    // On your computer, show a dashed placeholder so you can see where the button goes
    return (
      <span
        className={`${baseClass} ${shape} cursor-not-allowed text-muted opacity-70 ${
          variant === 'link' ? '' : 'border border-dashed border-line'
        } ${className}`}
      >
        <DownloadIcon />
        Download CV
      </span>
    )
  }

  return (
    <a
      href={cv.url}
      download={cv.fileName}
      className={`${baseClass} ${shape} ${looks[variant]} ${className}`}
    >
      <DownloadIcon />
      Download CV
    </a>
  )
}