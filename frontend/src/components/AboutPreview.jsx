import { Link } from 'react-router-dom'
import SectionHeading from './SectionHeading'

// Temporary content: this will come from the admin dashboard later
const about = {
  paragraphs: [
    'I am a self-taught full-stack developer with a strong passion for technology. I build modern web applications with React, Node.js and Express, and I care about clean code, security and a great user experience.',
    'I graduated from Mekdela Amba University with a degree in Agribusiness and Value Chain Management. That background gives me a practical view of business problems, and I use it to build software that solves real needs.',
  ],
  interests: [
    'Full-stack web development',
    'SaaS products',
    'Agritech',
    'Business and marketing technology',
    'Modern web applications',
  ],
}

export default function AboutPreview() {
  return (
    <section aria-labelledby="about-heading" className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            id="about-heading"
            eyebrow="About me"
            title="From agribusiness to software"
          />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
            {about.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <Link
            to="/about"
            className="mt-8 inline-block rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Read my full story
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h3 className="font-display text-lg font-semibold text-fg">Areas of interest</h3>
          <ul className="mt-5 space-y-3">
            {about.interests.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-fg">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}