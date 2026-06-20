import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { MediaImage } from '@/components/MediaImage'
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
  const collaborators = await getAllCollaborators()

  const withLogo = collaborators.filter((c) => c.logo && typeof c.logo === 'object')

  return (
    <>
      <Section className="pt-20 pb-12">
        <Container>
          <h1 className="mb-4 text-4xl font-bold">Collaborations</h1>
          <p className="text-muted max-w-2xl text-lg">
            We work with institutions, funders, and researchers across the globe.
          </p>
        </Container>
      </Section>

      {/* Logo Wall */}
      {withLogo.length > 0 && (
        <Section className="bg-surface py-12">
          <Container>
            <h2 className="text-muted mb-8 text-sm text-xl font-semibold tracking-wider uppercase">
              Our Partners
            </h2>
            <ul className="flex flex-wrap items-center justify-center gap-8" role="list">
              {withLogo.map((c) => {
                const logo = c.logo as Media
                const card = (
                  <div className="flex h-16 w-32 items-center justify-center opacity-70 transition-opacity hover:opacity-100">
                    <MediaImage
                      doc={logo}
                      sizes="128px"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )
                return (
                  <li key={c.id}>
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
                  </li>
                )
              })}
            </ul>
          </Container>
        </Section>
      )}

      {/* Cards */}
      <Section className="py-12">
        <Container>
          <h2 className="mb-8 text-2xl font-bold">All Collaborators</h2>
          {collaborators.length === 0 ? (
            <EmptyState
              variant={3}
              heading="Collaborators coming soon"
              body="Our global network of research partners and institutions will be listed here."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {collaborators.map((c) => {
                const logo = c.logo && typeof c.logo === 'object' ? (c.logo as Media) : null
                return (
                  <li
                    key={c.id}
                    className="border-border bg-surface flex items-start gap-4 rounded-xl border p-5"
                  >
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
                      {c.type && <p className="text-accent mt-1 text-xs capitalize">{c.type}</p>}
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
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </Section>
    </>
  )
}
