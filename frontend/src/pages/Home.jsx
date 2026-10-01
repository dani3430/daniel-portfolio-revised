import Hero from '../components/Hero'
import Skills from '../components/Skills'
import FeaturedProjects from '../components/FeaturedProjects'
import AboutPreview from '../components/AboutPreview'
import BlogPreview from '../components/BlogPreview'
import ContactCta from '../components/ContactCta'

export default function Home() {
  return (
    <>
      <Hero />
      <Skills />
      <FeaturedProjects />
      <AboutPreview />
      <BlogPreview />
      <ContactCta />
    </>
  )
}