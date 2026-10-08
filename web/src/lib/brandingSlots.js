// The image slots you can manage from the admin. Used by both the page and the server.

export const CLOUD_FOLDER = 'portfolio'

export const SLOTS = {
  mark_light: {
    label: 'Header symbol (light theme)',
    help: 'Small symbol at the top-left of the site while the light theme is on.',
    folder: 'marks',
    kind: 'logo',
    alt: 'Logo symbol',
    formats: ['png', 'svg', 'webp'],
    maxBytes: 1_000_000,
    fallback: '/mark-light.png',
    previewTheme: 'light',
  },
  mark_dark: {
    label: 'Header symbol (dark theme)',
    help: 'Small symbol at the top-left of the site while the dark theme is on.',
    folder: 'marks',
    kind: 'logo',
    alt: 'Logo symbol',
    formats: ['png', 'svg', 'webp'],
    maxBytes: 1_000_000,
    fallback: '/mark-dark.png',
    previewTheme: 'dark',
  },
  logo_light: {
    label: 'Full logo (light theme)',
    help: 'Larger logo with your name, shown in the footer on the light theme.',
    folder: 'logos',
    kind: 'logo',
    alt: 'Daniel Temesgen logo',
    formats: ['png', 'svg', 'webp'],
    maxBytes: 1_500_000,
    fallback: '/logo-full-light.png',
    previewTheme: 'light',
  },
  logo_dark: {
    label: 'Full logo (dark theme)',
    help: 'Larger logo with your name, shown in the footer on the dark theme.',
    folder: 'logos',
    kind: 'logo',
    alt: 'Daniel Temesgen logo',
    formats: ['png', 'svg', 'webp'],
    maxBytes: 1_500_000,
    fallback: '/logo-full-dark.png',
    previewTheme: 'dark',
  },
  profile: {
    label: 'Profile photo',
    help: 'Your portrait on the Home page and the About page. A clear, front-facing photo works best.',
    folder: 'profile',
    kind: 'image',
    alt: 'Portrait of Daniel Temesgen',
    formats: ['jpg', 'jpeg', 'png', 'webp'],
    maxBytes: 4_000_000,
    fallback: '/profile.png',
    previewTheme: 'light',
  },
  favicon: {
    label: 'Favicon',
    help: 'The tiny icon in the browser tab. A square PNG or SVG works best.',
    folder: 'favicon',
    kind: 'favicon',
    alt: 'Site icon',
    formats: ['png', 'svg'],
    maxBytes: 500_000,
    fallback: '/favicon.ico',
    previewTheme: 'light',
  },
}

export const SLOT_KEYS = Object.keys(SLOTS)