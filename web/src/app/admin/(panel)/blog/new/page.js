import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'
import PostForm from '@/components/admin/PostForm'
import { createPostAction } from '../actions'

export const metadata = {
  title: 'New post | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  categoryId: '',
  tags: '',
  status: 'draft',
  publishedAt: '',
  featured: false,
  seoTitle: '',
  seoDescription: '',
}

export default async function NewPostPage() {
  await requireAdmin()

  const categories = await getSql()`
    SELECT id, name FROM categories WHERE kind = 'post' ORDER BY sort_order, id
  `

  return (
    <>
      <Link
        href="/admin/blog"
        className="text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        &larr; Back to blog
      </Link>
      <h1 className="mt-6 mb-8 font-display text-3xl font-bold text-fg">New post</h1>
      <PostForm
        action={createPostAction}
        initial={emptyPost}
        categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
        submitLabel="Save post"
      />
    </>
  )
}