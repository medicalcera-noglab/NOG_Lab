import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/data'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { NewsCard } from '@/components/news/NewsCard'
import { getNewsList } from '@/lib/data/news'
import type { NewsCategory } from '@/lib/data/news'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'News & Events',
      description: 'Awards, grants, talks, conferences, and press from the NOG Lab.',
      canonical: '/news',
    },
    settings,
  )
}

export const revalidate = 120

const CATEGORIES: { label: string; value: NewsCategory | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Awards', value: 'award' },
  { label: 'Grants', value: 'grant' },
  { label: 'Talks', value: 'talk' },
  { label: 'Conferences', value: 'conference' },
  { label: 'Press', value: 'press' },
]

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const raw = typeof params.category === 'string' ? params.category : ''
  const category = (CATEGORIES.find((c) => c.value === raw)?.value ?? '') as NewsCategory | ''

  const items = await getNewsList(category || undefined)

  return (
    <>
      <Section className="pt-20 pb-8">
        <Container>
          <h1 className="mb-6 text-4xl font-bold">News &amp; Events</h1>

          {/* Category filter */}
          <nav aria-label="Filter by category">
            <ul className="flex flex-wrap gap-2" role="list">
              {CATEGORIES.map((c) => {
                const active = c.value === category
                return (
                  <li key={c.value}>
                    <Link
                      href={c.value ? `/news?category=${c.value}` : '/news'}
                      className={[
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none',
                        active
                          ? 'bg-accent text-white'
                          : 'bg-surface border-border hover:border-accent border',
                      ].join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      {c.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </Container>
      </Section>

      <Section className="pb-20">
        <Container>
          {items.length === 0 ? (
            <p className="text-muted">No items found.</p>
          ) : (
            <ul className="space-y-4" role="list">
              {items.map((item) => (
                <li key={item.id}>
                  <NewsCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  )
}
