import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/data'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { BlogCard } from '@/components/blog/BlogCard'
import { getBlogList } from '@/lib/data/blog'
import { EmptyState } from '@/components/placeholders'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'Blog',
      description: 'Insights, commentary, and research updates from the NOG Lab.',
      canonical: '/blog',
    },
    settings,
  )
}

export const revalidate = 120

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const tag = typeof params.tag === 'string' ? params.tag : undefined

  const posts = await getBlogList(tag)

  // Collect all unique tags for filter strip
  const allTagsSet = new Set<string>()
  posts.forEach((p) => p.tags?.forEach((t) => allTagsSet.add(t.tag)))
  const allTags = Array.from(allTagsSet).sort()

  return (
    <>
      <Section className="pt-20 pb-8">
        <Container>
          <h1 className="mb-6 text-4xl font-bold">Blog</h1>

          {allTags.length > 0 && (
            <nav aria-label="Filter by tag">
              <ul className="flex flex-wrap gap-2" role="list">
                <li>
                  <Link
                    href="/blog"
                    className={[
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none',
                      !tag
                        ? 'bg-accent text-white'
                        : 'bg-surface border-border hover:border-accent border',
                    ].join(' ')}
                    aria-current={!tag ? 'page' : undefined}
                  >
                    All
                  </Link>
                </li>
                {allTags.map((t) => (
                  <li key={t}>
                    <Link
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className={[
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none',
                        tag === t
                          ? 'bg-accent text-white'
                          : 'bg-surface border-border hover:border-accent border',
                      ].join(' ')}
                      aria-current={tag === t ? 'page' : undefined}
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </Section>

      <Section className="pb-20">
        <Container>
          {posts.length === 0 ? (
            <EmptyState
              variant={1}
              heading={tag ? 'No posts with this tag' : 'Blog posts coming soon'}
              body={
                tag
                  ? 'No articles have been tagged with this topic yet. Try browsing all posts.'
                  : 'Research insights and updates will appear here once published.'
              }
              action={tag ? { label: 'Browse all posts', href: '/blog' } : undefined}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {posts.map((post) => (
                <li key={post.id}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  )
}
