import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PartnershipsPage } from '../../../payload-types'

export const getPartnershipsPage = unstable_cache(
  async (): Promise<PartnershipsPage | null> => {
    const payload = await getPayload({ config })
    try {
      return await payload.findGlobal({
        slug: 'partnerships_page',
        depth: 1,
        overrideAccess: true,
      })
    } catch {
      return null
    }
  },
  ['partnerships-page-global'],
  { revalidate: 300, tags: ['partnerships_page'] },
)
