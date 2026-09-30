import { Link } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import ProjectCard from './ProjectCard'

// Temporary content: this will come from the admin dashboard later
const featuredProjects = [
  {
    id: 1,
    title: 'Addis Eats',
    description:
      'A food ordering application where customers can browse meals and place orders, built as a modern e-commerce experience.',
    image: '',
    tech: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js'],
    githubUrl: '',
    liveUrl: '',
  },
  {
    id: 2,
    title: 'Automated Competitor Monitoring Dashboard',
    description:
      'A dashboard that uses web scraping to automatically track competitors and present the results in one clear view.',
    image: '',
    tech: ['HTML', 'CSS', 'Python', 'Web scraping'],
    githubUrl: '',
    liveUrl: '',
  },
]

export default function FeaturedProjects() {
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
            to="/projects"
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