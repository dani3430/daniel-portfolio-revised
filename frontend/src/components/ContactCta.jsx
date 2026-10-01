import { Link } from 'react-router-dom'

export default function ContactCta() {
  return (
    <section aria-labelledby="cta-heading" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 text-center sm:px-12 sm:py-16">
          {/* Soft decorative glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <h2
              id="cta-heading"
              className="font-display text-3xl font-bold text-fg sm:text-4xl"
            >
              Let&apos;s build something together
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              Have a project in mind, a job opportunity, or just want to say hello? I would love to
              hear from you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact"
                className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Get in touch
              </Link>
              <Link
                to="/projects"
                className="rounded-lg border border-line bg-bg px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                See my work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}