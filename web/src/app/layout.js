import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import FlowerBackground from '@/components/FlowerBackground'
import { getBranding, getSiteSettings } from '@/lib/content'
import { getSiteUrl } from '@/lib/site'

// Fonts are downloaded at build time and served from your own site (faster, more private)
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export async function generateMetadata() {
       const [branding, settings] = await Promise.all([getBranding(), getSiteSettings()])
  return {
      // Lets relative addresses (such as /about) become full addresses in search and share previews
       metadataBase: new URL(getSiteUrl()),
          title: settings.site.title,
       description: settings.site.description,
    // Only set when you uploaded a favicon
    ...(branding.favicon ? { icons: { icon: branding.favicon } } : {}),
  }
}

// Applies the saved theme before the page paints, to avoid a white flash
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var dark = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <FlowerBackground />
        {children}
      </body>
    </html>
  )
}