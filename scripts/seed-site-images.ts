/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Downloads free-license images from Wikimedia Commons / NIH and uploads them
 * to Payload as site visual assets. All images are public domain or CC-licensed.
 *
 * Run: tsx --env-file=.env.local scripts/seed-site-images.ts
 */

import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '../payload.config'

function log(msg: string) {
  console.log(`[seed-images] ${msg}`)
}

const MEDIA_DIR = path.resolve('./public/media')
const UA = 'NOGLab/1.0 (noglab.org; educational research)'

// All images: Wikimedia Commons direct file URLs — NIAID/CDC/Wellcome (CC BY 2.0 / CC BY 4.0)
const IMAGES = [
  {
    key: 'research-banner',
    // NIAID colorized SEM of Staphylococcus aureus — CC BY 2.0
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/SEM_Staphylococcus_aureus_VISA_2.jpg/1280px-SEM_Staphylococcus_aureus_VISA_2.jpg',
    filename: 'site-research-banner.jpg',
    alt: 'Colorized scanning electron microscopy of Staphylococcus aureus bacteria',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:SEM_Staphylococcus_aureus_VISA_2.jpg',
    sourceAuthor: 'NIAID',
    sourceLicense: 'CC BY 2.0',
  },
  {
    key: 'people-banner',
    // NIAID lab technician — CC BY 2.0
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/NIAID_Lab_Technician_%2826519860680%29.jpg/1280px-NIAID_Lab_Technician_%2826519860680%29.jpg',
    filename: 'site-people-banner.jpg',
    alt: 'NIAID laboratory technician conducting microbiome research',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:NIAID_Lab_Technician_(26519860680).jpg',
    sourceAuthor: 'NIAID',
    sourceLicense: 'CC BY 2.0',
  },
  {
    key: 'projects-banner',
    // NIAID Salmonella SEM — CC BY 2.0
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/SalmonellaNIAID.jpg/1280px-SalmonellaNIAID.jpg',
    filename: 'site-projects-banner.jpg',
    alt: 'Colorized scanning electron microscopy of Salmonella bacteria',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:SalmonellaNIAID.jpg',
    sourceAuthor: 'NIAID',
    sourceLicense: 'CC BY 2.0',
  },
  {
    key: 'publications-banner',
    // NIAID E. coli SEM — CC BY 2.0
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/E_coli_at_10000x%2C_original.jpg/1280px-E_coli_at_10000x%2C_original.jpg',
    filename: 'site-publications-banner.jpg',
    alt: 'Scanning electron microscopy of Escherichia coli bacteria at 10,000x magnification',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:E_coli_at_10000x,_original.jpg',
    sourceAuthor: 'NIAID',
    sourceLicense: 'CC BY 2.0',
  },
  {
    key: 'collaborations-banner',
    // NIAID lab research image — CC BY 2.0
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Microbiologist_examines_culture_plate_%284689121988%29.jpg/1280px-Microbiologist_examines_culture_plate_%284689121988%29.jpg',
    filename: 'site-collaborations-banner.jpg',
    alt: 'Microbiologist examining culture plate in international research collaboration',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Microbiologist_examines_culture_plate_(4689121988).jpg',
    sourceAuthor: 'USAID',
    sourceLicense: 'CC BY 2.0',
  },
]

async function download(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      log(`  HTTP ${res.status}`)
      return false
    }
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 10000) {
      log(`  Too small (${buf.length}B)`)
      return false
    }
    fs.writeFileSync(dest, buf)
    log(`  ${(buf.length / 1024).toFixed(0)} KB saved`)
    return true
  } catch (e: any) {
    log(`  Download error: ${e.message ?? e}`)
    return false
  }
}

async function main() {
  fs.mkdirSync(MEDIA_DIR, { recursive: true })
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  for (const img of IMAGES) {
    log(`\n${img.key}`)
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: img.alt } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      log(`  SKIP — already exists (id ${existing.docs[0].id})`)
      continue
    }

    const dest = path.join(MEDIA_DIR, img.filename)
    const ok = await download(img.url, dest)
    if (!ok) continue

    const fileBuffer = fs.readFileSync(dest)
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: img.alt,
        sourceUrl: img.sourceUrl,
        sourceAuthor: img.sourceAuthor,
        sourceLicense: img.sourceLicense,
      },
      file: {
        data: fileBuffer,
        mimetype: 'image/jpeg',
        name: img.filename,
        size: fileBuffer.length,
      },
    } as any)
    log(`  Uploaded → media id ${media.id}`)
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 800))
  }

  log('\nDone!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
