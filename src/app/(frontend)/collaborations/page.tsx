import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { FadeUp } from '@/components/FadeUp'
import { PageBanner } from '@/components/ui/PageBanner'
import { CollaboratorsGrid } from '@/components/collaborations/CollaboratorsGrid'
import { getAllCollaborators } from '@/lib/data/collaborators'
import { EmptyState } from '@/components/placeholders'

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

  return (
    <>
      <PageBanner
        eyebrow="Global network"
        title="Collaborations"
        description="Our research programme is strengthened through collaborations with leading national and international researchers and institutions."
        tint="#E8C9A0"
      />

      <Section className="bg-bg py-12 md:py-20">
        <Container>
          <FadeUp>
            <div className="mb-12">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Our partners
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                Partner Institutions
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                {collaborators.length} institutions across{' '}
                {new Set(collaborators.map((c) => c.country).filter(Boolean)).size} countries —
                driving interdisciplinary microbiome research at a global scale.
              </p>
            </div>
          </FadeUp>

          {collaborators.length === 0 ? (
            <EmptyState
              variant={3}
              heading="Collaborators coming soon"
              body="Our global network of research partners and institutions will be listed here."
            />
          ) : (
            <CollaboratorsGrid collaborators={collaborators} />
          )}
        </Container>
      </Section>
    </>
  )
}
