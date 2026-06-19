import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { NewsEvent } from '../../../payload-types'

export type NewsCategory = NewsEvent['category']

export const getNewsList = unstable_cache(
  async (category?: NewsCategory): Promise<NewsEvent[]> => {
    const payload = await getPayload({ config })
    const andClauses: Where[] = [{ status: { equals: 'published' } }]
    if (category) andClauses.push({ category: { equals: category } })
    const where: Where = andClauses.length === 1 ? andClauses[0]! : { and: andClauses }
    const result = await payload.find({
      collection: 'news_events',
      where,
      sort: '-date',
      limit: 50,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  },
  ['news-list'],
  { revalidate: 120, tags: ['news_events'] },
)

export const getNewsBySlug = unstable_cache(
  async (slug: string): Promise<NewsEvent | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'news_events',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
      },
      limit: 1,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs[0] ?? null
  },
  ['news-by-slug'],
  { revalidate: 60, tags: ['news_events'] },
)

export const getAllNewsSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'news_events',
      where: { status: { equals: 'published' } },
      limit: 500,
      select: { slug: true },
      overrideAccess: true,
    })
    return result.docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
  },
  ['all-news-slugs'],
  { revalidate: 300, tags: ['news_events'] },
)
