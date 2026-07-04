import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { ImpactStory, MediaCoverage } from '../../../payload-types'

export const getImpactStoryBySlug = unstable_cache(
  async (slug: string): Promise<ImpactStory | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'impact_stories',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
      },
      limit: 1,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs[0] ?? null
  },
  ['impact-story-by-slug'],
  { revalidate: 120, tags: ['impact_stories'] },
)

export const getAllImpactStorySlugs = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'impact_stories',
      where: { status: { equals: 'published' } },
      limit: 500,
      select: { slug: true },
      overrideAccess: true,
    })
    return result.docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
  },
  ['impact-story-slugs'],
  { revalidate: 300, tags: ['impact_stories'] },
)

export const getImpactStories = unstable_cache(
  async (): Promise<ImpactStory[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'impact_stories',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 2,
      overrideAccess: true,
    })
    return result.docs
  },
  ['impact-stories'],
  { revalidate: 300, tags: ['impact_stories'] },
)

export const getMediaCoverage = unstable_cache(
  async (): Promise<MediaCoverage[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'media_coverage',
      sort: '-date',
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  },
  ['media-coverage'],
  { revalidate: 300, tags: ['media_coverage'] },
)

export interface ImpactKPIs {
  publications: number
  totalCitations: number
  activeStudents: number
  grants: number
}

export const getImpactKPIs = unstable_cache(
  async (): Promise<ImpactKPIs> => {
    const payload = await getPayload({ config })

    const [pubResult, studentResult, projectResult] = await Promise.all([
      payload.count({ collection: 'publications', overrideAccess: true }),
      payload.count({
        collection: 'people',
        where: {
          and: [{ role: { in: ['phd', 'ms'] } }, { is_active: { equals: true } }],
        },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'projects',
        where: { status: { equals: 'ongoing' } },
        overrideAccess: true,
      }),
    ])

    // Sum citations from the full collection (max 1000 for performance)
    const pubs = await payload.find({
      collection: 'publications',
      limit: 1000,
      overrideAccess: true,
      select: { citationCount: true },
    })
    const totalCitations = pubs.docs.reduce(
      (sum, p) => sum + ((p.citationCount as number | null | undefined) ?? 0),
      0,
    )

    return {
      publications: pubResult.totalDocs,
      totalCitations,
      activeStudents: studentResult.totalDocs,
      grants: projectResult.totalDocs,
    }
  },
  ['impact-kpis'],
  { revalidate: 600, tags: ['publications', 'people', 'projects'] },
)
