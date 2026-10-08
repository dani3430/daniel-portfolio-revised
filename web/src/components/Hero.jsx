import Link from 'next/link'
import DownloadCvButton from './DownloadCvButton'

import { getProfile, getSiteSettings, getBranding } from '@/lib/content'

export default async function Hero() {
 const [data, settings, branding] = await Promise.all([getProfile(), getSiteSettings(), getBranding()])
  const profile = {
    name: data.name,
    title: data.title,
    intro: data.intro,
    tech: settings.hero.tech,
  }
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
        {/* Text side */}
        <div>
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-widest text-brand">
            Hello, I&apos;m
          </p>
          <h1
            className="animate-fade-up mt-3 font-display text-4xl font-bold leading-tight text-fg sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '100ms' }}
          >
            {profile.name}
          </h1>
          <p
            className="animate-fade-up mt-3 font-display text-xl font-medium text-brand sm:text-2xl"
            style={{ animationDelay: '200ms' }}
          >
            {profile.title}
          </p>
          <p
            className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            style={{ animationDelay: '300ms' }}
          >
            {profile.intro}
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: '400ms' }}
          >
            <Link
              href="/projects"
              className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View My Projects
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
                           Contact Me
            </Link>
            <DownloadCvButton />
          </div>
          <ul
            className="animate-fade-up mt-10 flex flex-wrap gap-2"
            style={{ animationDelay: '500ms' }}
            aria-label="Technologies"
          >
            {profile.tech.map((t) => (
              <li
                key={t}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Photo side */}
        <div
          className="animate-fade-up relative mx-auto w-64 sm:w-72 lg:w-80"
          style={{ animationDelay: '300ms' }}
        >
          <div
            className="absolute -inset-1 rounded-3xl bg-linear-to-br from-brand to-sky-500 opacity-50 blur-lg"
            aria-hidden="true"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface">
            <img
             src={branding.profile}
              alt="Portrait of Daniel Temesgen"
              width="600"
              height="600"
              fetchPriority="high"
              className="h-full w-full object-cover object-top"
            />
          </div>

          <div
            className="animate-float absolute -bottom-4 -left-4 rounded-xl border border-line bg-surface/90 px-4 py-2 text-sm font-semibold text-fg shadow-lg backdrop-blur"
            aria-hidden="true"
          >
            &lt;/&gt; Full-Stack
          </div>
        </div>
      </div>
    </section>
  )
}