const linkBase =
  'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

const placeholderClass = `${linkBase} cursor-not-allowed border border-dashed border-line text-muted opacity-70`

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export default function ProjectCard({ project }) {
  const { title, description, image, tech, category, githubUrl, liveUrl } = project

  // On your computer, missing links show as dashed placeholders. On the public site they are hidden.
  const showPlaceholders = process.env.NODE_ENV === 'development'
  const showLinks = Boolean(githubUrl || liveUrl || showPlaceholders)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-brand">
      {/* Image area: shows a placeholder until a real screenshot is added */}
      <div className="relative aspect-video w-full overflow-hidden bg-bg">
        {image ? (
          <img
            src={image}
            alt={`Screenshot of ${title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-linear-to-br from-brand/20 to-sky-500/20 font-display text-4xl font-bold text-brand"
            aria-hidden="true"
          >
            {title
              .split(' ')
              .slice(0, 2)
              .map((word) => word[0])
              .join('')}
          </div>
        )}
        {category && (
          <span className="absolute left-3 top-3 rounded-full border border-line bg-surface/90 px-3 py-1 text-xs font-semibold text-fg backdrop-blur">
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
          {tech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-fg"
            >
              {t}
            </li>
          ))}
        </ul>

        {showLinks && (
          <div className="mt-5 flex flex-wrap gap-3">
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title}: live demo (opens in a new tab)`}
                className={`${linkBase} bg-brand text-brand-fg hover:opacity-90`}
              >
                <ExternalLinkIcon />
                Live demo
              </a>
            ) : (
              showPlaceholders && (
                <span className={placeholderClass}>
                  <ExternalLinkIcon />
                  Live demo
                </span>
              )
            )}

            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title}: source code on GitHub (opens in a new tab)`}
                className={`${linkBase} border border-line bg-bg text-fg hover:border-brand hover:text-brand`}
              >
                <GithubIcon />
                Source code
              </a>
            ) : (
              showPlaceholders && (
                <span className={placeholderClass}>
                  <GithubIcon />
                  Source code
                </span>
              )
            )}
          </div>
        )}
      </div>
    </article>
  )
}