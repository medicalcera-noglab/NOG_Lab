import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

function tryRevalidateTag(tag: string) {
  try {
    ;(revalidateTag as (tag: string) => void)(tag)
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

/** Factory: returns an afterDelete hook that revalidates one or more cache tags. */
export function makeDeleteRevalidateHook(tags: string[]): CollectionAfterDeleteHook {
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

// Pre-built afterChange hooks (CollectionAfterChangeHook).
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

// Pre-built afterDelete hooks (CollectionAfterDeleteHook) — same tags, correct type.
export const revalidatePeopleOnDelete = makeDeleteRevalidateHook(['people'])
export const revalidatePublicationsOnDelete = makeDeleteRevalidateHook(['publications'])
export const revalidateProjectsOnDelete = makeDeleteRevalidateHook(['projects', 'study_sites'])
export const revalidateBlogPostsOnDelete = makeDeleteRevalidateHook(['blog_posts'])
export const revalidateNewsEventsOnDelete = makeDeleteRevalidateHook(['news_events'])
export const revalidateResearchThemesOnDelete = makeDeleteRevalidateHook(['research_themes'])
export const revalidateCollaboratorsOnDelete = makeDeleteRevalidateHook(['collaborators'])
export const revalidateStudySitesOnDelete = makeDeleteRevalidateHook(['study_sites', 'projects'])
export const revalidateImpactStoriesOnDelete = makeDeleteRevalidateHook(['impact_stories'])
export const revalidateMediaCoverageOnDelete = makeDeleteRevalidateHook(['media_coverage'])
export const revalidateOpenPositionsOnDelete = makeDeleteRevalidateHook(['open_positions'])
export const revalidateOutreach = makeRevalidateHook(['outreach_activities'])
export const revalidateOutreachOnDelete = makeDeleteRevalidateHook(['outreach_activities'])

export const revalidateSiteSettings = makeGlobalRevalidateHook(['site_settings'])

export const revalidateAbout = makeGlobalRevalidateHook(['about'])

export const revalidateLegalPages = makeGlobalRevalidateHook(['legal_pages'])

export const revalidateNavigation = makeGlobalRevalidateHook(['navigation'])

export const revalidatePageSeo = makeGlobalRevalidateHook(['page_seo'])

export const revalidateOutreachPage = makeGlobalRevalidateHook(['outreach_page'])

export const revalidatePartnershipsPage = makeGlobalRevalidateHook(['partnerships_page'])
