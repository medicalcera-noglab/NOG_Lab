import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { FadeUp } from '@/components/FadeUp'
import { PageBanner } from '@/components/ui/PageBanner'
import { EmptyState } from '@/components/placeholders'
import { RichText } from '@/components/RichText'
import { getOutreachPage, getOutreachActivities } from '@/lib/data/outreach'
import { OutreachCard } from '@/components/outreach/OutreachCard'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'outreach')
  return buildMetadata(
    {
      title: seo.title ?? 'Outreach',
      description:
        seo.description ?? 'Community outreach and engagement activities of the NOG Lab.',
      canonical: '/outreach',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

export default async function OutreachPage() {
  const [outreachPage, activities] = await Promise.all([getOutreachPage(), getOutreachActivities()])

  const sectionTitle = outreachPage?.sectionTitle ?? 'Community Outreach and Engagement Activities'

  return (
    <>
      <PageBanner
        eyebrow="Community engagement"
        title="Outreach"
        description="Highlights from our community partnerships, public education, and capacity-building initiatives."
        tint="#E2725B"
      />

      {outreachPage?.introText && (
        <Section className="bg-bg py-12 md:py-20">
          <Container>
            <FadeUp>
              <div className="text-muted mx-auto max-w-3xl text-center text-lg leading-relaxed">
                <RichText data={outreachPage.introText} />
              </div>
            </FadeUp>
          </Container>
        </Section>
      )}

      <Section className="bg-bg py-12 md:py-20">
        <Container>
          <div className="mb-12">
            <FadeUp>
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Activities
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                {sectionTitle}
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                Highlights from our community partnerships, public education, and capacity-building
                initiatives.
              </p>
            </FadeUp>
          </div>

          {!activities || activities.length === 0 ? (
            <EmptyState
              variant={2}
              heading="Activities coming soon"
              body="Our community outreach and engagement activities will be showcased here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {activities.map((activity, i) => (
                <OutreachCard key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
