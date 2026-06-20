import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

function tryRevalidateTag(tag: string) {
  try {
    revalidateTag(tag, 'default')
  } catch {
    // no-op outside Next.js request context (e.g. seed scripts)
  }
}

/** Factory: returns an afterChange hook that revalidates one or more cache tags. */
export function makeRevalidateHook(tags: string[]): CollectionAfterChangeHook {
  return () => {
    for (const tag of tags) tryRevalidateTag(tag)
  }
}

/** Factory: returns a global afterChange hook that revalidates one or more cache tags. */
export function makeGlobalRevalidateHook(tags: string[]): GlobalAfterChangeHook {
  return () => {
    for (const tag of tags) tryRevalidateTag(tag)
  }
}

// Pre-built hooks for every collection / global that has cached data fetchers.

export const revalidatePeople = makeRevalidateHook(['people'])

export const revalidatePublications = makeRevalidateHook(['publications'])

export const revalidateProjects = makeRevalidateHook(['projects', 'study_sites'])

export const revalidateBlogPosts = makeRevalidateHook(['blog_posts'])

export const revalidateNewsEvents = makeRevalidateHook(['news_events'])

export const revalidateResearchThemes = makeRevalidateHook(['research_themes'])

export const revalidateCollaborators = makeRevalidateHook(['collaborators'])

export const revalidateStudySites = makeRevalidateHook(['study_sites', 'projects'])

export const revalidateImpactStories = makeRevalidateHook(['impact_stories'])

export const revalidateMediaCoverage = makeRevalidateHook(['media_coverage'])

export const revalidateOpenPositions = makeRevalidateHook(['open_positions'])

export const revalidateSiteSettings = makeGlobalRevalidateHook(['site_settings'])

export const revalidateAbout = makeGlobalRevalidateHook(['about'])

export const revalidateLegalPages = makeGlobalRevalidateHook(['legal_pages'])

export const revalidateNavigation = makeGlobalRevalidateHook(['navigation'])

export const revalidatePageSeo = makeGlobalRevalidateHook(['page_seo'])
