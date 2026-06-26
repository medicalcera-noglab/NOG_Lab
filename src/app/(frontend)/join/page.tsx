import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { RichText } from '@/components/RichText'
import { JoinForm } from '@/components/forms/JoinForm'
import { getAbout } from '@/lib/data/about'
import { getOpenPositions } from '@/lib/data/positions'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getPageSeo, resolvePageSeo } from '@/lib/data'
import { PageBanner } from '@/components/ui/PageBanner'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'join')
  return buildMetadata(
    {
      title: seo.title ?? 'Join the Lab',
      description: seo.description ?? `Open positions and how to apply to ${settings.labName}.`,
      canonical: '/join',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

export default async function JoinPage() {
  const [positions, about, settings] = await Promise.all([
    getOpenPositions(),
    getAbout(),
    getSiteSettings(),
  ])

  const testimonials = about?.testimonials ?? []
  const noPositionsMessage = settings?.noOpenPositionsMessage

  return (
    <>
      <PageBanner
        eyebrow="Work with us"
        title="Join the Lab"
        description="We welcome motivated researchers and students. See below for current openings."
        tint="#E2725B"
      />

      {/* Open Positions */}
      <Section className="bg-surface py-12">
        <Container>
          <h2 className="mb-8 text-2xl font-bold">Open Positions</h2>
          {positions.length === 0 ? (
            <p className="text-muted">{noPositionsMessage ?? 'No open positions at this time.'}</p>
          ) : (
            <ul className="space-y-4" role="list">
              {positions.map((p) => (
                <li key={p.id} className="border-border bg-bg rounded-xl border p-6">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <span className="bg-accent/10 text-accent rounded-full px-2.5 py-1 text-xs font-medium">
                      {p.type}
                    </span>
                  </div>
                  <RichText data={p.description} className="max-w-2xl" />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section className="py-12">
          <Container>
            <h2 className="mb-8 text-2xl font-bold">What Our Team Says</h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2" role="list">
              {testimonials.map((t) => (
                <li key={t.id} className="border-border bg-surface rounded-xl border p-6">
                  <blockquote className="mb-4 text-base leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer className="text-sm font-semibold">
                    {t.name}
                    {t.role && <span className="text-muted font-normal">, {t.role}</span>}
                  </footer>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* Application Form */}
      <Section className="bg-surface py-12">
        <Container className="max-w-2xl">
          <h2 className="mb-6 text-2xl font-bold">Apply Now</h2>
          <JoinForm positions={positions} recaptchaSiteKey={settings.recaptchaSiteKey} />
        </Container>
      </Section>
    </>
  )
}
