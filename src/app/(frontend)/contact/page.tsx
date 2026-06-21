import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { MapPin, Mail } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ContactForm } from '@/components/forms/ContactForm'
import { ContactMap } from '@/components/contact/ContactMap'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getPageSeo, resolvePageSeo } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'contact')
  return buildMetadata(
    {
      title: seo.title ?? 'Contact',
      description: seo.description ?? `Get in touch with ${settings.labName}.`,
      canonical: '/contact',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <>
      <Section className="pt-20 pb-12">
        <Container>
          <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
          <p className="text-muted max-w-xl text-lg">
            We&apos;d love to hear from you. Fill out the form or reach us directly.
          </p>
        </Container>
      </Section>

      <Section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Info column */}
            <div className="space-y-6">
              {settings?.contactAddress && (
                <div className="flex gap-3">
                  <MapPin size={20} className="text-accent mt-1 shrink-0" aria-hidden />
                  <address className="text-sm leading-relaxed whitespace-pre-line not-italic">
                    {settings.contactAddress}
                  </address>
                </div>
              )}
              {settings?.contactEmail && (
                <div className="flex gap-3">
                  <Mail size={20} className="text-accent mt-1 shrink-0" aria-hidden />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-accent text-sm hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}

              {/* Interactive Leaflet map — always shown */}
              <ContactMap />
            </div>

            {/* Form column */}
            <div>
              <h2 className="mb-6 text-xl font-semibold">Send a Message</h2>
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
