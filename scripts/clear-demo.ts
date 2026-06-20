/**
 * Removes all records flagged isDemo:true from every content collection.
 *
 * Usage:
 *   DATABASE_URI=... PAYLOAD_SECRET=... npm run seed:clear-demo
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

const COLLECTIONS = [
  'research_themes',
  'projects',
  'study_sites',
  'people',
  'collaborators',
  'blog_posts',
  'news_events',
  'impact_stories',
  'open_positions',
] as const

function log(msg: string) {
  console.log(`[clear-demo] ${msg}`)
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  let total = 0

  for (const collection of COLLECTIONS) {
    const found = await payload.find({
      collection,
      where: { isDemo: { equals: true } },
      limit: 10000,
      depth: 0,
    })

    let deleted = 0
    for (const doc of found.docs) {
      const id = (doc as { id: string | number }).id
      await payload.delete({ collection, id })
      deleted++
    }

    if (deleted > 0) {
      log(`${collection}: deleted ${deleted}`)
    } else {
      log(`${collection}: nothing to remove`)
    }
    total += deleted
  }

  log(`Done — removed ${total} demo record(s) in total`)
  process.exit(0)
}

main().catch((err) => {
  console.error('[clear-demo] Fatal error:', err)
  process.exit(1)
})
