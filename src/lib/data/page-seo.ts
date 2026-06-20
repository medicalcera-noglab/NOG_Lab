import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PageSeo, Media } from '../../../payload-types'

export const getPageSeo = unstable_cache(
  async (): Promise<PageSeo | null> => {
    const payload = await getPayload({ config })
    try {
      return await payload.findGlobal({ slug: 'page_seo', depth: 1, overrideAccess: true })
    } catch {
      return null
    }
  },
  ['page-seo-global'],
  { revalidate: 300, tags: ['page_seo'] },
)

export type PageSeoKey =
  | 'home'
  | 'about'
  | 'research'
  | 'projects'
  | 'publications'
  | 'collaborations'
  | 'impact'
  | 'news'
  | 'blog'
  | 'join'
  | 'contact'

/** Extract title, description, and ogImage URL for a specific page key + locale. */
export function resolvePageSeo(
  pageSeo: PageSeo | null,
  key: PageSeoKey,
  locale = 'en',
): { title?: string; description?: string; ogImageUrl?: string } {
  if (!pageSeo) return {}
  const group = pageSeo[key] as Record<string, unknown> | undefined
  if (!group) return {}

  const title =
    (locale === 'ur' ? (group.titleUr as string | undefined) : undefined) ||
    (group.title as string | undefined) ||
    undefined

  const description =
    (locale === 'ur' ? (group.descriptionUr as string | undefined) : undefined) ||
    (group.description as string | undefined) ||
    undefined

  const ogMedia =
    group.ogImage && typeof group.ogImage === 'object' ? (group.ogImage as Media) : null
  const ogImageUrl = ogMedia?.url ?? undefined

  return { title, description, ogImageUrl }
}
