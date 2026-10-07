import { neon } from '@neondatabase/serverless'

// Usage: node --env-file=.env.local scripts/seed.mjs
// Copies the current hard-coded site content into the database.
// Safe to run twice: it never creates duplicates and never overwrites edits.

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is missing. Check that .env.local exists.')
  process.exit(1)
}

const sql = neon(url)
const MAX_ATTEMPTS = 6

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isConnectionError(error) {
  const text = `${error?.message ?? ''} ${error?.sourceError?.message ?? ''}`
  return /fetch failed|Error connecting to database|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|network/i.test(text)
}

// Runs one query, retrying if the connection drops
async function q(text, params = []) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await sql.query(text, params)
    } catch (error) {
      if (!isConnectionError(error) || attempt === MAX_ATTEMPTS) throw error
      console.log(`  Connection dropped, retrying (${attempt}/${MAX_ATTEMPTS - 1})...`)
      await wait(1500 * attempt)
    }
  }
}

const json = (value) => JSON.stringify(value)

// Table names here are fixed in this file, never typed by a visitor
async function isEmpty(table) {
  const rows = await q(`SELECT count(*)::int AS total FROM ${table}`)
  return rows[0].total === 0
}

// ---------------- CONTENT (copied from the current site) ----------------

const profile = {
  fullName: 'Daniel Temesgen',
  title: 'Full-Stack Software Developer',
  tagline:
    'I build fast, secure and user-friendly web applications, from the database to the interface. Self-taught, curious, and focused on solving real problems with clean code.',
  bio: [
    'I am a self-taught full-stack developer with a strong passion for technology. I build modern web applications with React, Node.js and Express, and I care about clean code, security and a great user experience.',
    'I graduated from Mekdela Amba University with a degree in Agribusiness and Value Chain Management. That background gives me a practical view of business problems, and I use it to build software that solves real needs.',
  ].join('\n\n'),
  journey: [
    'My path into software began at university, when a friend told me about a free program offered through Udacity, part of Ethiopia\u2019s 5 Million Coders initiative in partnership with the UAE. Before that, I had never written a line of code.',
    'I started with Programming Fundamentals, learning HTML, CSS and JavaScript. Within weeks I knew this was what I wanted to do, and I committed to making programming part of my everyday life.',
    'I combine my background in Agribusiness and Value Chain Management with software development, so I build solutions for real business problems faced by startups and enterprises, not just code for its own sake.',
    'I continued as a self-taught developer and was selected as a trainee in the Advanced Full-Stack Software Development program at IBT College of Canada, delivered under the Qiyas Project at Addis Ababa University in Addis Ababa. I am currently learning in this six-month program, which is deepening my skills in building complete web applications.',
    'Today I keep learning, exploring and building.',
  ],
  goals: ['AgriTech', 'SaaS products', 'Freelance projects', 'Personal projects'],
  principles: [
    {
      title: 'Complete CRUD thinking',
      text: 'Every feature should let people create, read, update and delete their own data, so content is never locked inside the code.',
    },
    {
      title: 'Real architecture',
      text: 'I organize code with a clean structure and clear separation of concerns, so applications stay reliable as they grow.',
    },
    {
      title: 'Modern software',
      text: 'I use current, well-supported tools and best practices, and I keep learning as the industry moves forward.',
    },
  ],
  interests: [
    'Full-stack web development',
    'SaaS products',
    'Agritech',
    'Business and marketing technology',
    'Modern web applications',
  ],
}

const settings = {
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

const contactLinks = [
  { kind: 'email', label: 'Email', value: 'danieltemesgen75@gmail.com', href: 'mailto:danieltemesgen75@gmail.com' },
  { kind: 'social', label: 'LinkedIn', value: 'linkedin.com/in/dani3430', href: 'https://www.linkedin.com/in/dani3430' },
  { kind: 'social', label: 'GitHub', value: 'github.com/dani3430', href: 'https://github.com/dani3430' },
  { kind: 'social', label: 'Telegram', value: '@AbjuuSirrii', href: 'https://t.me/AbjuuSirrii' },
]

const skillGroups = [
  {
    name: 'Frontend',
    description: 'Fast, responsive and accessible interfaces.',
    items: ['React.js', 'Next.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    name: 'Backend',
    description: 'Secure and well-structured server-side code.',
    items: ['Node.js', 'Express.js', 'REST APIs'],
  },
  {
    name: 'Data & Tools',
    description: 'Storing data safely and shipping code reliably.',
    items: ['Database technologies', 'Git & GitHub', 'Full-stack web development'],
  },
]

const education = [
  {
    title: 'Agribusiness and Value Chain Management',
    place: 'Mekdela Amba University',
    note: 'University degree',
  },
  {
    title: 'Advanced Full-Stack Software Development',
    place: 'IBT College of Canada, Qiyas Project at Addis Ababa University',
    note: 'Six-month program, in progress',
  },
  {
    title: 'Programming Fundamentals',
    place: 'Udacity, 5 Million Coders initiative',
    note: 'HTML, CSS and JavaScript',
  },
]

const timeline = [
  { title: 'Discovered coding', text: 'Introduced to a free Udacity program through the 5 Million Coders initiative.' },
  { title: 'Fell in love with programming', text: 'Learned HTML, CSS and JavaScript and decided to make programming my daily work.' },
  { title: 'Self-taught developer', text: 'Kept building, combining software with my Agribusiness and Value Chain background.' },
  { title: 'IBT College of Canada', text: 'Selected as a trainee in the Advanced Full-Stack Software Development program.' },
  { title: 'Today', text: 'Learning, exploring, coding and building.' },
]

const categories = [
  { kind: 'project', name: 'Web App', slug: 'web-app' },
  { kind: 'project', name: 'Data & Automation', slug: 'data-automation' },
  { kind: 'project', name: 'UI/UX Design', slug: 'ui-ux-design' },
  { kind: 'project', name: 'Graphics Design', slug: 'graphics-design' },
  { kind: 'post', name: 'Web Development', slug: 'web-development' },
  { kind: 'post', name: 'Learning Journey', slug: 'learning-journey' },
]

const projects = [
  {
    slug: 'addis-eats',
    title: 'Addis Eats',
    description:
      'A food ordering app delivering Ethiopian flavors and modern favorites across Addis Ababa, with an admin side built on CRUD operations and clean architecture.',
    categorySlug: 'web-app',
    tech: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js'],
    githubUrl: 'https://github.com/dani3430/Addis-Eats-Food-Ordering-App',
    liveUrl: 'https://addis-eats-food-ordering-app.vercel.app/',
  },
  {
    slug: 'automated-competitor-monitoring-dashboard',
    title: 'Automated Competitor Monitoring Dashboard',
    description:
      'A dashboard that compares your website and social channels with your competitors, and gives pricing, promotion and strategy recommendations.',
    categorySlug: 'data-automation',
    tech: ['HTML', 'CSS', 'Python', 'Web scraping'],
    githubUrl: 'https://github.com/dani3430/competitor-monitor',
    liveUrl: 'https://competitor-monitor-tau.vercel.app/',
  },
]

// These two are SAMPLE posts. They are saved as drafts so visitors never see them.
const posts = [
  {
    slug: 'welcome-to-my-blog',
    title: 'Welcome to my blog',
    excerpt:
      'A short introduction to what I plan to write about: web development, lessons from learning, and ideas worth sharing.',
    content: [
      'This is a sample post that shows how articles will look on this website. Real posts will be written and published from the admin dashboard.',
      'Here I plan to share notes on web development, things I learn along the way, and ideas that I find interesting.',
    ].join('\n\n'),
    categorySlug: 'learning-journey',
    tags: ['introduction', 'blog'],
    publishedAt: '2026-10-01T09:00:00Z',
    featured: true,
  },
  {
    slug: 'what-crud-means',
    title: 'What CRUD means and why every feature needs it',
    excerpt:
      'Create, Read, Update, Delete: four simple actions that sit behind almost every application you use.',
    content: [
      'CRUD stands for Create, Read, Update and Delete. These are the four basic things people do with data in an application.',
      'When you design a feature, ask whether people can do all four. If they can create something but never edit or remove it, the feature is incomplete.',
      'Thinking in CRUD also leads to better structure, because each action maps naturally to a clear piece of code on the server.',
    ].join('\n\n'),
    categorySlug: 'web-development',
    tags: ['crud', 'architecture', 'basics'],
    publishedAt: '2026-09-28T09:00:00Z',
    featured: false,
  },
]

// ---------------- SEEDING ----------------

console.log('Seeding profile...')
await q(
  `INSERT INTO profile (id, full_name, title, tagline, bio, journey, goals, principles, interests)
   VALUES (1, $1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb)
   ON CONFLICT (id) DO NOTHING`,
  [
    profile.fullName,
    profile.title,
    profile.tagline,
    profile.bio,
    json(profile.journey),
    json(profile.goals),
    json(profile.principles),
    json(profile.interests),
  ],
)

console.log('Seeding site settings...')
for (const [key, value] of Object.entries(settings)) {
  await q(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING`,
    [key, json(value)],
  )
}

console.log('Seeding contact links...')
if (await isEmpty('contact_links')) {
  for (const [index, link] of contactLinks.entries()) {
    await q(
      `INSERT INTO contact_links (kind, label, value, href, sort_order) VALUES ($1, $2, $3, $4, $5)`,
      [link.kind, link.label, link.value, link.href, index],
    )
  }
}

console.log('Seeding skills...')
if (await isEmpty('skill_groups')) {
  for (const [groupIndex, group] of skillGroups.entries()) {
    const rows = await q(
      `INSERT INTO skill_groups (name, description, sort_order) VALUES ($1, $2, $3) RETURNING id`,
      [group.name, group.description, groupIndex],
    )
    for (const [itemIndex, name] of group.items.entries()) {
      await q(`INSERT INTO skills (group_id, name, sort_order) VALUES ($1, $2, $3)`, [
        rows[0].id,
        name,
        itemIndex,
      ])
    }
  }
}

console.log('Seeding education and timeline...')
if (await isEmpty('education')) {
  for (const [index, item] of education.entries()) {
    await q(`INSERT INTO education (title, place, note, sort_order) VALUES ($1, $2, $3, $4)`, [
      item.title,
      item.place,
      item.note,
      index,
    ])
  }
}
if (await isEmpty('timeline_items')) {
  for (const [index, item] of timeline.entries()) {
    await q(`INSERT INTO timeline_items (title, text, sort_order) VALUES ($1, $2, $3)`, [
      item.title,
      item.text,
      index,
    ])
  }
}

console.log('Seeding categories...')
for (const [index, category] of categories.entries()) {
  await q(
    `INSERT INTO categories (kind, name, slug, sort_order) VALUES ($1, $2, $3, $4)
     ON CONFLICT (kind, slug) DO NOTHING`,
    [category.kind, category.name, category.slug, index],
  )
}

console.log('Seeding projects...')
for (const [index, project] of projects.entries()) {
  await q(
    `INSERT INTO projects
       (slug, title, short_description, category_id, tech, github_url, live_url, featured, published, sort_order)
     VALUES
       ($1, $2, $3,
        (SELECT id FROM categories WHERE kind = 'project' AND slug = $4),
        ARRAY(SELECT jsonb_array_elements_text($5::jsonb)),
        $6, $7, true, true, $8)
     ON CONFLICT (slug) DO NOTHING`,
    [
      project.slug,
      project.title,
      project.description,
      project.categorySlug,
      json(project.tech),
      project.githubUrl,
      project.liveUrl,
      index,
    ],
  )
}

console.log('Seeding sample blog posts (as drafts)...')
for (const post of posts) {
  await q(
    `INSERT INTO posts (slug, title, excerpt, content, category_id, featured, status, published_at)
     VALUES ($1, $2, $3, $4,
             (SELECT id FROM categories WHERE kind = 'post' AND slug = $5),
             $6, 'draft', $7)
     ON CONFLICT (slug) DO NOTHING`,
    [post.slug, post.title, post.excerpt, post.content, post.categorySlug, post.featured, post.publishedAt],
  )
  for (const tag of post.tags) {
    await q(`INSERT INTO tags (name, slug) VALUES ($1, $1) ON CONFLICT (slug) DO NOTHING`, [tag])
    await q(
      `INSERT INTO post_tags (post_id, tag_id)
       SELECT p.id, t.id FROM posts p, tags t WHERE p.slug = $1 AND t.slug = $2
       ON CONFLICT DO NOTHING`,
      [post.slug, tag],
    )
  }
}

// Summary: how many rows each table has now
const tables = [
  'profile', 'site_settings', 'contact_links', 'skill_groups', 'skills',
  'education', 'timeline_items', 'categories', 'projects', 'posts', 'tags', 'post_tags',
]
const counts = []
for (const table of tables) {
  const rows = await q(`SELECT count(*)::int AS total FROM ${table}`)
  counts.push({ table, rows: rows[0].total })
}
console.log('Done. Rows now:')
console.table(counts)