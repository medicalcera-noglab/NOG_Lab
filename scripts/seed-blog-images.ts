/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fetches topic-relevant images from Wikimedia Commons and attaches them
 * as coverImage to each blog post in Payload CMS.
 *
 * All images: CC BY / CC0 / Public Domain — no API key required.
 * Idempotent: skips posts that already have a coverImage set.
 *
 * Run: tsx --env-file=.env.local scripts/seed-blog-images.ts
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

const UA = 'NOGLab/1.0 (microbiome research; seed script; contact: medicalcera@gmail.com)'

function log(msg: string) {
  console.log(`[blog-images] ${msg}`)
}

interface PostSpec {
  slug: string
  alt: string
  queries: string[]
}

const SPECS: PostSpec[] = [
  {
    slug: 'gut-microbiome-malnourished-children-pakistan',
    alt: 'Scanning electron micrograph of E. coli bacteria representing gut microbiome in malnourished children',
    queries: [
      'E. coli bacteria scanning electron microscope',
      'Helicobacter pylori bacteria stomach SEM',
      'intestinal bacteria colony agar culture plate',
    ],
  },
  {
    slug: 'naswar-oral-microbiome-cancer-risk',
    alt: 'Scanning electron micrograph of oral bacteria associated with smokeless tobacco and oral cancer risk',
    queries: [
      'Streptococcus mutans oral bacteria scanning electron micrograph',
      'oral bacteria SEM biofilm mouth microbiome colorized',
      'bacteria SEM colorized NIAID scanning electron micrograph',
    ],
  },
  {
    slug: 'champ-study-lessons-childhood-microbiome',
    alt: 'Colorized SEM image of gut microbiome bacteria representing childhood microbiome health research in Pakistan',
    queries: [
      'Salmonella bacteria colorized scanning electron micrograph NIAID',
      'gut microbiota intestinal bacteria SEM child health',
      'Bifidobacterium bacteria scanning electron micrograph',
    ],
  },
  {
    slug: 'afghan-refugee-gut-microbiome-research',
    alt: 'Electron micrograph of gut bacteria representing microbiome research in Afghan refugee populations',
    queries: [
      'E. coli bacteria scanning electron microscope',
      'gut bacteria SEM intestinal microbiome colony',
      'Salmonella typhimurium scanning electron micrograph',
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
    iiurlwidth: '1600',
    format: 'json',
    formatversion: '2',
    gsrlimit: '20',
  })

  const apiUrl = `https://en.wikipedia.org/w/api.php?${params}`

  let data: any
  try {
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) {
      log(`  Wikimedia API HTTP ${res.status} for "${query.slice(0, 60)}"`)
      return null
    }
    data = await res.json()
  } catch (e: any) {
    log(`  Wikimedia API error: ${e.message?.slice(0, 80)}`)
    return null
  }

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
    log(`\n→ ${spec.slug}`)

    const { docs: posts } = await payload.find({
      collection: 'blog_posts',
      where: { slug: { equals: spec.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (posts.length === 0) {
      log('  SKIP — post not found in DB')
      continue
    }

    const post = posts[0] as any
    if (post.coverImage) {
      log(`  SKIP — already has coverImage (id ${post.coverImage})`)
      continue
    }

    // Try each query in order until one succeeds
    let wikiResult: WikiResult | null = null
    for (const q of spec.queries) {
      log(`  Searching: "${q.slice(0, 70)}"`)
      wikiResult = await searchWikimedia(q)
      if (wikiResult) {
        log(`  Found: ${wikiResult.license} by ${wikiResult.author.slice(0, 60)}`)
        break
      }
      await new Promise((r) => setTimeout(r, 400))
    }

    if (!wikiResult) {
      log('  FAIL — no image found from any query')
      continue
    }

    let buffer: Buffer
    try {
      buffer = await downloadBuffer(wikiResult.url)
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
    const filename = `blog-${spec.slug}.${ext}`

    // Idempotency: reuse if media with this alt already exists
    const existingMedia = await payload.find({
      collection: 'media',
      where: { alt: { equals: spec.alt } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let mediaId: number
    if (existingMedia.docs.length > 0) {
      mediaId = (existingMedia.docs[0] as any).id
      log(`  Reusing existing media id ${mediaId}`)
    } else {
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: spec.alt,
          sourceUrl: wikiResult.sourcePageUrl ?? wikiResult.url,
          sourceAuthor: wikiResult.author,
          sourceLicense: wikiResult.license,
          isDemo: true,
        },
        file: { data: buffer, mimetype, name: filename, size: buffer.byteLength } as any,
        overrideAccess: true,
      })
      mediaId = (media as any).id
      log(`  Uploaded → media id ${mediaId}  (${Math.round(buffer.byteLength / 1024)}KB)`)
    }

    await payload.update({
      collection: 'blog_posts',
      id: post.id,
      data: { coverImage: mediaId },
      overrideAccess: true,
    })
    log(`  Linked → post id ${post.id}`)

    await new Promise((r) => setTimeout(r, 700))
  }

  log('\nDone!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
