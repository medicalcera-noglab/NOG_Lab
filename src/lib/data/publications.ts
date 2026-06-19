import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Publication, Person, ResearchTheme } from '../../../payload-types'

export type { Publication }

export interface PublicationFilters {
  year?: string
  type?: string
  themeSlug?: string
  /** Payload numeric person ID (as string from searchParams) */
  authorId?: string
}

export interface PublicationFilterOptions {
  years: number[]
  types: Publication['type'][]
  themes: { id: number; name: string; slug: string | null }[]
  authors: { id: number; name: string; slug: string | null }[]
}

/** Distinct filter facets for the /publications page — changes slowly, cached 5 min. */
export const getPublicationFilterOptions = unstable_cache(
  async (): Promise<PublicationFilterOptions> => {
    const payload = await getPayload({ config })
    const [pubsResult, themesResult] = await Promise.all([
      payload.find({
        collection: 'publications',
        limit: 0,
        depth: 2, // resolve authorLinks → Person
        overrideAccess: true,
      }),
      payload.find({
        collection: 'research_themes',
        sort: 'displayOrder',
        limit: 0,
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const pubs = pubsResult.docs as Publication[]

    const years = [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a)
    const types = [...new Set(pubs.map((p) => p.type))] as Publication['type'][]

    const themes = (themesResult.docs as ResearchTheme[]).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug ?? null,
    }))

    // Authors = distinct people who appear in any publication's authorLinks
    const authorMap = new Map<number, { id: number; name: string; slug: string | null }>()
    for (const pub of pubs) {
      for (const link of pub.authorLinks ?? []) {
        if (typeof link === 'object') {
          const person = link as Person
          if (!authorMap.has(person.id)) {
            authorMap.set(person.id, {
              id: person.id,
              name: person.name,
              slug: (person as Person & { slug?: string | null }).slug ?? null,
            })
          }
        }
      }
    }
    const authors = [...authorMap.values()].sort((a, b) => a.name.localeCompare(b.name))

    return { years, types, themes, authors }
  },
  ['publication-filter-options'],
  { revalidate: 300, tags: ['publications', 'research_themes', 'people'] },
)

/** All publications matching the given filters, sorted year DESC. */
export const getFilteredPublications = unstable_cache(
  async (filters: PublicationFilters): Promise<Publication[]> => {
    const payload = await getPayload({ config })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []

    if (filters.year) {
      conditions.push({ year: { equals: Number(filters.year) } })
    }
    if (filters.type) {
      conditions.push({ type: { equals: filters.type } })
    }
    if (filters.themeSlug) {
      const themeResult = await payload.find({
        collection: 'research_themes',
        where: { slug: { equals: filters.themeSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (themeResult.docs[0]) {
        conditions.push({ themeTags: { equals: themeResult.docs[0].id } })
      } else {
        return []
      }
    }
    if (filters.authorId) {
      const id = Number(filters.authorId)
      if (!Number.isNaN(id)) {
        conditions.push({ authorLinks: { equals: id } })
      }
    }

    const where = conditions.length > 0 ? { and: conditions } : undefined

    const result = await payload.find({
      collection: 'publications',
      where,
      sort: '-year',
      limit: 0,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs as Publication[]
  },
  ['filtered-publications'],
  { revalidate: 60, tags: ['publications', 'research_themes'] },
)

/** Fetch specific publications by ID (for single-item export). */
export const getPublicationsByIds = unstable_cache(
  async (ids: number[]): Promise<Publication[]> => {
    if (ids.length === 0) return []
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'publications',
      where: { id: { in: ids } },
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs as Publication[]
  },
  ['publications-by-ids'],
  { revalidate: 60, tags: ['publications'] },
)

/** All publications with a DOI — used by the citation-count cron. */
export async function getAllPublicationsWithDoi(): Promise<
  Pick<Publication, 'id' | 'doi' | 'citationCount'>[]
> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'publications',
    where: { doi: { exists: true } },
    limit: 0,
    depth: 0,
    overrideAccess: true,
  })
  return (result.docs as Publication[]).map(({ id, doi, citationCount }) => ({
    id,
    doi,
    citationCount,
  }))
}
