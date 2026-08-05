import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { OutreachActivity, OutreachPage } from '../../../payload-types'

export const getOutreachPage = unstable_cache(
  async (): Promise<OutreachPage | null> => {
    const payload = await getPayload({ config })
    try {
      return await payload.findGlobal({ slug: 'outreach_page', depth: 1, overrideAccess: true })
    } catch {
      return null
    }
  },
  ['outreach-page-global'],
  { revalidate: 300, tags: ['outreach_page'] },
)

export const getOutreachActivities = unstable_cache(
  async (): Promise<OutreachActivity[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'outreach_activities',
      where: { status: { equals: 'published' } },
      sort: '-date',
      depth: 2,
      overrideAccess: true,
    })
    return result.docs
  },
  ['outreach-activities'],
  { revalidate: 300, tags: ['outreach_activities'] },
)
