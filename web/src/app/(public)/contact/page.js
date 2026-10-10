import SectionHeading from '@/components/SectionHeading'
import ContactForm from '@/components/ContactForm'
import DownloadCvButton from '@/components/DownloadCvButton'
import { getContactLinks, getCurrentCv } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

      export function generateMetadata() {
     return buildMetadata({
       title: 'Contact | Daniel Temesgen',
       description:
         'Get in touch with Daniel Temesgen, a full-stack software developer, about projects, job opportunities or collaboration.',
       path: '/contact',
     })
   }

export default async function ContactPage() {
      const [contactLinks, cv] = await Promise.all([getContactLinks(), getCurrentCv()])

  return (
    <section aria-labelledby="contact-title">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          id="contact-title"
          eyebrow="Contact"
          title="Let's talk"
          description="Have a project, a job opportunity, or a question? Send me a message or reach me through any of the channels below."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <ul className="space-y-4 lg:col-span-2">
            {contactLinks.map((link) => {
              // Email opens the mail app; other links open in a new tab
              const isExternal = !link.href.startsWith('mailto:')
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                      {link.label}
                    </p>
                    <p className="mt-1 break-all font-display text-base font-semibold text-fg">
                      {link.value}
                    </p>
                  </a>
                </li>
              )
            })}
            {(cv.published || process.env.NODE_ENV === 'development') && (
              <li>
                 <DownloadCvButton cv={cv} variant="secondary" className="w-full" />
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}