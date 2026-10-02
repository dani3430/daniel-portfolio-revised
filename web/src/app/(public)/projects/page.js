import SectionHeading from '@/components/SectionHeading'
import ProjectsExplorer from '@/components/ProjectsExplorer'

export const metadata = {
  title: 'Projects | Daniel Temesgen',
  description:
    'Web applications, tools and designs created by Daniel Temesgen, a full-stack software developer.',
}

export default function ProjectsPage() {
  return (
    <section aria-labelledby="projects-title">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          id="projects-title"
          eyebrow="Projects"
          title="Things I have built"
          description="Applications, tools and designs I have created, from idea to finished product."
        />
        <ProjectsExplorer />
      </div>
    </section>
  )
}