export default function ProjectCard({ project }) {
  const { title, description, image, tech, githubUrl, liveUrl } = project

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-brand">
      {/* Image area: shows a placeholder until a real screenshot is added */}
      <div className="aspect-video w-full overflow-hidden bg-bg">
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

        {(githubUrl || liveUrl) && (
          <div className="mt-5 flex gap-4 text-sm font-semibold">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Live demo
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}