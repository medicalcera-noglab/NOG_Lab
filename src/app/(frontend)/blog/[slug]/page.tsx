import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/MediaImage'
import { SocialShare } from '@/components/blog/SocialShare'
import { BlogCard } from '@/components/blog/BlogCard'
import { getBlogBySlug, getRelatedPosts, getAllBlogSlugs } from '@/lib/data/blog'
import { getSiteSettings } from '@/lib/data'
import type { Media, Person } from '../../../../../payload-types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [post, settings] = await Promise.all([getBlogBySlug(slug), getSiteSettings()])
  if (!post) return {}
  const cover =
    post.coverImage && typeof post.coverImage === 'object' ? (post.coverImage as Media) : null
  return buildMetadata(
    {
      title: post.seoMeta?.title ?? post.title ?? undefined,
      description: post.seoMeta?.description ?? undefined,
      canonical: `/blog/${slug}`,
      ogImage: cover?.url ?? null,
    },
    settings,
  )
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogBySlug(slug)
  if (!post) notFound()

  const cover =
    post.coverImage && typeof post.coverImage === 'object' ? (post.coverImage as Media) : null
  const author = typeof post.author === 'object' ? (post.author as Person) : null
  const tags = post.tags?.map((t) => t.tag) ?? []

  const related = await getRelatedPosts(post.id, tags)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.org'
  const postUrl = `${siteUrl}/blog/${post.slug ?? post.id}`

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoMeta?.description ?? undefined,
    url: postUrl,
    ...(cover?.url ? { image: cover.url } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(author ? { author: { '@type': 'Person', name: (author as Person).name } } : {}),
    publisher: { '@type': 'Organization', name: siteUrl },
    keywords: tags.filter(Boolean).join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Section className="pt-16 pb-6">
        <Container className="max-w-3xl">
          <Link
            href="/blog"
            className="text-muted hover:text-fg mb-8 inline-flex items-center gap-1.5 text-sm transition-colors focus-visible:underline focus-visible:outline-none"
          >
            <ArrowLeft size={14} />
            Blog
          </Link>

          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <a
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className="bg-accent/10 text-accent hover:bg-accent/20 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
              >
                {t}
              </a>
            ))}
          </div>

          <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>

          <div className="text-muted mb-8 flex flex-wrap items-center gap-3 text-sm">
            {author && (
              <span>
                By <span className="text-fg font-medium">{(author as Person).name}</span>
              </span>
            )}
            {post.publishedAt && (
              <>
                {author && <span aria-hidden>·</span>}
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </>
            )}
            {post.readingTimeMinutes && (
              <>
                <span aria-hidden>·</span>
                <span>{post.readingTimeMinutes} min read</span>
              </>
            )}
          </div>

          {cover && (
            <div className="mb-8 aspect-video overflow-hidden rounded-xl">
              <MediaImage
                doc={cover}
                sizes="(max-width:768px) 100vw, 768px"
                priority
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </Container>
      </Section>

      <Section className="pb-12">
        <Container className="max-w-3xl">
          <RichText data={post.body} />
          <div className="border-border mt-10 border-t pt-8">
            <SocialShare title={post.title} url={postUrl} />
          </div>
        </Container>
      </Section>

      {/* Author Card */}
      {author && (
        <Section className="bg-surface py-10">
          <Container className="max-w-3xl">
            <div className="border-border flex items-start gap-4 rounded-xl border p-6">
              {(author as Person).photo && typeof (author as Person).photo === 'object' && (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <MediaImage
                    doc={(author as Person).photo as Media}
                    sizes="64px"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold">{(author as Person).name}</p>
                <p className="text-muted text-sm capitalize">{(author as Person).role}</p>
                <Link
                  href={`/people/${(author as Person).slug ?? (author as Person).id}`}
                  className="text-accent mt-1 inline-block text-sm hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  View profile →
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* Related Posts */}
      {related.length > 0 && (
        <Section className="py-12">
          <Container className="max-w-5xl">
            <h2 className="mb-6 text-xl font-bold">Related Posts</h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {related.map((p) => (
                <li key={p.id}>
                  <BlogCard post={p} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  )
}
