import { getBranding } from '@/lib/content'

const SITE_NAME = 'Daniel Temesgen'

// Social apps (LinkedIn, Telegram, WhatsApp) read JPG images best,
// so the picture is requested as a JPG and kept to a sensible size.
export function socialImage(url) {
  if (!url) return '/profile.png'
  if (!url.startsWith('https://res.cloudinary.com/')) return url
  if (url.includes('f_auto')) return url.replace('f_auto', 'f_jpg')
  return url.replace('/image/upload/', '/image/upload/f_jpg,q_auto,c_limit,w_1200/')
}

// Builds the title, description, share preview (Open Graph, Twitter) and
// canonical address for one page. "path" is the page address, such as "/about".
export async function buildMetadata({ title, description, path, image, type = 'website', publishedTime }) {
  const branding = await getBranding()
  const picture = socialImage(image || branding.profile)

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: [{ url: picture }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [picture],
    },
  }
}