import { Link } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import BlogCard from './BlogCard'
import { posts } from '../data/posts'

export default function BlogPreview() {
  // The three newest posts
  const latestPosts = [...posts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)

  return (
    <section aria-labelledby="blog-heading" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            id="blog-heading"
            eyebrow="Blog"
            title="Latest articles"
            description="Notes on web development, lessons from my learning journey, and ideas I find interesting."
          />
          {latestPosts.length > 0 && (
            <Link
              to="/blog"
              className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Read all articles &rarr;
            </Link>
          )}
        </div>

        {latestPosts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-display text-lg font-semibold text-fg">Articles are coming soon</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              I am preparing my first posts. Check back shortly, or get in touch if you would like
              to talk about a project.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}