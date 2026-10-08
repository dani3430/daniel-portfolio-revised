import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import PostForm from '@/components/admin/PostForm'
import { updatePostAction } from '../actions'

export const metadata = {
  title: 'Edit post | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }) {
  await requireAdmin()

  const { id } = await params
  if (!/^\d{1,18}$/.test(id)) notFound()

  const sql = getSql()
  const [posts, categories] = await Promise.all([
    sql`
      SELECT p.id, p.slug, p.title, p.excerpt, p.content, p.category_id, p.featured, p.status,
             p.published_at, p.seo_title, p.seo_description,
             COALESCE(
               (SELECT string_agg(t.name, ', ' ORDER BY t.name)
                FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
                WHERE pt.post_id = p.id),
               ''
             ) AS tags
      FROM posts p
      WHERE p.id = ${id}
    `,
    sql`SELECT id, name FROM categories WHERE kind = 'post' ORDER BY sort_order, id`,
  ])
  if (posts.length === 0) notFound()
  const post = posts[0]

  const initial = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    categoryId: post.category_id ? String(post.category_id) : '',
    tags: post.tags,
    status: post.status,
    publishedAt: post.published_at ? new Date(post.published_at).toISOString() : '',
    featured: post.featured,
    seoTitle: post.seo_title ?? '',
    seoDescription: post.seo_description ?? '',
  }

  return (
    <>
      <Link
        href="/admin/blog"
        className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        &larr; Back to blog
      </Link>
      <h1 className="mt-6 mb-8 break-words font-display text-3xl font-bold text-fg">
        Edit: {post.title}
      </h1>
      <PostForm
        action={updatePostAction}
        initial={initial}
        postId={String(post.id)}
        categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
        submitLabel="Save changes"
      />
    </>
  )
}