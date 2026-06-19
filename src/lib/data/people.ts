import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Person, Publication, Project } from '../../../payload-types'

export type { Person }

/** All people who appear on the public site (active + alumni). */
export const getAllPeople = unstable_cache(
  async (): Promise<Person[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'people',
      where: { is_active: { equals: true } },
      sort: 'displayOrder',
      depth: 1,
      limit: 0,
      overrideAccess: true,
    })
    return docs as Person[]
  },
  ['all-people'],
  { revalidate: 60, tags: ['people'] },
)

/** Single person by slug — returns null if not found or not public. */
export const getPersonBySlug = unstable_cache(
  async (slug: string): Promise<Person | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'people',
      where: {
        and: [{ slug: { equals: slug } }, { is_active: { equals: true } }],
      },
      depth: 2,
      limit: 1,
      overrideAccess: true,
    })
    return (docs[0] as Person) ?? null
  },
  ['person-by-slug'],
  { revalidate: 60, tags: ['people'] },
)

/** Publications where the person appears in authorLinks. */
export const getPersonPublications = unstable_cache(
  async (personId: number): Promise<Publication[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'publications',
      where: { authorLinks: { in: [personId] } },
      sort: '-year',
      depth: 1,
      limit: 0,
      overrideAccess: true,
    })
    return docs as Publication[]
  },
  ['person-publications'],
  { revalidate: 60, tags: ['publications', 'people'] },
)

/** Projects where the person appears in the team relationship. */
export const getPersonProjects = unstable_cache(
  async (personId: number): Promise<Project[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'projects',
      where: { team: { in: [personId] } },
      sort: '-updatedAt',
      depth: 1,
      limit: 0,
      overrideAccess: true,
    })
    return docs as Project[]
  },
  ['person-projects'],
  { revalidate: 60, tags: ['projects', 'people'] },
)

/** All slugs for static param generation. */
export const getAllPeopleSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'people',
      where: { is_active: { equals: true } },
      select: { slug: true },
      limit: 0,
      overrideAccess: true,
    })
    return docs.map((p) => p.slug).filter((s): s is string => Boolean(s))
  },
  ['people-slugs'],
  { revalidate: 300, tags: ['people'] },
)

/** Derive whether a person is an alumnus. */
export function isAlumni(person: Person): boolean {
  return Boolean(person.leftDate) || person.role === 'alumni'
}
