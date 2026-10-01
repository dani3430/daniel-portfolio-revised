import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import BlogCard from '../components/BlogCard'
import { posts, blogCategories } from '../data/posts'

const filters = ['All', ...blogCategories]

export default function Blog() {
  const [activeFilter, setActiveFilter] = useState('All')

  // Newest posts first
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))

  const visiblePosts =
    activeFilter === 'All'
      ? sortedPosts
      : sortedPosts.filter((post) => post.category === activeFilter)

  return (
    <section aria-labelledby="blog-title">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          id="blog-title"
          eyebrow="Blog"
          title="Articles and notes"
          description="Notes on web development, lessons from my learning journey, and ideas I find interesting."
        />

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter articles by category">
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

        <p className="sr-only" aria-live="polite">
          Showing {visiblePosts.length} {visiblePosts.length === 1 ? 'article' : 'articles'}
        </p>

        {visiblePosts.length === 0 ? (
          <div className="mt-8 max-w-md rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <p className="font-display text-lg font-semibold text-fg">No articles here yet</p>
            <p className="mt-2 text-sm text-muted">
              There are no articles in this category at the moment. Try another one.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}