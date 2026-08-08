import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { OpenPosition } from '../../../payload-types'

export const getOpenPositions = unstable_cache(
  async (): Promise<OpenPosition[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'open_positions',
      where: { is_active: { equals: true } },
      limit: 50,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  },
  ['open-positions'],
  { revalidate: 300, tags: ['open_positions'] },
)
