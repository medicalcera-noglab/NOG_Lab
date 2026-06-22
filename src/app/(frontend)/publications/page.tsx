import { Suspense } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { PublicationListItem } from '@/components/publications/PublicationListItem'
import { PublicationFilters } from '@/components/publications/PublicationFilters'
import { FilterSheet } from '@/components/ui/FilterSheet'
import { getFilteredPublications, getPublicationFilterOptions } from '@/lib/data/publications'
import type { PublicationFilters as Filters } from '@/lib/data/publications'
import { EmptyState } from '@/components/placeholders'
import { FadeUp } from '@/components/FadeUp'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'publications')
  return buildMetadata(
    {
      title: seo.title ?? 'Publications',
      description:
        seo.description ?? 'Peer-reviewed articles, preprints, and book chapters from the NOG Lab.',
      canonical: '/publications',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

// Short ISR window — citation counts update nightly via cron.
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Pull a scalar string from Next.js searchParams (ignores array values). */
function sp(val: string | string[] | undefined): string | undefined {
  return typeof val === 'string' ? val : undefined
}

/** Build export URL preserving current filter params. */
function exportHref(format: 'bibtex' | 'ris', filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.year) params.set('year', filters.year)
  if (filters.type) params.set('type', filters.type)
  if (filters.themeSlug) params.set('theme', filters.themeSlug)
  if (filters.authorId) params.set('author', filters.authorId)
  const qs = params.toString()
  return `/publications/export/${format}${qs ? `?${qs}` : ''}`
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.org'

export default async function PublicationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters: Filters = {
    year: sp(params.year),
    type: sp(params.type),
    themeSlug: sp(params.theme),
    authorId: sp(params.author),
  }
  const hasFilters = Object.values(filters).some(Boolean)
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const [publications, filterOptions] = await Promise.all([
    getFilteredPublications(filters),
    getPublicationFilterOptions(),
  ])

  const pubsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Publications',
    url: `${SITE_URL}/publications`,
    numberOfItems: publications.length,
    itemListElement: publications.map((pub, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'ScholarlyArticle',
        name: pub.title,
        ...(pub.journal ? { isPartOf: { '@type': 'Periodical', name: pub.journal } } : {}),
        ...(pub.year ? { datePublished: String(pub.year) } : {}),
        ...(pub.doi ? { identifier: `https://doi.org/${pub.doi}` } : {}),
        ...(pub.doi ? { url: `https://doi.org/${pub.doi}` } : {}),
        author: (pub.authors ?? [])
          .map((a) =>
            typeof a === 'object' && a !== null
              ? { '@type': 'Person', name: (a as { name?: string }).name }
              : null,
          )
          .filter(Boolean),
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pubsJsonLd) }}
      />
      <main id="main-content">
        <Container className="py-8 md:py-20">
          {/* ── Page header ── */}
          <div className="mb-6 md:mb-10">
            <h1 className="font-heading text-fg text-2xl font-bold sm:text-4xl md:text-5xl">
              Publications
            </h1>
            {(publications.length > 0 || hasFilters) && (
              <p className="text-muted mt-2 max-w-2xl text-sm sm:text-base">
                {publications.length > 0
                  ? `${publications.length} publication${publications.length !== 1 ? 's' : ''}`
                  : 'No publications found'}
                {hasFilters ? ' matching the selected filters.' : '.'}
              </p>
            )}
          </div>

          {/* Mobile filter trigger — hidden on lg+ where sidebar is always visible */}
          <div className="mb-4 lg:hidden">
            <FilterSheet activeCount={activeFilterCount}>
              <PublicationFilters
                options={filterOptions}
                active={{
                  year: filters.year,
                  type: filters.type,
                  themeSlug: filters.themeSlug,
                  authorId: filters.authorId,
                }}
              />
            </FilterSheet>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
            {/* ── Sidebar filters — desktop only ── */}
            <Suspense>
              <div className="hidden lg:block">
                <PublicationFilters
                  options={filterOptions}
                  active={{
                    year: filters.year,
                    type: filters.type,
                    themeSlug: filters.themeSlug,
                    authorId: filters.authorId,
                  }}
                />
              </div>
            </Suspense>

            {/* ── Publication list ── */}
            <section aria-label="Publication list">
              {/* Export current list */}
              {publications.length > 0 && (
                <div className="border-border mb-6 flex flex-wrap items-center gap-3 border-b pb-4">
                  <span className="text-muted text-xs font-semibold">Export list:</span>
                  <a
                    href={exportHref('bibtex', filters)}
                    download="publications.bib"
                    className={cn(
                      'text-muted border-border rounded-full border px-3 py-1 text-xs font-semibold',
                      'hover:text-fg hover:border-fg/30 transition-colors duration-150',
                      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    )}
                  >
                    BibTeX
                  </a>
                  <a
                    href={exportHref('ris', filters)}
                    download="publications.ris"
                    className={cn(
                      'text-muted border-border rounded-full border px-3 py-1 text-xs font-semibold',
                      'hover:text-fg hover:border-fg/30 transition-colors duration-150',
                      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    )}
                  >
                    RIS
                  </a>
                </div>
              )}

              {publications.length === 0 ? (
                <EmptyState
                  variant={2}
                  heading={
                    !hasFilters ? 'Publications coming soon' : 'No publications match these filters'
                  }
                  body={
                    !hasFilters
                      ? 'Peer-reviewed articles and preprints will appear here once they are added.'
                      : 'Try adjusting or clearing the active filters to browse all publications.'
                  }
                  action={
                    hasFilters ? { label: 'Clear all filters', href: '/publications' } : undefined
                  }
                />
              ) : (
                <ul role="list" className="flex flex-col gap-4">
                  {publications.map((pub, i) => (
                    <li key={pub.id}>
                      <FadeUp delay={Math.min(i * 0.04, 0.2)}>
                        <PublicationListItem publication={pub} showCiteLinks />
                      </FadeUp>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </Container>
      </main>
    </>
  )
}
