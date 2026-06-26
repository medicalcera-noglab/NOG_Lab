/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Sets the About global's directorPortrait to Dr. Muhammad Shahzad's headshot.
 * Run: tsx --env-file=.env.local scripts/set-director-portrait.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  // Find Shahzad's media doc by filename
  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'Dr. Shahzad pic.png' } },
    limit: 1,
  })

  if (media.docs.length === 0) {
    console.error('Media not found — make sure upload-people-photos.ts has been run')
    process.exit(1)
  }

  const mediaId = media.docs[0].id
  console.log(`Found media id ${mediaId}`)

  const about = await payload.findGlobal({ slug: 'about' })

  await payload.updateGlobal({
    slug: 'about',
    data: {
      ...about,
      directorPortrait: mediaId,
    } as any,
  })

  console.log('About global updated — directorPortrait set to media id', mediaId)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
