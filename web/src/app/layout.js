import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

// Fonts are downloaded at build time and served from your own site (faster, more private)
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata = {
  title: 'Daniel Temesgen | Full-Stack Software Developer',
  description:
    'Personal portfolio of Daniel Temesgen, a full-stack software developer building modern web applications with React, Node.js and Express.',
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
      <body>{children}</body>
    </html>
  )
}