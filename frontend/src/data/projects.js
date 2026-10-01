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
      'A food ordering application where customers can browse meals and place orders, built as a modern e-commerce experience.',
    image: '',
    tech: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js'],
    category: 'Web App',
    featured: true,
    githubUrl: '',
    liveUrl: '',
  },
  {
    id: 2,
    title: 'Automated Competitor Monitoring Dashboard',
    description:
      'A dashboard that uses web scraping to automatically track competitors and present the results in one clear view.',
    image: '',
    tech: ['HTML', 'CSS', 'Python', 'Web scraping'],
    category: 'Data & Automation',
    featured: true,
    githubUrl: '',
    liveUrl: '',
  },
]