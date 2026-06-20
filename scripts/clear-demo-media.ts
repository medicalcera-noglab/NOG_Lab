/**
 * Deletes all media documents flagged isDemo:true.
 * Payload's storage plugin (S3/R2 adapter) removes the underlying files
 * automatically via its afterDelete hook; local-disk files are handled
 * the same way by Payload's default adapter.
 *
 * Usage:
 *   DATABASE_URI=... PAYLOAD_SECRET=... npm run seed:clear-demo-media
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

function log(msg: string) {
  console.log(`[clear-demo-media] ${msg}`)
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  const found = await payload.find({
    collection: 'media',
    where: { isDemo: { equals: true } },
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  })

  log(`Found ${found.totalDocs} demo media document(s)`)

  let deleted = 0
  for (const doc of found.docs) {
    const id = (doc as { id: string | number }).id
    const alt = (doc as { alt?: string }).alt ?? '(no alt)'
    await payload.delete({ collection: 'media', id, overrideAccess: true })
    log(`  deleted id=${id}  "${alt.slice(0, 60)}"`)
    deleted++
  }

  log(`Done — removed ${deleted} demo media document(s)`)
  process.exit(0)
}

main().catch((err) => {
  console.error('[clear-demo-media] Fatal error:', err)
  process.exit(1)
})
