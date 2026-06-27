import type { Metadata } from 'next'
import Link from 'next/link'
import { getSearchProvider, type SearchResult, type GroupedResults } from '@/lib/search'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PageBanner } from '@/components/ui/PageBanner'
import { buttonVariants } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = '' } = await searchParams
  return {
    title: q ? `Search: "${q}"` : 'Search',
    robots: { index: false },
  }
}

function SnippetText({ html }: { html: string }) {
  // ts_headline highlights from our own DB — safe to render.
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function ResultCard({ result }: { result: SearchResult }) {
  const isExternal = result.url.startsWith('http')
  return (
    <article>
      <Link
        href={result.url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={
          'group border-border bg-surface block rounded-xl border p-4 transition-shadow ' +
          'focus-visible:ring-ring hover:shadow-md focus-visible:ring-2 focus-visible:outline-none'
        }
      >
        <h3 className="text-fg group-hover:text-accent font-semibold transition-colors">
          {result.title}
        </h3>
        {result.snippet && result.snippet !== result.title && (
          <p
            className={
              'text-muted mt-1 line-clamp-2 text-sm ' +
              '[&_mark]:rounded-sm [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:text-yellow-900'
            }
          >
            <SnippetText html={result.snippet} />
          </p>
        )}
      </Link>
    </article>
  )
}

function SearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="GET" action="/search" role="search" className="mb-10">
      <div className="flex gap-2">
        <label htmlFor="search-input" className="sr-only">
          Search
        </label>
        <input
          id="search-input"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search…"
          autoFocus
          className={
            'border-border bg-surface text-fg flex-1 rounded-xl border px-4 py-3 ' +
            'placeholder:text-muted focus:ring-ring focus:ring-2 focus:outline-none'
          }
        />
        <button type="submit" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
          Search
        </button>
      </div>
    </form>
  )
}

const GROUP_CONFIG: Array<{ key: keyof Omit<GroupedResults, 'total'>; label: string }> = [
  { key: 'publications', label: 'Publications' },
  { key: 'people', label: 'People' },
  { key: 'projects', label: 'Projects' },
  { key: 'blog', label: 'Blog' },
  { key: 'news', label: 'News' },
]

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const query = q.trim()

  let grouped: GroupedResults | null = null
  if (query.length >= 2) {
    const provider = getSearchProvider()
    grouped = await provider.search(query, { limitPerGroup: 10 })
  }

  const hasAny = grouped && grouped.total > 0

  return (
    <>
      <PageBanner eyebrow="Find anything" title="Search" tint="#0E6E6E" />
      <Section>
        <Container className="max-w-3xl">
          <h2 className="font-heading text-fg mb-2 text-xl font-bold">
            {query ? `Results for "${query}"` : 'Start typing to search…'}
          </h2>
          {hasAny && (
            <p className="text-muted mb-8 text-sm">
              {grouped!.total} result{grouped!.total === 1 ? '' : 's'} found
            </p>
          )}

          <SearchForm defaultValue={query} />

          {!query && <p className="text-muted py-8 text-center">Type something to search…</p>}

          {query && grouped && !hasAny && (
            <div className="py-8 text-center">
              <p className="text-fg font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-muted mt-1 text-sm">Try different keywords.</p>
            </div>
          )}

          {hasAny && (
            <div className="space-y-12">
              {GROUP_CONFIG.map(({ key, label }) => {
                const items = grouped![key]
                if (items.length === 0) return null
                return (
                  <section key={key} aria-labelledby={`section-${key}`}>
                    <h2
                      id={`section-${key}`}
                      className="font-heading text-fg border-border mb-4 border-b pb-2 text-xl font-bold"
                    >
                      {label}
                      <span className="text-muted ms-2 text-sm font-normal">({items.length})</span>
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((result) => (
                        <ResultCard key={`${result.type}-${result.id}`} result={result} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
