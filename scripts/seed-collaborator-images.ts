/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fetches university campus / building photos from Wikimedia Commons and
 * attaches them as `logo` media to each Collaborator in Payload CMS.
 *
 * All images: CC BY / CC BY-SA / CC0 — no API key required.
 * Idempotent: skips records that already have a logo set.
 *
 * Run: tsx --env-file=.env.local scripts/seed-collaborator-images.ts
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

const UA = 'NOGLab/1.0 (microbiome research; seed script; contact: medicalcera@gmail.com)'

function log(msg: string) {
  console.log(`[collab-images] ${msg}`)
}

interface CollabSpec {
  name: string
  alt: string
  queries: string[]
}

const SPECS: CollabSpec[] = [
  {
    name: 'School of Biological Sciences, University of Reading',
    alt: 'University of Reading WhiteKnights campus building, United Kingdom',
    queries: [
      'University of Reading WhiteKnights campus building',
      'Reading University campus buildings UK',
      'University of Reading library building',
    ],
  },
  {
    name: 'Department for Biomedical Research, University of Bern',
    alt: 'University of Bern historic main building, Switzerland',
    queries: [
      'University of Bern main building Switzerland',
      'Universität Bern Hauptgebäude historic',
      'Bern University campus architecture Switzerland',
    ],
  },
  {
    name: 'School of Nursing, Emory University',
    alt: 'Emory University campus building Atlanta Georgia USA',
    queries: [
      'Emory University campus building Atlanta',
      'Emory University Candler Library',
      'Emory University Georgia campus quadrangle',
    ],
  },
  {
    name: 'Faculty of Dentistry, King Abdul Aziz University',
    alt: 'King Abdulaziz University campus building Jeddah Saudi Arabia',
    queries: [
      'King Abdulaziz University campus Jeddah',
      'King Abdulaziz University Saudi Arabia building',
      'KAU university campus building Saudi',
    ],
  },
  {
    name: 'Centre for Dental Medicine, University of Zurich',
    alt: 'University of Zurich main building Switzerland',
    queries: [
      'University of Zurich main building Rämistrasse',
      'Universität Zürich Hauptgebäude facade',
      'University of Zurich campus architecture',
    ],
  },
  {
    name: 'College of Food and Agriculture, Qassim University',
    alt: 'Qassim University campus building Saudi Arabia',
    queries: [
      'Qassim University campus Saudi Arabia',
      'Saudi Arabia university campus modern building',
      'King Saud University campus Riyadh buildings',
    ],
  },
]

// ─── Wikimedia Commons search ─────────────────────────────────────────────────

interface WikiResult {
  url: string
  author: string
  license: string
  sourcePageUrl?: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#?[a-z0-9]+;/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isFreeLicense(license: string): boolean {
  const l = license.toLowerCase().trim()
  return (
    l === 'cc0' ||
    l === 'public domain' ||
    l === 'pd' ||
    l.startsWith('cc by') ||
    l.startsWith('cc-by') ||
    l.includes('public domain') ||
    l.includes('attribution')
  )
}

async function searchWikimedia(query: string): Promise<WikiResult | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: query,
    prop: 'imageinfo',
    iiprop: 'url|thumburl|mime|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
    formatversion: '2',
    gsrlimit: '20',
  })

  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const pages: any[] = data?.query?.pages ?? []

    for (const page of pages) {
      const info = page.imageinfo?.[0]
      if (!info) continue
      const mime = info.mime ?? ''
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) continue
      const license = info.extmetadata?.LicenseShortName?.value ?? ''
      if (!isFreeLicense(license)) continue
      const rawAuthor = info.extmetadata?.Artist?.value ?? 'Unknown'
      const author = stripHtml(rawAuthor).slice(0, 200)
      const sourcePageUrl = info.extmetadata?.DescriptionUrl?.value ?? undefined
      const url = info.thumburl ?? info.url
      return { url, author, license, sourcePageUrl }
    }
  } catch {
    // network error — return null and try next query
  }
  return null
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30000),
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload')

  for (const spec of SPECS) {
    log(`\n→ ${spec.name}`)

    const { docs } = await payload.find({
      collection: 'collaborators',
      where: { name: { equals: spec.name } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (docs.length === 0) {
      log('  SKIP — not found in DB')
      continue
    }

    const collab = docs[0] as any
    if (collab.logo) {
      log(`  SKIP — already has logo (id ${collab.logo})`)
      continue
    }

    let result: WikiResult | null = null
    for (const q of spec.queries) {
      log(`  Searching: "${q.slice(0, 70)}"`)
      result = await searchWikimedia(q)
      if (result) {
        log(`  Found: ${result.license} by ${result.author.slice(0, 50)}`)
        break
      }
      await new Promise((r) => setTimeout(r, 400))
    }

    if (!result) {
      log('  FAIL — no image found')
      continue
    }

    let buffer: Buffer
    try {
      buffer = await downloadBuffer(result.url)
    } catch (e: any) {
      log(`  Download failed: ${e.message}`)
      continue
    }

    if (buffer.byteLength < 8000) {
      log(`  Too small (${buffer.byteLength}B) — skipping`)
      continue
    }

    const { fileTypeFromBuffer } = await import('file-type')
    const ft = await fileTypeFromBuffer(buffer)
    const mimetype = ft?.mime ?? 'image/jpeg'
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimetype)) {
      log(`  Unsupported mime: ${mimetype} — skipping`)
      continue
    }
    const ext = ft?.ext ?? 'jpg'
    const safeName = spec.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 60)
    const filename = `collab-${safeName}.${ext}`

    // Idempotency check by alt text
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: spec.alt } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let mediaId: number
    if (existing.docs.length > 0) {
      mediaId = (existing.docs[0] as any).id
      log(`  Reusing existing media id ${mediaId}`)
    } else {
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: spec.alt,
          sourceUrl: result.sourcePageUrl ?? result.url,
          sourceAuthor: result.author,
          sourceLicense: result.license,
          isDemo: true,
        },
        file: { data: buffer, mimetype, name: filename, size: buffer.byteLength } as any,
        overrideAccess: true,
      })
      mediaId = (media as any).id
      log(`  Uploaded → media id ${mediaId} (${Math.round(buffer.byteLength / 1024)}KB)`)
    }

    await payload.update({
      collection: 'collaborators',
      id: collab.id,
      data: { logo: mediaId },
      overrideAccess: true,
    })
    log(`  Linked → collaborator id ${collab.id}`)

    await new Promise((r) => setTimeout(r, 700))
  }

  log('\nDone!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
