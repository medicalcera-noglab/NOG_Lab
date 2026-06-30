import { unstable_cache, unstable_noStore as noStore } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  Project,
  NewsEvent,
  Collaborator,
  Publication,
  StudySite,
} from '../../../payload-types'

export interface HomeCounts {
  publications: number
  projects: number
  teamMembers: number
  collaborators: number
}

// noStore() — always fetches fresh counts so Vercel's Data Cache never serves
// a stale zero value from before the database was seeded.
export async function getCounts(): Promise<HomeCounts> {
  noStore()
  const payload = await getPayload({ config })
  const [publications, projects, teamMembers, collaborators] = await Promise.all([
    payload.count({ collection: 'publications', overrideAccess: true }),
    payload.count({ collection: 'projects', overrideAccess: true }),
    payload.count({ collection: 'people', overrideAccess: true }),
    payload.count({ collection: 'collaborators', overrideAccess: true }),
  ])
  return {
    publications: publications.totalDocs,
    projects: projects.totalDocs,
    teamMembers: teamMembers.totalDocs,
    collaborators: collaborators.totalDocs,
  }
}

export const getFeaturedProject = unstable_cache(
  async (): Promise<Project | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'projects',
      where: { isFeaturedHome: { equals: true } },
      limit: 1,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs[0] ?? null
  },
  ['featured-project'],
  { revalidate: 60, tags: ['projects'] },
)

export const getLatestNews = unstable_cache(
  async (): Promise<NewsEvent[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'news_events',
      where: { status: { equals: 'published' } },
      sort: '-date',
      limit: 3,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  },
  ['latest-news'],
  { revalidate: 60, tags: ['news_events'] },
)

export const getCollaborators = unstable_cache(
  async (): Promise<Collaborator[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'collaborators',
      sort: 'displayOrder',
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  },
  ['collaborators-list'],
  { revalidate: 300, tags: ['collaborators'] },
)

export const getAllStudySites = unstable_cache(
  async (): Promise<StudySite[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'study_sites',
      sort: 'name',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs
  },
  ['all-study-sites'],
  { revalidate: 300, tags: ['study_sites'] },
)

export const getHomeProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'projects',
      sort: '-createdAt',
      limit: 3,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs as Project[]
  },
  ['home-projects'],
  { revalidate: 60, tags: ['projects'] },
)

export const getLatestPublications = unstable_cache(
  async (): Promise<Publication[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'publications',
      sort: '-year',
      limit: 5,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs as Publication[]
  },
  ['home-latest-publications'],
  { revalidate: 300, tags: ['publications'] },
)
