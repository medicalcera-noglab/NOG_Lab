import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { SiteSetting } from '../../../payload-types'

/** Returns the published SiteSettings global. Cached for 60 s; revalidate by tagging 'site_settings'. */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'site_settings',
      depth: 1, // expand logo + brochure media
      overrideAccess: true,
    })
  },
  ['site-settings'],
  { revalidate: 60, tags: ['site_settings'] },
)
