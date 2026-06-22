import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/MediaImage'
import { FadeUp } from '@/components/FadeUp'
import { getImpactStories, getMediaCoverage, getImpactKPIs } from '@/lib/data/impact'
import type { Media } from '../../../../payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'impact')
  return buildMetadata(
    {
      title: seo.title ?? 'Impact',
      description:
        seo.description ??
        'Research impact: publications, citations, grants, and community stories.',
      canonical: '/impact',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 600

export default async function ImpactPage() {
  const [stories, coverage, kpis] = await Promise.all([
    getImpactStories(),
    getMediaCoverage(),
    getImpactKPIs(),
  ])

  const kpiItems = [
    { label: 'Publications', value: kpis.publications },
    { label: 'Total Citations', value: kpis.totalCitations.toLocaleString() },
    { label: 'Active Students', value: kpis.activeStudents },
    { label: 'Active Projects', value: kpis.grants },
  ]

  return (
    <>
      <Section className="pt-8 pb-6 sm:pt-12">
        <Container>
          <FadeUp>
            <h1 className="mb-3 text-2xl font-bold sm:text-4xl">Our Impact</h1>
            <p className="text-muted max-w-2xl text-base sm:text-lg">
              Measuring research outcomes through publications, student training, and community
              change.
            </p>
          </FadeUp>
        </Container>
      </Section>

      {/* KPI Dashboard */}
      <Section className="bg-surface py-12">
        <Container>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6" role="list">
            {kpiItems.map((kpi, i) => (
              <li key={kpi.label}>
                <FadeUp delay={Math.min(i * 0.05, 0.2)}>
                  <div className="border-border bg-bg rounded-xl border p-4 text-center sm:p-6">
                    <p className="text-accent text-2xl font-bold sm:text-3xl md:text-4xl">
                      {kpi.value}
                    </p>
                    <p className="text-muted mt-1 text-xs sm:text-sm">{kpi.label}</p>
                  </div>
                </FadeUp>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Impact Stories */}
      {stories.length > 0 && (
        <Section className="py-12">
          <Container>
            <FadeUp>
              <h2 className="mb-8 text-2xl font-bold">Impact Stories</h2>
            </FadeUp>
            <div className="space-y-10">
              {stories.map((story, idx) => {
                const cover =
                  story.cover && typeof story.cover === 'object' ? (story.cover as Media) : null
                const isEven = idx % 2 === 0
                return (
                  <FadeUp key={story.id} delay={idx * 0.08}>
                    <article
                      className={`flex flex-col items-start gap-8 md:flex-row ${isEven ? '' : 'md:flex-row-reverse'}`}
                    >
                      {cover && (
                        <div className="aspect-video shrink-0 overflow-hidden rounded-xl md:w-2/5">
                          <MediaImage
                            doc={cover}
                            sizes="(max-width:768px) 100vw, 40vw"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="mb-3 text-xl font-bold">{story.title}</h3>
                        <RichText data={story.body} className="max-w-2xl" />
                      </div>
                    </article>
                  </FadeUp>
                )
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* Media Coverage Timeline */}
      {coverage.length > 0 && (
        <Section className="bg-surface py-12">
          <Container>
            <FadeUp>
              <h2 className="mb-8 text-2xl font-bold">Media Coverage</h2>
            </FadeUp>
            <ol
              className="border-border relative ml-3 space-y-8 border-l sm:ml-4"
              aria-label="Media coverage timeline"
            >
              {coverage.map((item) => {
                const logo =
                  item.logo && typeof item.logo === 'object' ? (item.logo as Media) : null
                const date = new Date(item.date)
                return (
                  <FadeUp key={item.id}>
                    <li className="ml-6">
                      <span
                        className="border-accent bg-bg absolute -left-2 h-4 w-4 rounded-full border-2"
                        aria-hidden
                      />
                      <time dateTime={item.date} className="text-muted mb-1 block text-xs">
                        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </time>
                      <div className="flex items-center gap-3">
                        {logo && (
                          <div className="h-10 w-10 shrink-0">
                            <MediaImage
                              doc={logo}
                              sizes="40px"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-muted text-xs font-medium">{item.outlet}</p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-accent font-semibold transition-colors focus-visible:underline focus-visible:outline-none"
                          >
                            {item.title} →
                          </a>
                        </div>
                      </div>
                    </li>
                  </FadeUp>
                )
              })}
            </ol>
          </Container>
        </Section>
      )}
    </>
  )
}
