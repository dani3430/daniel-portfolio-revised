import SectionHeading from '@/components/SectionHeading'
import Skills from '@/components/Skills'
import ContactCta from '@/components/ContactCta'
import Reveal from '@/components/Reveal'
import DownloadCvButton from '@/components/DownloadCvButton'
   import { getProfile, getEducation, getTimeline, getBranding, getCurrentCv } from '@/lib/content'

export const metadata = {
  title: 'About | Daniel Temesgen',
  description:
    'The story of Daniel Temesgen: a self-taught full-stack developer who combines an Agribusiness and Value Chain background with modern web development.',
}

export default async function AboutPage() {
      const [profile, education, timeline, branding, cv] = await Promise.all([
       getProfile(),
       getEducation(),
       getTimeline(),
       getBranding(),
       getCurrentCv(),
     ])

  return (
    <>
      {/* Introduction and journey */}
      <section aria-labelledby="about-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-3 lg:gap-16">
          <div className="mx-auto w-48 sm:w-56 lg:mx-0 lg:w-full">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface">
              <img
                src={branding.profile}
                alt={`Portrait of ${profile.name}`}
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
              title={profile.name}
              description={profile.title}
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
              {profile.journey.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
               <DownloadCvButton cv={cv} variant="primary" className="mt-8" />
          </div>
        </div>
      </section>

      {/* Education */}
      {education.length > 0 && (
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
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
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
      )}

      {/* Goals */}
      {profile.goals.length > 0 && (
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
                {profile.goals.map((goal) => (
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
      )}

      {/* Philosophy */}
      {profile.principles.length > 0 && (
        <Reveal>
          <section aria-labelledby="philosophy-heading" className="border-t border-line">
            <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
              <SectionHeading id="philosophy-heading" eyebrow="Philosophy" title="How I build" />
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {profile.principles.map((p) => (
                  <article key={p.title} className="rounded-2xl border border-line bg-surface p-6">
                    <h3 className="font-display text-lg font-semibold text-fg">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal>
        <Skills />
      </Reveal>
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  )
}