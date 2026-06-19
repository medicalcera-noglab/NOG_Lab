import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { ResearchTheme, Project, Publication } from '../../../payload-types'

export type { ResearchTheme }

export interface ResearchPageData {
  themes: ResearchTheme[]
  projects: Project[]
  publications: Publication[]
}

/** All themes + all projects + all publications in one cached call. */
export const getResearchPageData = unstable_cache(
  async (): Promise<ResearchPageData> => {
    const payload = await getPayload({ config })
    const [themesResult, projectsResult, publicationsResult] = await Promise.all([
      payload.find({
        collection: 'research_themes',
        sort: 'displayOrder',
        limit: 0,
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'projects',
        limit: 0,
        depth: 2,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'publications',
        limit: 0,
        depth: 1,
        overrideAccess: true,
      }),
    ])
    return {
      themes: themesResult.docs as ResearchTheme[],
      projects: projectsResult.docs as Project[],
      publications: publicationsResult.docs as Publication[],
    }
  },
  ['research-page-data'],
  { revalidate: 60, tags: ['research_themes', 'projects', 'publications'] },
)

/** All themes (lightweight — for filter options, nav, badges). */
export const getAllResearchThemes = unstable_cache(
  async (): Promise<ResearchTheme[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'research_themes',
      sort: 'displayOrder',
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs as ResearchTheme[]
  },
  ['all-research-themes'],
  { revalidate: 300, tags: ['research_themes'] },
)
