// Reads the public website content from the database.
// If the database cannot be reached, each function returns a safe fallback,
// so the website keeps working instead of showing an error page.

import { cache } from 'react'
import { getSql } from '@/lib/db'
import {
  projects as fallbackProjects,
  categories as fallbackProjectCategories,
} from '@/data/projects'
import { contactLinks as fallbackContactLinks } from '@/data/contact'
import { SLOTS, SLOT_KEYS } from '@/lib/brandingSlots'
import { cv as fallbackCv } from '@/data/cv'

// One small memory per page visit. A page often needs the same content several times
// (the layout, the header, the footer and the page itself all need your branding),
// so the database is asked only once and the answer is shared.
const requestMemory = cache(() => new Map())

async function readSafely(label, read, fallback) {
  try {
    return await read(getSql())
  } catch (error) {
    // Details go to the server log only, never to the visitor
    console.error(`Could not load ${label} from the database:`, error)
    return fallback
  }
}

function safely(label, read, fallback, key = label) {
  const memory = requestMemory()
  if (!memory.has(key)) {
    memory.set(key, readSafely(label, read, fallback))
  }
  return memory.get(key)
}

// ---------------- PROJECTS ----------------

// Published projects, in the order you set. Same shape the components already use.
export function getProjects() {
  return safely(
    'projects',
    async (sql) => {
      const rows = await sql`
        SELECT p.id, p.slug, p.title, p.short_description, p.tech, p.github_url, p.live_url,
               p.featured, c.name AS category, m.url AS image
        FROM projects p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN media m ON m.id = p.cover_media_id
        WHERE p.published
        ORDER BY p.sort_order, p.id
      `
      return rows.map((row) => ({
        id: Number(row.id),
        slug: row.slug,
        title: row.title,
        description: row.short_description,
        image: row.image ?? '',
        tech: row.tech ?? [],
        category: row.category ?? '',
        featured: row.featured,
        githubUrl: row.github_url ?? '',
        liveUrl: row.live_url ?? '',
      }))
    },
    fallbackProjects,
  )
}

// Names of the project filter buttons, in order
export function getProjectCategories() {
  return safely(
    'project categories',
    async (sql) => {
      const rows = await sql`
        SELECT name FROM categories WHERE kind = 'project' ORDER BY sort_order, id
      `
      return rows.map((row) => row.name)
    },
    fallbackProjectCategories,
  )
}

// ---------------- BLOG ----------------

// A post is public only when it is published AND its date has arrived.
// A future date therefore means "scheduled".
const publicPostSelect = `
  SELECT p.id, p.slug, p.title, p.excerpt, p.content, p.featured,
         to_char(p.published_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
         c.name AS category, m.url AS image,
         COALESCE(
           (SELECT array_agg(t.name ORDER BY t.name)
            FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
            WHERE pt.post_id = p.id),
           '{}'
         ) AS tags
  FROM posts p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN media m ON m.id = p.cover_media_id
  WHERE p.status = 'published' AND p.published_at <= now()
`

// The article text is stored with blank lines between paragraphs
function toPost(row) {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    category: row.category ?? '',
    tags: row.tags ?? [],
    date: row.date,
    featured: row.featured,
    image: row.image ?? '',
  }
}

export function getPosts() {
  return safely(
    'blog posts',
    async (sql) => {
      const rows = await sql.query(`${publicPostSelect} ORDER BY p.published_at DESC`)
      return rows.map(toPost)
    },
    [],
  )
}

export function getPost(slug) {
  return safely(
    'a blog post',
    async (sql) => {
      const rows = await sql.query(`${publicPostSelect} AND p.slug = $1 LIMIT 1`, [slug])
      return rows.length > 0 ? toPost(rows[0]) : null
    },
    null,
    `post:${slug}`,
  )
}

export function getBlogCategories() {
  return safely(
    'blog categories',
    async (sql) => {
      const rows = await sql`
        SELECT name FROM categories WHERE kind = 'post' ORDER BY sort_order, id
      `
      return rows.map((row) => row.name)
    },
    [],
  )
}

// ---------------- CONTACT LINKS ----------------

// Email and social links shown on the Contact page, footer and social icons
export function getContactLinks() {
  return safely(
    'contact links',
    async (sql) => {
      const rows = await sql`
        SELECT label, value, href FROM contact_links WHERE visible ORDER BY sort_order, id
      `
      return rows.map((row) => ({ label: row.label, value: row.value, href: row.href ?? '' }))
    },
    fallbackContactLinks,
  )
}


// ---------------- PROFILE, SKILLS, SETTINGS ----------------

// Splits text stored with blank lines between paragraphs into a list
function splitParagraphs(text) {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// Used only if the database cannot be reached (kept short on purpose)
const fallbackProfile = {
  name: 'Daniel Temesgen',
  title: 'Full-Stack Software Developer',
  intro:
    'I build fast, secure and user-friendly web applications, from the database to the interface. Self-taught, curious, and focused on solving real problems with clean code.',
  bio: [],
  journey: [],
  goals: [],
  principles: [],
  interests: [],
}

export function getProfile() {
  return safely(
    'profile',
    async (sql) => {
      const rows = await sql`
        SELECT full_name, title, tagline, bio, journey, goals, principles, interests
        FROM profile WHERE id = 1
      `
      if (rows.length === 0) return fallbackProfile
      const row = rows[0]
      return {
        name: row.full_name,
        title: row.title,
        intro: row.tagline ?? '',
        bio: splitParagraphs(row.bio),
        journey: row.journey ?? [],
        goals: row.goals ?? [],
        principles: row.principles ?? [],
        interests: row.interests ?? [],
      }
    },
    fallbackProfile,
  )
}

const fallbackSkillGroups = [
  {
    title: 'Frontend',
    description: 'Fast, responsive and accessible interfaces.',
    items: ['React.js', 'Next.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    title: 'Backend',
    description: 'Secure and well-structured server-side code.',
    items: ['Node.js', 'Express.js', 'REST APIs'],
  },
  {
    title: 'Data & Tools',
    description: 'Storing data safely and shipping code reliably.',
    items: ['Database technologies', 'Git & GitHub', 'Full-stack web development'],
  },
]

export function getSkillGroups() {
  return safely(
    'skills',
    async (sql) => {
      const rows = await sql`
        SELECT g.id, g.name, g.description,
               COALESCE(
                 array_agg(s.name ORDER BY s.sort_order, s.id) FILTER (WHERE s.id IS NOT NULL),
                 '{}'
               ) AS items
        FROM skill_groups g
        LEFT JOIN skills s ON s.group_id = g.id
        GROUP BY g.id
        ORDER BY g.sort_order, g.id
      `
      return rows.map((row) => ({
        title: row.name,
        description: row.description ?? '',
        items: row.items ?? [],
      }))
    },
    fallbackSkillGroups,
  )
}

const fallbackSettings = {
  site: {
    title: 'Daniel Temesgen | Full-Stack Software Developer',
    description:
      'Personal portfolio of Daniel Temesgen, a full-stack software developer building modern web applications with React, Node.js and Express.',
  },
  hero: {
    tech: ['React', 'Node.js', 'Express', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
  },
  footer: {
    text: 'Open to freelance projects, collaboration and new opportunities in web development.',
  },
}

// All settings as one object: { site, hero, footer }
export function getSiteSettings() {
  return safely(
    'site settings',
    async (sql) => {
      const rows = await sql`SELECT key, value FROM site_settings`
      const fromDatabase = Object.fromEntries(rows.map((row) => [row.key, row.value]))
      return { ...fallbackSettings, ...fromDatabase }
    },
    fallbackSettings,
  )
}


// ---------------- ABOUT PAGE LISTS ----------------

export function getEducation() {
  return safely(
    'education',
    async (sql) => {
      const rows = await sql`SELECT title, place, note FROM education ORDER BY sort_order, id`
      return rows.map((row) => ({ title: row.title, place: row.place, note: row.note ?? '' }))
    },
    [],
  )
}

export function getTimeline() {
  return safely(
    'timeline',
    async (sql) => {
      const rows = await sql`SELECT title, text FROM timeline_items ORDER BY sort_order, id`
      return rows.map((row) => ({ title: row.title, text: row.text }))
    },
    [],
  )
}


// ---------------- BRANDING (logos, photo, favicon) ----------------

// Cloudinary can resize and compress an image on the fly. These sizes keep pages light.
const BRANDING_TRANSFORMS = {
  mark_light: 'f_auto,q_auto,c_limit,h_192',
  mark_dark: 'f_auto,q_auto,c_limit,h_192',
  logo_light: 'f_auto,q_auto,c_limit,w_640',
  logo_dark: 'f_auto,q_auto,c_limit,w_640',
  profile: 'f_auto,q_auto,c_limit,w_900',
}

function optimizeImage(url, transform) {
  const isCloudinary = url.startsWith('https://res.cloudinary.com/')
  const isSvg = /\.svg($|\?)/i.test(url)
  if (!transform || !isCloudinary || isSvg) return url
  return url.replace('/image/upload/', `/image/upload/${transform}/`)
}

// Built-in images, used for any slot that has no upload
const fallbackBranding = {
  ...Object.fromEntries(SLOT_KEYS.map((key) => [key, SLOTS[key].fallback])),
  favicon: null,
}

// The image address for each slot: your upload if there is one, otherwise the built-in file
export function getBranding() {
  return safely(
    'branding',
    async (sql) => {
      const settings = await sql`SELECT value FROM site_settings WHERE key = 'branding'`
      const assigned = settings[0]?.value ?? {}

      const ids = SLOT_KEYS.map((key) => assigned[key]).filter(Boolean)
      const files =
        ids.length > 0
          ? await sql`
              SELECT id, url FROM media
              WHERE id IN (SELECT (jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb))::bigint)
            `
          : []
      const urlById = new Map(files.map((file) => [String(file.id), file.url]))

      const result = {}
      for (const key of SLOT_KEYS) {
        const uploaded = urlById.get(String(assigned[key]))
        if (key === 'favicon') {
          result[key] = uploaded ?? null
        } else {
          result[key] = uploaded
            ? optimizeImage(uploaded, BRANDING_TRANSFORMS[key])
            : SLOTS[key].fallback
        }
      }
      return result
    },
    fallbackBranding,
  )
}

// ---------------- CV ----------------

// The CV that is both current and published, or an unpublished placeholder.
// cache() makes the layout and the page share one database read per visit.
export const getCurrentCv = cache(() =>
  safely(
    'cv',
    async (sql) => {
      const rows = await sql`
        SELECT m.url
        FROM cv_files c
        JOIN media m ON m.id = c.media_id
        WHERE c.is_current AND c.published
        LIMIT 1
      `
      if (rows.length === 0) return { ...fallbackCv, published: false }

      const fileName = 'Daniel-Temesgen-CV'
      return {
        published: true,
        // fl_attachment asks Cloudinary to download the file instead of opening it in the browser
        url: rows[0].url.replace('/upload/', `/upload/fl_attachment:${fileName}/`),
        fileName: `${fileName}.pdf`,
      }
    },
    { ...fallbackCv, published: false },
  ),
)