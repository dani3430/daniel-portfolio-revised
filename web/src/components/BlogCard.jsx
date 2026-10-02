import Link from 'next/link'
import { formatDate } from '@/utils/formatDate'

export default function BlogCard({ post }) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">
        {post.category}
        <span className="text-muted"> &middot; </span>
        <time dateTime={post.date} className="normal-case tracking-normal text-muted">
          {formatDate(post.date)}
        </time>
      </p>

      <h3 className="mt-3 font-display text-xl font-semibold text-fg">
        <Link
          href={`/blog/${post.slug}`}
          className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {post.title}
        </Link>
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
        {post.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted"
          >
            #{tag}
          </li>
        ))}
      </ul>

      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Read article &rarr;
      </Link>
    </article>
  )
}