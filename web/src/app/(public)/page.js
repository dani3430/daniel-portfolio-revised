import Hero from '@/components/Hero'
import Skills from '@/components/Skills'
import FeaturedProjects from '@/components/FeaturedProjects'
import AboutPreview from '@/components/AboutPreview'
import BlogPreview from '@/components/BlogPreview'
import ContactCta from '@/components/ContactCta'
import Reveal from '@/components/Reveal'
import { getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import PersonJsonLd from '@/components/PersonJsonLd'

// The home page title and description come from Admin > Settings
export async function generateMetadata() {
  const settings = await getSiteSettings()
  return buildMetadata({
    title: settings.site.title,
    description: settings.site.description,
    path: '/',
  })
}

// Refresh this page from the database at most once a minute
export const revalidate = 60

export default function Home() {
  return (
    <>
    <PersonJsonLd />
      <Hero />
      <Reveal>
        <Skills />
      </Reveal>
      <Reveal>
        <FeaturedProjects />
      </Reveal>
      <Reveal>
        <AboutPreview />
      </Reveal>
      <Reveal>
        <BlogPreview />
      </Reveal>
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  )
}