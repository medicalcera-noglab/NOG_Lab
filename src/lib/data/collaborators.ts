import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Collaborator } from '../../../payload-types'

export const getAllCollaborators = unstable_cache(
  async (): Promise<Collaborator[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'collaborators',
      sort: 'displayOrder',
      limit: 200,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  },
  ['all-collaborators'],
  { revalidate: 300, tags: ['collaborators'] },
)
