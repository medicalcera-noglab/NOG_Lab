import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
import Link from 'next/link'
import { Newspaper, BookOpen } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { BlogCard } from '@/components/blog/BlogCard'
import { NewsCard } from '@/components/news/NewsCard'
import { FadeUp } from '@/components/FadeUp'
import { getBlogList } from '@/lib/data/blog'
import { getNewsList } from '@/lib/data/news'
import type { NewsCategory } from '@/lib/data/news'
import { EmptyState } from '@/components/placeholders'
import { PageBanner } from '@/components/ui/PageBanner'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'blog')
  return buildMetadata(
    {
      title: seo.title ?? 'Blog & News',
      description:
        seo.description ?? 'Research insights, commentary, awards, events, and press from NOG Lab.',
      canonical: '/blog',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 120

const NEWS_CATEGORIES: { label: string; value: NewsCategory | '' }[] = [
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

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Tab: "articles" (default) or "news"
  const tab = params.tab === 'news' ? 'news' : 'articles'

  // Articles tab state
  const tag = tab === 'articles' && typeof params.tag === 'string' ? params.tag : undefined

  // News tab state
  const rawCat = tab === 'news' && typeof params.category === 'string' ? params.category : ''
  const category = (NEWS_CATEGORIES.find((c) => c.value === rawCat)?.value ?? '') as
    | NewsCategory
    | ''

  // Fetch only the active tab data
  const [posts, newsItems] = await Promise.all([
    tab === 'articles' ? getBlogList(tag) : Promise.resolve([]),
    tab === 'news' ? getNewsList(category || undefined) : Promise.resolve([]),
  ])

  // Collect tags from blog posts (fetch all to show in filter even when tag-filtered)
  const allPosts = tag ? await getBlogList() : posts
  const allTagsSet = new Set<string>()
  allPosts.forEach((p) => p.tags?.forEach((t) => allTagsSet.add(t.tag)))
  const allTags = Array.from(allTagsSet).sort()

  return (
    <>
      <PageBanner eyebrow="Lab updates" title="Blog & News" tint="#0E6E6E" />

      {/* Tab switcher */}
      <Section className="bg-surface border-border border-b py-0!" id="tabs">
        <Container>
          <nav aria-label="Content type" className="-mb-px flex gap-1">
            <Link
              href="/blog"
              aria-current={tab === 'articles' ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition-colors duration-150',
                'focus-visible:ring-ring rounded-t focus-visible:ring-2 focus-visible:outline-none',
                tab === 'articles'
                  ? 'border-primary text-primary'
                  : 'text-muted hover:text-fg hover:border-border border-transparent',
              )}
            >
              <BookOpen size={16} aria-hidden="true" />
              Articles
            </Link>
            <Link
              href="/blog?tab=news"
              aria-current={tab === 'news' ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition-colors duration-150',
                'focus-visible:ring-ring rounded-t focus-visible:ring-2 focus-visible:outline-none',
                tab === 'news'
                  ? 'border-primary text-primary'
                  : 'text-muted hover:text-fg hover:border-border border-transparent',
              )}
            >
              <Newspaper size={16} aria-hidden="true" />
              News &amp; Events
            </Link>
          </nav>
        </Container>
      </Section>

      {/* ── Articles tab ── */}
      {tab === 'articles' && (
        <>
          {/* Tag filter */}
          {allTags.length > 0 && (
            <Section className="pt-6 pb-0!">
              <Container>
                <nav aria-label="Filter by tag">
                  <ul className="flex flex-wrap gap-2" role="list">
                    <li>
                      <Link
                        href="/blog"
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                          !tag
                            ? 'bg-primary text-white'
                            : 'bg-surface border-border hover:border-primary border',
                        )}
                        aria-current={!tag ? 'page' : undefined}
                      >
                        All
                      </Link>
                    </li>
                    {allTags.map((t) => (
                      <li key={t}>
                        <Link
                          href={`/blog?tag=${encodeURIComponent(t)}`}
                          className={cn(
                            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                            tag === t
                              ? 'bg-primary text-white'
                              : 'bg-surface border-border hover:border-primary border',
                          )}
                          aria-current={tag === t ? 'page' : undefined}
                        >
                          {t}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Container>
            </Section>
          )}

          <Section className="py-8 md:py-12">
            <Container>
              {posts.length === 0 ? (
                <EmptyState
                  variant={1}
                  heading={tag ? 'No posts with this tag' : 'Articles coming soon'}
                  body={
                    tag
                      ? 'No articles have been tagged with this topic yet.'
                      : 'Research insights and updates will appear here once published.'
                  }
                  action={tag ? { label: 'Browse all articles', href: '/blog' } : undefined}
                />
              ) : (
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
                  {posts.map((post, i) => (
                    <li key={post.id} className="h-full">
                      <FadeUp delay={Math.min(i * 0.05, 0.25)}>
                        <BlogCard post={post} />
                      </FadeUp>
                    </li>
                  ))}
                </ul>
              )}
            </Container>
          </Section>
        </>
      )}

      {/* ── News & Events tab ── */}
      {tab === 'news' && (
        <>
          {/* Category filter */}
          <Section className="pt-6 pb-0!">
            <Container>
              <nav aria-label="Filter by category">
                <ul className="flex flex-wrap gap-2" role="list">
                  {NEWS_CATEGORIES.map((c) => {
                    const active = c.value === category
                    const href = c.value ? `/blog?tab=news&category=${c.value}` : '/blog?tab=news'
                    return (
                      <li key={c.value}>
                        <Link
                          href={href}
                          className={cn(
                            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                            active
                              ? 'bg-primary text-white'
                              : 'bg-surface border-border hover:border-primary border',
                          )}
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

          <Section className="py-8 md:py-12">
            <Container>
              {newsItems.length === 0 ? (
                <EmptyState
                  variant={0}
                  heading={category ? 'No items in this category' : 'News & events coming soon'}
                  body={
                    category
                      ? 'Nothing has been posted in this category yet.'
                      : 'Awards, grants, talks, and press coverage will appear here once added.'
                  }
                  action={category ? { label: 'View all news', href: '/blog?tab=news' } : undefined}
                />
              ) : (
                <ul className="space-y-4" role="list">
                  {newsItems.map((item, i) => (
                    <li key={item.id}>
                      <FadeUp delay={Math.min(i * 0.04, 0.2)}>
                        <NewsCard item={item} />
                      </FadeUp>
                    </li>
                  ))}
                </ul>
              )}
            </Container>
          </Section>
        </>
      )}
    </>
  )
}
