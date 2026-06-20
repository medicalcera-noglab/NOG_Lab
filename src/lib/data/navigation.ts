import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Navigation } from '../../../payload-types'

export const getNavigation = unstable_cache(
  async (): Promise<Navigation | null> => {
    const payload = await getPayload({ config })
    try {
      return await payload.findGlobal({ slug: 'navigation', depth: 0, overrideAccess: true })
    } catch {
      return null
    }
  },
  ['navigation-global'],
  { revalidate: 300, tags: ['navigation'] },
)

/** Pick the right label for the current locale (falls back to EN label). */
export function pickLabel(
  label: string | null | undefined,
  labelUr: string | null | undefined,
  locale: string,
): string {
  return locale === 'ur' && labelUr ? labelUr : (label ?? '')
}
