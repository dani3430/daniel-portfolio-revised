import { getProfile, getBranding, getContactLinks } from '@/lib/content'
import { getSiteUrl } from '@/lib/site'
import { socialImage } from '@/lib/seo'

// Structured data: a short, machine-readable "business card" that helps Google
// understand who this website belongs to. It is built from your admin content,
// so it stays correct when you change your name, title, photo or links.
export default async function PersonJsonLd() {
  const [profile, branding, links] = await Promise.all([
    getProfile(),
    getBranding(),
    getContactLinks(),
  ])

  const siteUrl = getSiteUrl()
  const picture = socialImage(branding.profile)

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.intro,
    url: siteUrl,
    image: picture.startsWith('/') ? `${siteUrl}${picture}` : picture,
    // Only public web profiles (not email or phone links)
    sameAs: links.map((link) => link.href).filter((href) => href.startsWith('https://')),
  }

  // "<" is escaped so that text from the database can never close the script tag early
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}