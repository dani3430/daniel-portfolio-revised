import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import ProjectCard from '../components/ProjectCard'
import { projects, categories } from '../data/projects'

// Filter buttons: "All" plus every category, even those with no projects yet
const filters = ['All', ...categories]

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All')

  const visibleProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.category === activeFilter)

  return (
    <section aria-labelledby="projects-title">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          id="projects-title"
          eyebrow="Projects"
          title="Things I have built"
          description="Applications, tools and designs I have created, from idea to finished product."
        />

        {/* Category filter */}
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {filters.map((filter) => {
            const isActive = filter === activeFilter
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={isActive}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  isActive
                    ? 'border-brand bg-brand text-brand-fg'
                    : 'border-line bg-surface text-muted hover:border-brand hover:text-fg'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>

        {/* Screen readers hear the result count when the filter changes */}
        <p className="sr-only" aria-live="polite">
          Showing {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}
        </p>

        {visibleProjects.length === 0 ? (
          <div className="mt-8 max-w-md rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Coming soon
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold text-fg">{activeFilter}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              I am working on projects in this area. They will appear here as soon as they are ready.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}