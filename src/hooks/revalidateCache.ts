import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

/** Factory: returns an afterChange hook that revalidates one or more cache tags. */
export function makeRevalidateHook(tags: string[]): CollectionAfterChangeHook {
  return () => {
    for (const tag of tags) revalidateTag(tag, 'default')
  }
}

/** Factory: returns a global afterChange hook that revalidates one or more cache tags. */
export function makeGlobalRevalidateHook(tags: string[]): GlobalAfterChangeHook {
  return () => {
    for (const tag of tags) revalidateTag(tag, 'default')
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
