import Link from 'next/link'
import SectionHeading from './SectionHeading'
import ProjectCard from './ProjectCard'
import { getProjects } from '@/lib/content'

export default async function FeaturedProjects() {
  // Only show projects marked as featured
  const projects = await getProjects()
  const featuredProjects = projects.filter((project) => project.featured)

  return (
    <section aria-labelledby="projects-heading" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            id="projects-heading"
            eyebrow="Projects"
            title="Featured work"
            description="A selection of things I have built, from idea to working application."
          />
          <Link
            href="/projects"
            className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            View all projects &rarr;
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}