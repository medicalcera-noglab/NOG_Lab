import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
import { getImpactStories, getMediaCoverage, getImpactKPIs } from '@/lib/data/impact'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { FadeUp } from '@/components/FadeUp'
import { PageBanner } from '@/components/ui/PageBanner'
import { MediaImage } from '@/components/MediaImage'
import { EmptyState } from '@/components/placeholders'
import type { Media, MediaCoverage } from '../../../../payload-types'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'impact')
  return buildMetadata(
    {
      title: seo.title ?? 'Impact',
      description:
        seo.description ?? 'The real-world impact of our neglected and orphan disease research.',
      canonical: '/impact',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export default async function ImpactPage() {
  const [stories, coverage, kpis] = await Promise.all([
    getImpactStories(),
    getMediaCoverage(),
    getImpactKPIs(),
  ])

  return (
    <>
      <PageBanner
        eyebrow="Research impact"
        title="Impact"
        description="Translating neglected disease research into real-world change — through publications, partnerships, and policy."
        tint="#0E6E6E"
      />

      {/* ── KPI strip ── */}
      <Section className="bg-surface border-border border-b py-10">
        <Container>
          <FadeUp>
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: 'Publications', value: kpis.publications },
                { label: 'Total Citations', value: kpis.totalCitations },
                { label: 'Active Students', value: kpis.activeStudents },
                { label: 'Ongoing Projects', value: kpis.grants },
              ].map((kpi) => (
                <div key={kpi.label} className="text-center">
                  <dt className="text-muted mb-1 text-xs font-semibold tracking-[0.12em] uppercase">
                    {kpi.label}
                  </dt>
                  <dd
                    className="font-heading text-fg text-4xl font-bold"
                    style={{ color: 'var(--color-teal)' }}
                  >
                    {kpi.value.toLocaleString()}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeUp>
        </Container>
      </Section>

      {/* ── Impact Stories ── */}
      <Section className="bg-bg py-14 md:py-20">
        <Container>
          <FadeUp>
            <div className="mb-10">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Stories
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                Impact Stories
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                Case studies and narratives showing how our research addresses health challenges in
                underserved communities.
              </p>
            </div>
          </FadeUp>

          {stories.length === 0 ? (
            <EmptyState
              variant={1}
              heading="Stories coming soon"
              body="We will share detailed impact narratives as our research reaches communities."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {stories.map((story, i) => {
                const cover =
                  story.cover && typeof story.cover === 'object' ? (story.cover as Media) : null
                const href = `/impact/${story.slug ?? story.id}`
                const date = story.publishedAt
                  ? new Date(story.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : null

                return (
                  <li key={story.id}>
                    <FadeUp delay={i * 0.05}>
                      <article className="border-border bg-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
                        <Link href={href} tabIndex={-1} aria-hidden>
                          <div className="relative aspect-video overflow-hidden">
                            <MediaImage
                              doc={cover}
                              seed={story.id}
                              fill
                              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                              priority={i < 3}
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        </Link>

                        <div className="flex flex-1 flex-col gap-3 p-5">
                          {date && (
                            <time
                              dateTime={story.publishedAt!}
                              className="text-muted text-xs font-medium"
                            >
                              {date}
                            </time>
                          )}
                          <h3 className="font-heading text-fg text-lg leading-snug font-bold">
                            <Link
                              href={href}
                              className="hover:text-accent transition-colors focus-visible:underline focus-visible:outline-none"
                            >
                              {story.title}
                            </Link>
                          </h3>
                          <div className="mt-auto pt-2">
                            <Link
                              href={href}
                              className="text-accent text-sm font-semibold hover:underline focus-visible:underline focus-visible:outline-none"
                            >
                              Read story →
                            </Link>
                          </div>
                        </div>
                      </article>
                    </FadeUp>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </Section>

      {/* ── Media Coverage ── */}
      {coverage.length > 0 && (
        <Section className="bg-surface py-14 md:py-20">
          <Container>
            <FadeUp>
              <div className="mb-10">
                <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                  Press
                </p>
                <h2 className="font-heading text-fg text-3xl font-bold">In the News</h2>
                <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                  Our work as covered by media outlets.
                </p>
              </div>
            </FadeUp>

            <ul role="list" className="flex flex-col gap-4">
              {coverage.map((item: MediaCoverage, i) => {
                const logo =
                  item.logo && typeof item.logo === 'object' ? (item.logo as Media) : null
                const date = new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                return (
                  <li key={item.id}>
                    <FadeUp delay={i * 0.04}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-border bg-bg group flex items-center gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                      >
                        {/* Outlet logo or fallback badge */}
                        <div className="bg-surface-raised border-border flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                          {logo ? (
                            <MediaImage
                              doc={logo}
                              sizes="48px"
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <span
                              className="text-muted text-xs font-bold uppercase"
                              aria-hidden="true"
                            >
                              {item.outlet.slice(0, 3)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-muted mb-0.5 text-xs font-semibold uppercase">
                            {item.outlet}
                          </p>
                          <p className="text-fg truncate text-sm font-medium group-hover:underline">
                            {item.title}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <time dateTime={item.date} className="text-muted hidden text-xs sm:block">
                            {date}
                          </time>
                          <ExternalLink
                            size={14}
                            className="text-muted"
                            aria-label="Opens in new tab"
                          />
                        </div>
                      </a>
                    </FadeUp>
                  </li>
                )
              })}
            </ul>
          </Container>
        </Section>
      )}
    </>
  )
}
