import Hero from '../components/Hero'
import Skills from '../components/Skills'
import FeaturedProjects from '../components/FeaturedProjects'
import AboutPreview from '../components/AboutPreview'
import BlogPreview from '../components/BlogPreview'
import ContactCta from '../components/ContactCta'
import Reveal from '../components/Reveal'

export default function Home() {
  return (
    <>
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