import { Link, useParams } from 'react-router-dom'
import NotFound from './NotFound'
import { posts } from '../data/posts'
import { formatDate } from '../utils/formatDate'

export default function BlogPost() {
  // Reads the "slug" part of the URL, for example /blog/what-crud-means
  const { slug } = useParams()
  const post = posts.find((p) => p.slug === slug)

  // If no post matches the URL, show the 404 page
  if (!post) return <NotFound />

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <Link
        to="/blog"
        className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        &larr; Back to blog
      </Link>

      <header className="mt-8">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">
          {post.category}
          <span className="text-muted"> &middot; </span>
          <time dateTime={post.date} className="normal-case tracking-normal text-muted">
            {formatDate(post.date)}
          </time>
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-fg sm:text-4xl">
          {post.title}
        </h1>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
            >
              #{tag}
            </li>
          ))}
        </ul>
      </header>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="mt-8 w-full rounded-2xl border border-line object-cover"
        />
      )}

      <div className="mt-8 space-y-5 text-base leading-relaxed text-fg sm:text-lg">
        {post.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}