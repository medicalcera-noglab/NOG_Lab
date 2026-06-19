import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Project, StudySite } from '../../../payload-types'

export type { Project, StudySite }

export interface ProjectFilterOptions {
  /** distinct non-null funders, sorted alphabetically */
  funders: string[]
  /** distinct non-null provinces from study_sites, sorted alphabetically */
  provinces: string[]
}

export interface ProjectFilters {
  themeSlug?: string
  status?: string
  funder?: string
  province?: string
}

/** Distinct funders and provinces for filter UI — changes rarely. */
export const getProjectFilterOptions = unstable_cache(
  async (): Promise<ProjectFilterOptions> => {
    const payload = await getPayload({ config })
    const [projectsResult, sitesResult] = await Promise.all([
      payload.find({
        collection: 'projects',
        limit: 0,
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'study_sites',
        limit: 0,
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const funders = [
      ...new Set(
        projectsResult.docs
          .map((p) => (p as Project).funder)
          .filter((f): f is string => Boolean(f)),
      ),
    ].sort()

    const provinces = [
      ...new Set(
        sitesResult.docs
          .map((s) => (s as StudySite).province)
          .filter((p): p is string => Boolean(p)),
      ),
    ].sort()

    return { funders, provinces }
  },
  ['project-filter-options'],
  { revalidate: 300, tags: ['projects', 'study_sites'] },
)

/** Projects filtered by user-supplied criteria. All params optional (no filter = all). */
export const getFilteredProjects = unstable_cache(
  async (filters: ProjectFilters): Promise<Project[]> => {
    const payload = await getPayload({ config })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []

    // Theme filter: look up ID by slug
    if (filters.themeSlug) {
      const themeResult = await payload.find({
        collection: 'research_themes',
        where: { slug: { equals: filters.themeSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (themeResult.docs[0]) {
        conditions.push({ theme: { equals: themeResult.docs[0].id } })
      } else {
        // Unknown slug → return nothing
        return []
      }
    }

    if (filters.status) {
      conditions.push({ status: { equals: filters.status } })
    }

    if (filters.funder) {
      conditions.push({ funder: { equals: filters.funder } })
    }

    // Province filter: two-step (find sites → project IDs)
    if (filters.province) {
      const sitesResult = await payload.find({
        collection: 'study_sites',
        where: { province: { equals: filters.province } },
        limit: 0,
        depth: 0,
        overrideAccess: true,
      })
      const projectIds = sitesResult.docs.map((s) => {
        const site = s as StudySite
        return typeof site.project === 'object' ? site.project.id : site.project
      })
      if (projectIds.length === 0) return []
      conditions.push({ id: { in: projectIds } })
    }

    const where = conditions.length > 0 ? { and: conditions } : undefined

    const result = await payload.find({
      collection: 'projects',
      where,
      sort: '-updatedAt',
      limit: 0,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs as Project[]
  },
  ['filtered-projects'],
  { revalidate: 60, tags: ['projects', 'research_themes', 'study_sites'] },
)

/** Single project by slug. */
export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<Project | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 3,
      overrideAccess: true,
    })
    return (result.docs[0] as Project) ?? null
  },
  ['project-by-slug'],
  { revalidate: 60, tags: ['projects'] },
)

/** Study sites for a given project ID. */
export const getProjectStudySites = unstable_cache(
  async (projectId: number): Promise<StudySite[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'study_sites',
      where: { project: { equals: projectId } },
      sort: 'name',
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs as StudySite[]
  },
  ['project-study-sites'],
  { revalidate: 60, tags: ['study_sites'] },
)

/** All project slugs for generateStaticParams. */
export const getAllProjectSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'projects',
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })
    return (result.docs as Project[]).map((p) => p.slug).filter((s): s is string => Boolean(s))
  },
  ['project-slugs'],
  { revalidate: 300, tags: ['projects'] },
)
