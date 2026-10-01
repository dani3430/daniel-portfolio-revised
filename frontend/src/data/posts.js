// SAMPLE CONTENT: these posts are placeholders to show the design.
// Real posts will come from the database (admin dashboard) later.
// Each post has the same shape the real API will return.
export const blogCategories = ['Web Development', 'Learning Journey']

export const posts = [
  {
    id: 1,
    slug: 'welcome-to-my-blog',
    title: 'Welcome to my blog',
    excerpt:
      'A short introduction to what I plan to write about: web development, lessons from learning, and ideas worth sharing.',
    content: [
      'This is a sample post that shows how articles will look on this website. Real posts will be written and published from the admin dashboard.',
      'Here I plan to share notes on web development, things I learn along the way, and ideas that I find interesting.',
    ],
    category: 'Learning Journey',
    tags: ['introduction', 'blog'],
    date: '2026-10-01',
    featured: true,
    image: '',
  },
  {
    id: 2,
    slug: 'what-crud-means',
    title: 'What CRUD means and why every feature needs it',
    excerpt:
      'Create, Read, Update, Delete: four simple actions that sit behind almost every application you use.',
    content: [
      'CRUD stands for Create, Read, Update and Delete. These are the four basic things people do with data in an application.',
      'When you design a feature, ask whether people can do all four. If they can create something but never edit or remove it, the feature is incomplete.',
      'Thinking in CRUD also leads to better structure, because each action maps naturally to a clear piece of code on the server.',
    ],
    category: 'Web Development',
    tags: ['crud', 'architecture', 'basics'],
    date: '2026-09-28',
    featured: false,
    image: '',
  },
]