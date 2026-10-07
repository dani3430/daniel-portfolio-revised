import Link from 'next/link'
import SectionHeading from './SectionHeading'
import { getProfile } from '@/lib/content'

export default async function AboutPreview() {
  const profile = await getProfile()

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
            {profile.bio.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <Link
            href="/about"
            className="mt-8 inline-block rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Read my full story
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h3 className="font-display text-lg font-semibold text-fg">Areas of interest</h3>
          <ul className="mt-5 space-y-3">
            {profile.interests.map((item) => (
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