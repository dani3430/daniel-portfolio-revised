export default function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
      )}
      <h2 id={id} className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>}
    </div>
  )
}