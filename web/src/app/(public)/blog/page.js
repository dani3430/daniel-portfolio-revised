import SectionHeading from '@/components/SectionHeading'
import BlogExplorer from '@/components/BlogExplorer'
import { getPosts, getBlogCategories } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

      export function generateMetadata() {
     return buildMetadata({
       title: 'Blog | Daniel Temesgen',
       description:
         'Articles and notes on web development and the learning journey of Daniel Temesgen, a full-stack software developer.',
       path: '/blog',
     })
   }
// Refresh this page from the database at most once a minute
export const revalidate = 60

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getBlogCategories()])

  return (
    <section aria-labelledby="blog-title">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          id="blog-title"
          eyebrow="Blog"
          title="Articles and notes"
          description="Notes on web development, lessons from my learning journey, and ideas I find interesting."
        />
        <BlogExplorer posts={posts} categories={categories} />
      </div>
    </section>
  )
}