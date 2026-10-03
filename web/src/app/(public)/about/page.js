import SectionHeading from '@/components/SectionHeading'
import Skills from '@/components/Skills'
import ContactCta from '@/components/ContactCta'
import Reveal from '@/components/Reveal'
import DownloadCvButton from '@/components/DownloadCvButton'

export const metadata = {
  title: 'About | Daniel Temesgen',
  description:
    'The story of Daniel Temesgen: a self-taught full-stack developer who combines an Agribusiness and Value Chain background with modern web development.',
}

// Temporary content: this will come from the admin dashboard later
const journey = [
  'My path into software began at university, when a friend told me about a free program offered through Udacity, part of Ethiopia\u2019s 5 Million Coders initiative in partnership with the UAE. Before that, I had never written a line of code.',
  'I started with Programming Fundamentals, learning HTML, CSS and JavaScript. Within weeks I knew this was what I wanted to do, and I committed to making programming part of my everyday life.',
  'I combine my background in Agribusiness and Value Chain Management with software development, so I build solutions for real business problems faced by startups and enterprises, not just code for its own sake.',
  'I continued as a self-taught developer and was selected as a trainee in the Advanced Full-Stack Software Development program at IBT College of Canada, delivered under the Qiyas Project at Addis Ababa University in Addis Ababa. I am currently learning in this six-month program, which is deepening my skills in building complete web applications.',
  'Today I keep learning, exploring and building.',
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

const goals = ['AgriTech', 'SaaS products', 'Freelance projects', 'Personal projects']

const principles = [
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
]

export default function AboutPage() {
  return (
    <>
      {/* Introduction and journey */}
      <section aria-labelledby="about-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-3 lg:gap-16">
          <div className="mx-auto w-48 sm:w-56 lg:mx-0 lg:w-full">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface">
              <img
                src="/profile.png"
                alt="Portrait of Daniel Temesgen"
                width="600"
                height="600"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <SectionHeading
              id="about-title"
              eyebrow="About me"
              title="Daniel Temesgen"
              description="Full-Stack Software Developer"
            />
                        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
              {journey.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
            <DownloadCvButton variant="primary" className="mt-8" />
          </div>
        </div>
      </section>

      {/* Education */}
      <Reveal>
        <section aria-labelledby="education-heading" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <SectionHeading id="education-heading" eyebrow="Education" title="Learning path" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {education.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-brand">
                    {item.note}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-fg">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.place}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Timeline */}
      <Reveal>
        <section aria-labelledby="timeline-heading" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <SectionHeading id="timeline-heading" eyebrow="Journey" title="How I got here" />
            <ol className="mt-10 max-w-2xl border-l border-line">
              {timeline.map((step) => (
                <li key={step.title} className="relative pb-8 pl-8 last:pb-0">
                  <span
                    className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-bg bg-brand"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-semibold text-fg">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      {/* Goals */}
      <Reveal>
        <section aria-labelledby="goals-heading" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <SectionHeading
              id="goals-heading"
              eyebrow="Goals"
              title="What I am aiming for"
              description="I want to build technology that solves real problems, and I am focused on four areas."
            />
            <ul className="mt-8 flex flex-wrap gap-3">
              {goals.map((goal) => (
                <li
                  key={goal}
                  className="rounded-full border border-line bg-surface px-5 py-2 text-sm font-semibold text-fg"
                >
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* Philosophy */}
      <Reveal>
        <section aria-labelledby="philosophy-heading" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <SectionHeading id="philosophy-heading" eyebrow="Philosophy" title="How I build" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {principles.map((p) => (
                <article key={p.title} className="rounded-2xl border border-line bg-surface p-6">
                  <h3 className="font-display text-lg font-semibold text-fg">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <Skills />
      </Reveal>
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  )
}