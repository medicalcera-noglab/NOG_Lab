import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { LegalPage } from '../../../payload-types'

export const getLegalPages = unstable_cache(
  async (): Promise<LegalPage | null> => {
    const payload = await getPayload({ config })
    try {
      return await payload.findGlobal({ slug: 'legal_pages', depth: 0, overrideAccess: true })
    } catch {
      return null
    }
  },
  ['legal-pages-global'],
  { revalidate: 3600, tags: ['legal_pages'] },
)
