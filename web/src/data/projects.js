// The full list of project categories, in the order the filter buttons appear.
// A category with no projects yet shows a "Coming soon" card.
export const categories = ['Web App', 'Data & Automation', 'UI/UX Design', 'Graphics Design']

// Temporary content: this will come from the database (admin dashboard) later.
// Each project has the same shape the real API will return.
export const projects = [
  {
    id: 1,
    title: 'Addis Eats',
    description:
      'A food ordering app delivering Ethiopian flavors and modern favorites across Addis Ababa, with an admin side built on CRUD operations and clean architecture.',
    image: '',
    tech: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js'],
    category: 'Web App',
    featured: true,
    githubUrl: 'https://github.com/dani3430/Addis-Eats-Food-Ordering-App',
    liveUrl: 'https://addis-eats-food-ordering-app.vercel.app/',
  },
  {
    id: 2,
    title: 'Automated Competitor Monitoring Dashboard',
    description:
      'A dashboard that compares your website and social channels with your competitors, and gives pricing, promotion and strategy recommendations.',
    image: '',
    tech: ['HTML', 'CSS', 'Python', 'Web scraping'],
    category: 'Data & Automation',
    featured: true,
    githubUrl: 'https://github.com/dani3430/competitor-monitor',
    liveUrl: 'https://competitor-monitor-tau.vercel.app/',
  },
]