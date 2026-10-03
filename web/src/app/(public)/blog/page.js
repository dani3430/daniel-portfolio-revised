import SectionHeading from '@/components/SectionHeading'
import BlogExplorer from '@/components/BlogExplorer'

export const metadata = {
  title: 'Blog | Daniel Temesgen',
  description:
    'Articles and notes on web development and the learning journey of Daniel Temesgen, a full-stack software developer.',
}

export default function BlogPage() {
  return (
    <section aria-labelledby="blog-title">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          id="blog-title"
          eyebrow="Blog"
          title="Articles and notes"
          description="Notes on web development, lessons from my learning journey, and ideas I find interesting."
        />
        <BlogExplorer />
      </div>
    </section>
  )
}