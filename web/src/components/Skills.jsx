import SectionHeading from './SectionHeading'

// Temporary content: this will come from the admin dashboard later
const skillGroups = [
  {
    title: 'Frontend',
    description: 'Fast, responsive and accessible interfaces.',
    items: ['React.js', 'Next.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    title: 'Backend',
    description: 'Secure and well-structured server-side code.',
    items: ['Node.js', 'Express.js', 'REST APIs'],
  },
  {
    title: 'Data & Tools',
    description: 'Storing data safely and shipping code reliably.',
    items: ['Database technologies', 'Git & GitHub', 'Full-stack web development'],
  },
]

export default function Skills() {
  return (
    <section aria-labelledby="skills-heading" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          id="skills-heading"
          eyebrow="Skills"
          title="Technologies I work with"
          description="A modern toolkit for building complete web applications, from the interface to the database."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand"
            >
              <h3 className="font-display text-xl font-semibold text-fg">{group.title}</h3>
              <p className="mt-1 text-sm text-muted">{group.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-fg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}