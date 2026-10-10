import { getSiteUrl } from '@/lib/site'

// Tells search engines what they may visit. The admin area and the API stay private.
export default function robots() {
  const siteUrl = getSiteUrl()

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}