/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Uploads headshot photos for each team member and attaches them to their
 * People record.  Run once: tsx --env-file=.env.local scripts/upload-people-photos.ts
 */

import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '../payload.config'

function log(msg: string) {
  console.log(`[upload-photos] ${msg}`)
}

const PHOTOS_DIR = '/Users/mc/Desktop/detaisl'

const assignments: { file: string; personSlug: string; altText: string }[] = [
  {
    file: 'Dr. Shahzad pic.png',
    personSlug: 'muhammad-shahzad',
    altText: 'Dr Muhammad Shahzad',
  },
  {
    file: 'Dr. Maria Ishaq Khattak.png',
    personSlug: 'maria-ishaq-khattak',
    altText: 'Dr Maria Ishaq Khattak',
  },
  {
    file: 'DR. Wafa Naeem.jpeg',
    personSlug: 'wafa-naeem',
    altText: 'Dr Wafa Naeem',
  },
  {
    file: 'Dr. Bibi Hajira.jpeg',
    personSlug: 'bibi-hajira',
    altText: 'Dr Bibi Hajira',
  },
  {
    file: 'Dr. Ahsan Saidal.jpeg',
    personSlug: 'ahsan-saidal',
    altText: 'Ahsan Saidal',
  },
]

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  for (const { file, personSlug, altText } of assignments) {
    const filePath = path.join(PHOTOS_DIR, file)
    if (!fs.existsSync(filePath)) {
      log(`  SKIP — file not found: ${file}`)
      continue
    }

    // Find the person
    const personResult = await payload.find({
      collection: 'people',
      where: { slug: { equals: personSlug } },
      limit: 1,
    })
    if (personResult.docs.length === 0) {
      log(`  SKIP — person not found: ${personSlug}`)
      continue
    }
    const person = personResult.docs[0]

    // Check if photo already uploaded (skip re-upload)
    if (person.photo && typeof person.photo === 'object') {
      log(`  SKIP — ${altText} already has a photo`)
      continue
    }

    // Upload to media collection
    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(file).slice(1).toLowerCase()
    const mimetype = ext === 'png' ? 'image/png' : 'image/jpeg'

    log(`  Uploading ${file}...`)
    const media = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: {
        data: fileBuffer,
        mimetype,
        name: file,
        size: fileBuffer.length,
      },
    } as any)
    log(`  Uploaded → media id ${media.id}`)

    // Attach to person
    await payload.update({
      collection: 'people',
      id: person.id as number,
      data: { photo: media.id },
    } as any)
    log(`  Attached photo to ${altText}`)
  }

  log('\nDone!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
