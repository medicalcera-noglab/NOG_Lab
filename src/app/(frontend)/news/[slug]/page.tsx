import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/MediaImage'
import { getNewsBySlug, getAllNewsSlugs } from '@/lib/data/news'
import { getSiteSettings } from '@/lib/data'
import type { Media } from '../../../../../payload-types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [item, settings] = await Promise.all([getNewsBySlug(slug), getSiteSettings()])
  if (!item) return {}
  const cover =
    item.coverImage && typeof item.coverImage === 'object' ? (item.coverImage as Media) : null
  return buildMetadata(
    {
      title: item.title,
      description: `${item.category} — ${new Date(item.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      canonical: `/news/${slug}`,
      ogImage: cover?.url ?? null,
    },
    settings,
  )
}

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs()
  return slugs.map((slug) => ({ slug }))
}

const categoryLabels: Record<string, string> = {
  award: 'Award',
  grant: 'Grant',
  talk: 'Talk',
  conference: 'Conference',
  press: 'Press',
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.org'

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getNewsBySlug(slug)
  if (!item) notFound()

  const cover =
    item.coverImage && typeof item.coverImage === 'object' ? (item.coverImage as Media) : null
  const date = new Date(item.date)

  const isEvent = item.category === 'talk' || item.category === 'conference'
  const newsJsonLd = isEvent
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: item.title,
        startDate: item.date,
        ...(item.venue ? { location: { '@type': 'Place', name: item.venue } } : {}),
        ...(cover?.url ? { image: cover.url } : {}),
        url: `${SITE_URL}/news/${item.slug ?? item.id}`,
        ...(item.registerUrl ? { offers: { '@type': 'Offer', url: item.registerUrl } } : {}),
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: item.title,
        datePublished: item.date,
        ...(item.updatedAt ? { dateModified: item.updatedAt } : {}),
        ...(cover?.url ? { image: cover.url } : {}),
        url: `${SITE_URL}/news/${item.slug ?? item.id}`,
      }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }}
      />
      <Section className="pt-16 pb-20">
        <Container className="max-w-3xl">
          <Link
            href="/news"
            className="text-muted hover:text-fg mb-8 inline-flex items-center gap-1.5 text-sm transition-colors focus-visible:underline focus-visible:outline-none"
          >
            <ArrowLeft size={14} />
            News &amp; Events
          </Link>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-accent text-sm font-semibold">
              {categoryLabels[item.category] ?? item.category}
            </span>
            <span className="text-muted text-sm">
              <time dateTime={item.date}>
                {date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </span>
            {item.venue && <span className="text-muted text-sm">· {item.venue}</span>}
          </div>

          <h1 className="mb-6 text-3xl font-bold">{item.title}</h1>

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

          <RichText data={item.body} />

          {item.registerUrl && (
            <div className="mt-8">
              <a
                href={item.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
              >
                Register Now
                <ExternalLink size={16} />
              </a>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
