import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { About } from '../../../payload-types'

export const getAbout = unstable_cache(
  async (): Promise<About | null> => {
    const payload = await getPayload({ config })
    try {
      return await payload.findGlobal({ slug: 'about', depth: 2, overrideAccess: true })
    } catch {
      return null
    }
  },
  ['about-global'],
  { revalidate: 300, tags: ['about'] },
)
