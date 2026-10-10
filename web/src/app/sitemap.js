import { getPosts } from '@/lib/content'
import { getSiteUrl } from '@/lib/site'

// Rebuilt at most once an hour, so it never slows the site down
export const revalidate = 3600

const pages = ['', '/about', '/projects', '/blog', '/contact']

export default async function sitemap() {
  const siteUrl = getSiteUrl()
  const posts = await getPosts()

  return [
    ...pages.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: path === '' || path === '/blog' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ]
}