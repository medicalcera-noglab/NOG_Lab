import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo, getAbout } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { MediaImage } from '@/components/MediaImage'
import { FadeUp } from '@/components/FadeUp'
import { RichText } from '@/components/RichText'
import { PageBanner } from '@/components/ui/PageBanner'
import { getAllCollaborators } from '@/lib/data/collaborators'
import { EmptyState } from '@/components/placeholders'
import type { Media } from '../../../../payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'collaborations')
  return buildMetadata(
    {
      title: seo.title ?? 'Collaborations',
      description:
        seo.description ??
        'Our global network of research partners, institutions, and collaborators.',
      canonical: '/collaborations',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

export default async function CollaborationsPage() {
  const [collaborators, about] = await Promise.all([getAllCollaborators(), getAbout()])

  const withLogo = collaborators.filter((c) => c.logo && typeof c.logo === 'object')

  return (
    <>
      <PageBanner
        eyebrow="Global network"
        title="Collaborations"
        description={
          about?.kmuAffiliation ? (
            <RichText data={about.kmuAffiliation} />
          ) : (
            'We work with institutions, funders, and researchers across the globe.'
          )
        }
        tint="#E8C9A0"
      />

      {/* Logo Wall */}
      {withLogo.length > 0 && (
        <Section className="bg-surface py-12">
          <Container>
            <FadeUp>
              <h2 className="text-muted mb-8 text-sm text-xl font-semibold tracking-wider uppercase">
                Our Partners
              </h2>
            </FadeUp>
            <ul className="flex flex-wrap items-center justify-center gap-6" role="list">
              {withLogo.map((c, i) => {
                const logo = c.logo as Media
                const card = (
                  <div className="flex h-10 w-24 items-center justify-center opacity-70 transition-opacity hover:opacity-100 sm:h-12 sm:w-28 md:h-16 md:w-32">
                    <MediaImage
                      doc={logo}
                      sizes="128px"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )
                return (
                  <li key={c.id}>
                    <FadeUp delay={Math.min(i * 0.05, 0.25)}>
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={c.name}
                          className="rounded focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                        >
                          {card}
                        </a>
                      ) : (
                        card
                      )}
                    </FadeUp>
                  </li>
                )
              })}
            </ul>
          </Container>
        </Section>
      )}

      {/* Cards */}
      <div className="py-10 md:py-14">
        <Container>
          <FadeUp>
            <h2 className="mb-8 text-2xl font-bold">All Collaborators</h2>
          </FadeUp>
          {collaborators.length === 0 ? (
            <EmptyState
              variant={3}
              heading="Collaborators coming soon"
              body="Our global network of research partners and institutions will be listed here."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {collaborators.map((c, i) => {
                const logo = c.logo && typeof c.logo === 'object' ? (c.logo as Media) : null
                return (
                  <li key={c.id}>
                    <FadeUp delay={Math.min(i * 0.05, 0.25)}>
                      <div className="border-border bg-surface flex items-start gap-4 rounded-xl border p-5">
                        {logo && (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                            <MediaImage
                              doc={logo}
                              sizes="56px"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="leading-snug font-semibold">{c.name}</h3>
                          {c.country && <p className="text-muted text-sm">{c.country}</p>}
                          {c.type && (
                            <p className="text-accent mt-1 text-xs capitalize">{c.type}</p>
                          )}
                          {c.website && (
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent mt-2 inline-block rounded text-sm hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                            >
                              Visit →
                            </a>
                          )}
                        </div>
                      </div>
                    </FadeUp>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </div>
    </>
  )
}
