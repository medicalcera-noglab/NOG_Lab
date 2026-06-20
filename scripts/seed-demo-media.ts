/**
 * Downloads free-license imagery from Wikimedia Commons, Unsplash, and Pexels,
 * uploads each through Payload's Sharp + R2 pipeline, and associates the
 * resulting media docs with the right content records.
 *
 * Sources used:
 *   Wikimedia Commons — public-domain / CC-licensed scientific micrographs (no key required)
 *   Unsplash          — Unsplash License (free for commercial use) — needs UNSPLASH_ACCESS_KEY
 *   Pexels            — Pexels License  (free for commercial use) — needs PEXELS_API_KEY
 *
 * All uploaded docs are flagged isDemo:true and carry full source/author/license metadata.
 * Remove with: npm run seed:clear-demo-media
 *
 * Run AFTER npm run seed:demo so content records already exist.
 *
 * Usage:
 *   DATABASE_URI=... PAYLOAD_SECRET=... \
 *   UNSPLASH_ACCESS_KEY=... PEXELS_API_KEY=... \
 *   npm run seed:demo-media
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageResult {
  url: string
  author: string
  license: string
  sourcePageUrl?: string
}

interface SourceSpec {
  type: 'wikimedia' | 'unsplash' | 'pexels'
  query: string
}

interface ImageSpec {
  id: string
  alt: string
  caption?: string
  sources: SourceSpec[]
}

type Payload = Awaited<ReturnType<typeof getPayload>>

// ─── Image specs ──────────────────────────────────────────────────────────────

const SPECS: ImageSpec[] = [
  // Hero background
  {
    id: 'hero-bg',
    alt: 'Colourised scanning electron micrograph of gut bacteria — hero background',
    sources: [
      { type: 'wikimedia', query: 'bacteria SEM colorized NIAID scanning electron micrograph' },
      { type: 'unsplash', query: 'bacteria microscope scientific petri dish' },
      { type: 'pexels', query: 'bacteria microscope science laboratory' },
    ],
  },

  // Research themes
  {
    id: 'theme-oral',
    alt: 'Scanning electron micrograph of Streptococcus bacteria in oral dental biofilm',
    sources: [
      { type: 'wikimedia', query: 'Lactobacillus acidophilus bacteria' },
      { type: 'unsplash', query: 'dental bacteria microscope science oral health' },
      { type: 'pexels', query: 'bacteria microscope laboratory science close-up' },
    ],
  },
  {
    id: 'theme-gut',
    alt: 'Colourised scanning electron micrograph of Lactobacillus intestinal bacteria',
    sources: [
      { type: 'wikimedia', query: 'Lactobacillus acidophilus bacteria' },
      { type: 'unsplash', query: 'gut microbiome bacteria science intestinal' },
      { type: 'pexels', query: 'science bacteria gut health laboratory' },
    ],
  },
  {
    id: 'theme-nutrition',
    alt: 'Colourful array of fresh vegetables and whole foods representing dietary diversity',
    sources: [
      { type: 'unsplash', query: 'fresh vegetables whole foods nutrition colourful diversity' },
      { type: 'pexels', query: 'vegetables fresh food nutrition colourful healthy' },
      { type: 'wikimedia', query: 'food nutrition plate healthy eating' },
    ],
  },
  {
    id: 'theme-bioinformatics',
    alt: 'Computer screen displaying genome sequence data and bioinformatics analysis visualisation',
    sources: [
      { type: 'unsplash', query: 'DNA genomics bioinformatics computer screen data analysis' },
      { type: 'pexels', query: 'DNA sequencing genetics computer data code' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },
  {
    id: 'theme-translational',
    alt: 'Healthcare worker conducting a patient consultation in a community clinic setting',
    sources: [
      { type: 'pexels', query: 'doctor patient consultation community health clinic' },
      { type: 'unsplash', query: 'healthcare community clinic doctor patient consultation' },
      { type: 'wikimedia', query: 'researcher scientist portrait professional' },
    ],
  },

  // Facilities gallery (About page)
  {
    id: 'facility-sequencer',
    alt: 'Next-generation DNA sequencing instrument in a molecular biology research laboratory',
    caption: 'Next-generation sequencing suite for microbiome profiling.',
    sources: [
      { type: 'unsplash', query: 'DNA sequencer laboratory genomics instrument machine' },
      { type: 'pexels', query: 'laboratory equipment scientific instrument genomics' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },
  {
    id: 'facility-wetlab',
    alt: 'Scientist pipetting samples at a molecular biology wet-lab bench',
    caption: 'Molecular biology and wet-lab space for sample processing and culture.',
    sources: [
      { type: 'unsplash', query: 'scientist pipette laboratory bench microbiology sample' },
      { type: 'pexels', query: 'scientist pipette laboratory research bench' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },
  {
    id: 'facility-bioinformatics',
    alt: 'Researcher at a bioinformatics workstation with multiple monitors showing sequence data',
    caption: 'Dedicated bioinformatics workstation for sequence analysis and data integration.',
    sources: [
      {
        type: 'unsplash',
        query: 'multiple monitors computer programming data science workstation',
      },
      { type: 'pexels', query: 'multiple screens computer data analysis workstation' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },

  // People — placeholder portraits
  {
    id: 'person-shahzad',
    alt: 'Placeholder portrait — replace with Dr. Muhammad Shahzad headshot before launch',
    sources: [
      { type: 'unsplash', query: 'professional man portrait headshot neutral background suit' },
      { type: 'pexels', query: 'professional man portrait headshot neutral background' },
      { type: 'wikimedia', query: 'academic professor university portrait photo' },
    ],
  },
  {
    id: 'person-ayesha',
    alt: 'Placeholder portrait — replace with Dr. Ayesha Khan headshot before launch',
    sources: [
      { type: 'unsplash', query: 'professional woman portrait headshot researcher scientist' },
      { type: 'pexels', query: 'professional woman portrait headshot researcher neutral' },
      { type: 'wikimedia', query: 'professional portrait headshot person' },
    ],
  },
  {
    id: 'person-bilal',
    alt: 'Placeholder portrait — replace with Bilal Ahmed headshot before launch',
    sources: [
      { type: 'unsplash', query: 'young man professional portrait graduate student headshot' },
      { type: 'pexels', query: 'young man professional portrait headshot student' },
      { type: 'wikimedia', query: 'graduation student university academic' },
    ],
  },
  {
    id: 'person-sana',
    alt: 'Placeholder portrait — replace with Sana Tariq headshot before launch',
    sources: [
      { type: 'unsplash', query: 'young woman professional portrait graduate student headshot' },
      { type: 'pexels', query: 'young woman professional portrait headshot student' },
      { type: 'wikimedia', query: 'graduation student university academic' },
    ],
  },
  {
    id: 'person-imran',
    alt: 'Placeholder portrait — replace with Imran Ali headshot before launch',
    sources: [
      { type: 'unsplash', query: 'man laboratory technician professional portrait headshot' },
      { type: 'pexels', query: 'man laboratory professional portrait headshot' },
      { type: 'wikimedia', query: 'professional portrait headshot person' },
    ],
  },
  {
    id: 'person-hina',
    alt: 'Placeholder portrait — replace with Dr. Hina Yousaf headshot before launch',
    sources: [
      { type: 'unsplash', query: 'woman academic researcher professional portrait headshot' },
      { type: 'pexels', query: 'woman academic professional portrait headshot researcher' },
      { type: 'wikimedia', query: 'researcher scientist portrait professional' },
    ],
  },

  // Project covers
  {
    id: 'project-gut',
    alt: 'Child receiving a nutritional health assessment at a community clinic',
    sources: [
      { type: 'unsplash', query: 'child health nutrition assessment community clinic paediatric' },
      { type: 'pexels', query: 'child health clinic nutrition assessment paediatric' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },
  {
    id: 'project-oral',
    alt: 'Researcher collecting an oral saliva sample for microbiome analysis',
    sources: [
      { type: 'unsplash', query: 'oral sample collection saliva laboratory swab researcher' },
      { type: 'pexels', query: 'saliva swab oral laboratory collection sample' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },
  {
    id: 'project-pipeline',
    alt: 'Bioinformatics pipeline code and sequence output on a computer terminal',
    sources: [
      { type: 'unsplash', query: 'code terminal programming pipeline data science computer' },
      { type: 'pexels', query: 'code terminal computer data analysis programming' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },

  // Blog post covers
  {
    id: 'blog-gut-diet',
    alt: 'Assortment of fresh whole foods illustrating the link between diet and the gut microbiome',
    sources: [
      {
        type: 'unsplash',
        query: 'fresh whole foods vegetables fruit nutrition gut health diversity',
      },
      { type: 'pexels', query: 'healthy food vegetables fruit nutrition whole grain' },
      { type: 'wikimedia', query: 'food nutrition plate healthy eating' },
    ],
  },
  {
    id: 'blog-oral-swab',
    alt: 'Scientist holding a sterile oral swab for microbiome sample collection',
    sources: [
      { type: 'unsplash', query: 'sterile swab laboratory sample collection scientist close-up' },
      { type: 'pexels', query: 'laboratory swab sample scientist close-up collection' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },

  // News & event covers
  {
    id: 'news-symposium',
    alt: 'Academic conference hall with a speaker presenting scientific research findings',
    sources: [
      { type: 'unsplash', query: 'academic conference hall speaker science presentation lecture' },
      { type: 'pexels', query: 'conference presentation science academic lecture hall' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },
  {
    id: 'news-grant',
    alt: 'Research team reviewing scientific data and grant documents at a meeting table',
    sources: [
      { type: 'unsplash', query: 'research team meeting collaboration science project documents' },
      { type: 'pexels', query: 'team meeting collaboration research science documents' },
      { type: 'wikimedia', query: 'scientist researcher laboratory work' },
    ],
  },
  {
    id: 'news-welcome',
    alt: 'Graduate students working together in a university research laboratory',
    sources: [
      { type: 'unsplash', query: 'graduate students university laboratory research team working' },
      { type: 'pexels', query: 'students university laboratory research team working' },
      { type: 'wikimedia', query: 'graduation student university academic' },
    ],
  },

  // Impact story cover
  {
    id: 'impact-nutrition',
    alt: "Community health worker measuring a young child's nutritional status at a health centre",
    sources: [
      { type: 'unsplash', query: 'child nutrition measurement health worker community centre' },
      { type: 'pexels', query: 'child health nutrition measurement community health worker' },
      { type: 'wikimedia', query: 'food nutrition plate healthy eating' },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[seed:demo-media] ${msg}`)
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

function isAcceptableLicense(license: string): boolean {
  const l = license.toLowerCase().trim()
  return (
    l === 'cc0' ||
    l === 'cc 0' ||
    l === 'public domain' ||
    l === 'pd' ||
    l.startsWith('cc by') ||
    l.startsWith('cc-by') ||
    l.includes('public domain') ||
    l.includes('attribution')
  )
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), 30_000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'NOGLab/1.0 (microbiome research; seed script; contact: medicalcera@gmail.com)',
      },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(tid)
  }
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchWikimediaImage(query: string): Promise<ImageResult | null> {
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
  // Use api.wikimedia.org — commons.wikimedia.org may be DNS-filtered locally.
  const apiUrl = `https://api.wikimedia.org/w/api.php?${params}`

  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'NOGLab/1.0 (microbiome research; seed script; contact: medicalcera@gmail.com)',
    },
  })
  if (!res.ok) return null

  const data = (await res.json()) as {
    query?: {
      pages?: {
        title: string
        imageinfo?: {
          url: string
          thumburl?: string
          mime?: string
          extmetadata?: {
            LicenseShortName?: { value: string }
            Artist?: { value: string }
            DescriptionUrl?: { value: string }
          }
        }[]
      }[]
    }
  }

  const pages = data.query?.pages ?? []
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    if (!info) continue

    const mime = info.mime ?? ''
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) continue

    const license = info.extmetadata?.LicenseShortName?.value ?? ''
    if (!isAcceptableLicense(license)) continue

    const rawAuthor = info.extmetadata?.Artist?.value ?? 'Unknown'
    const author = stripHtml(rawAuthor).slice(0, 200)
    const sourcePageUrl = info.extmetadata?.DescriptionUrl?.value ?? undefined

    // Prefer the thumbnail at 1600px; fall back to original
    const url = info.thumburl ?? info.url
    return { url, author, license, sourcePageUrl }
  }
  return null
}

async function fetchUnsplashImage(query: string): Promise<ImageResult | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) {
    log('  warn: UNSPLASH_ACCESS_KEY not set — skipping Unsplash')
    return null
  }

  const params = new URLSearchParams({
    query,
    orientation: 'landscape',
    client_id: key,
  })
  const res = await fetch(`https://api.unsplash.com/photos/random?${params}`)
  if (!res.ok) {
    log(`  warn: Unsplash API ${res.status} for "${query}"`)
    return null
  }

  const photo = (await res.json()) as {
    id: string
    urls: { full: string; regular: string }
    user: { name: string; links: { html: string } }
    links: { html: string; download_location: string }
  }

  // Trigger download event as required by Unsplash API guidelines
  await fetch(`${photo.links.download_location}&client_id=${key}`).catch(() => {})

  return {
    url: photo.urls.full ?? photo.urls.regular,
    author: `${photo.user.name} on Unsplash`,
    license: 'Unsplash License',
    sourcePageUrl: photo.links.html,
  }
}

async function fetchPexelsImage(query: string): Promise<ImageResult | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) {
    log('  warn: PEXELS_API_KEY not set — skipping Pexels')
    return null
  }

  const params = new URLSearchParams({ query, per_page: '1', orientation: 'landscape' })
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: key },
  })
  if (!res.ok) {
    log(`  warn: Pexels API ${res.status} for "${query}"`)
    return null
  }

  const data = (await res.json()) as {
    photos: {
      id: number
      photographer: string
      photographer_url: string
      url: string
      src: { original: string; large2x: string }
    }[]
  }

  const photo = data.photos?.[0]
  if (!photo) return null

  return {
    url: photo.src.original ?? photo.src.large2x,
    author: `${photo.photographer} on Pexels`,
    license: 'Pexels License',
    sourcePageUrl: photo.url,
  }
}

// ─── Core upload + idempotency ────────────────────────────────────────────────

async function seedMediaDoc(payload: Payload, spec: ImageSpec): Promise<{ id: number } | null> {
  // Idempotency: if a demo media doc with this exact alt already exists, reuse it
  const existing = await payload.find({
    collection: 'media',
    where: { and: [{ alt: { equals: spec.alt } }, { isDemo: { equals: true } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    const doc = existing.docs[0] as { id: number }
    log(`  reuse  [${spec.id}] id=${doc.id}`)
    return doc
  }

  // Try each source in order
  let result: ImageResult | null = null
  for (const src of spec.sources) {
    try {
      if (src.type === 'wikimedia') result = await fetchWikimediaImage(src.query)
      else if (src.type === 'unsplash') result = await fetchUnsplashImage(src.query)
      else if (src.type === 'pexels') result = await fetchPexelsImage(src.query)
      if (result) break
    } catch (e) {
      log(`  warn  [${spec.id}] ${src.type} error: ${String(e).slice(0, 120)}`)
    }
    // Small pause between API calls to stay within rate limits
    await new Promise((r) => setTimeout(r, 300))
  }

  if (!result) {
    log(`  skip  [${spec.id}] no image found from any source`)
    return null
  }

  // Download the image buffer
  let buffer: Buffer
  try {
    buffer = await downloadBuffer(result.url)
  } catch (e) {
    log(`  skip  [${spec.id}] download failed: ${String(e).slice(0, 120)}`)
    return null
  }

  if (buffer.byteLength < 8_000) {
    log(`  skip  [${spec.id}] buffer too small (${buffer.byteLength}b)`)
    return null
  }

  // Detect real MIME type from magic bytes
  const { fileTypeFromBuffer } = await import('file-type')
  const ft = await fileTypeFromBuffer(buffer)
  const mimetype = ft?.mime ?? 'image/jpeg'
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimetype)) {
    log(`  skip  [${spec.id}] unsupported mime: ${mimetype}`)
    return null
  }
  const ext = ft?.ext ?? 'jpg'
  const filename = `demo-${spec.id}.${ext}`

  const doc = await payload.create({
    collection: 'media',
    data: {
      alt: spec.alt,
      caption: spec.caption ?? null,
      sourceUrl: result.sourcePageUrl ?? result.url,
      sourceAuthor: result.author,
      sourceLicense: result.license,
      isDemo: true,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: { data: buffer, mimetype, name: filename, size: buffer.byteLength } as any,
    overrideAccess: true,
  })

  const sizeKb = Math.round(buffer.byteLength / 1024)
  log(
    `  upload [${spec.id}] id=${doc.id}  ${sizeKb}KB  ${mimetype}  ${result.license}  "${result.author.slice(0, 50)}"`,
  )
  return doc as unknown as { id: number }
}

// ─── Content association helpers ──────────────────────────────────────────────

async function patchCollection(
  payload: Payload,
  collection: Parameters<Payload['find']>[0]['collection'],
  where: Parameters<Payload['find']>[0]['where'],
  data: Record<string, unknown>,
  label: string,
): Promise<void> {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true })
  if (!found.docs.length) {
    log(`  warn  patch target not found: ${label}`)
    return
  }
  const id = (found.docs[0] as { id: number }).id
  await payload.update({ collection, id, data, overrideAccess: true })
  log(`  patch  ${label}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  // ── Phase 1: Upload all images ────────────────────────────────────────────
  log('\n── Phase 1: Uploading images ──────────────────────────────')
  const ids: Record<string, number> = {}
  for (const spec of SPECS) {
    const doc = await seedMediaDoc(payload, spec)
    if (doc) ids[spec.id] = doc.id
  }

  const uploaded = Object.keys(ids).length
  log(`\nUploaded ${uploaded}/${SPECS.length} images`)

  // ── Phase 2: Associate images with content records ────────────────────────
  log('\n── Phase 2: Associating images with content records ───────')

  // Hero background on site_settings
  if (ids['hero-bg']) {
    try {
      await payload.updateGlobal({
        slug: 'site_settings',
        data: { heroMedia: { style: 'image', image: ids['hero-bg'] } },
        overrideAccess: true,
      })
      log('  patch  site_settings.heroMedia')
    } catch (e) {
      log(`  warn  site_settings.heroMedia: ${String(e).slice(0, 100)}`)
    }
  }

  // Research theme images
  const THEME_MAP: Record<string, string> = {
    'theme-oral': 'oral-microbiome',
    'theme-gut': 'gut-microbiome',
    'theme-nutrition': 'nutrition-microbiome-host',
    'theme-bioinformatics': 'microbiome-bioinformatics',
    'theme-translational': 'translational-community-health',
  }
  for (const [specId, slug] of Object.entries(THEME_MAP)) {
    if (ids[specId]) {
      await patchCollection(
        payload,
        'research_themes',
        { slug: { equals: slug } },
        { themeImage: ids[specId] },
        `research_themes/${slug}.themeImage`,
      )
    }
  }

  // About global — facilities gallery
  const facilityEntries = [
    {
      specId: 'facility-sequencer',
      caption: 'Next-generation sequencing suite for microbiome profiling.',
    },
    {
      specId: 'facility-wetlab',
      caption: 'Molecular biology and wet-lab space for sample processing and culture.',
    },
    {
      specId: 'facility-bioinformatics',
      caption: 'Dedicated bioinformatics workstation for sequence analysis and data integration.',
    },
  ].filter((f) => ids[f.specId])

  if (facilityEntries.length > 0) {
    try {
      await payload.updateGlobal({
        slug: 'about',
        data: {
          facilities: facilityEntries.map((f) => ({
            image: ids[f.specId],
            caption: f.caption,
          })),
        },
        overrideAccess: true,
      })
      log(`  patch  about.facilities (${facilityEntries.length} entries)`)
    } catch (e) {
      log(`  warn  about.facilities: ${String(e).slice(0, 100)}`)
    }
  }

  // People photos
  const PERSON_MAP: Record<string, string> = {
    'person-shahzad': 'muhammad-shahzad',
    'person-ayesha': 'ayesha-khan',
    'person-bilal': 'bilal-ahmed',
    'person-sana': 'sana-tariq',
    'person-imran': 'imran-ali',
    'person-hina': 'hina-yousaf',
  }
  for (const [specId, slug] of Object.entries(PERSON_MAP)) {
    if (ids[specId]) {
      await patchCollection(
        payload,
        'people',
        { slug: { equals: slug } },
        { photo: ids[specId] },
        `people/${slug}.photo`,
      )
    }
  }

  // Project covers
  const PROJECT_MAP: Record<string, string> = {
    'project-gut': 'gut-microbiome-childhood-malnutrition',
    'project-oral': 'oral-microbiome-early-marker',
    'project-pipeline': 'microbiome-bioinformatics-pipeline',
  }
  for (const [specId, slug] of Object.entries(PROJECT_MAP)) {
    if (ids[specId]) {
      await patchCollection(
        payload,
        'projects',
        { slug: { equals: slug } },
        { coverImage: ids[specId] },
        `projects/${slug}.coverImage`,
      )
    }
  }

  // Blog post covers
  const BLOG_MAP: Record<string, string> = {
    'blog-gut-diet': 'gut-microbes-and-diet',
    'blog-oral-swab': 'oral-microbiome-swab-to-signal',
  }
  for (const [specId, slug] of Object.entries(BLOG_MAP)) {
    if (ids[specId]) {
      await patchCollection(
        payload,
        'blog_posts',
        { slug: { equals: slug } },
        { coverImage: ids[specId] },
        `blog_posts/${slug}.coverImage`,
      )
    }
  }

  // News event covers
  const NEWS_MAP: Record<string, string> = {
    'news-symposium': 'nog-lab-microbiome-symposium-2025',
    'news-grant': 'collaborative-grant-kpk-microbiome',
    'news-welcome': 'nog-lab-2026-cohort-welcome',
  }
  for (const [specId, slug] of Object.entries(NEWS_MAP)) {
    if (ids[specId]) {
      await patchCollection(
        payload,
        'news_events',
        { slug: { equals: slug } },
        { coverImage: ids[specId] },
        `news_events/${slug}.coverImage`,
      )
    }
  }

  // Impact story cover
  if (ids['impact-nutrition']) {
    await patchCollection(
      payload,
      'impact_stories',
      { slug: { equals: 'microbiome-data-to-nutrition-insight' } },
      { cover: ids['impact-nutrition'] },
      'impact_stories/microbiome-data-to-nutrition-insight.cover',
    )
  }

  log('\nDemo media seed complete ✓')
  log(
    `Uploaded ${uploaded} image(s). Skipped ${SPECS.length - uploaded} (no suitable source or API key missing).`,
  )
  log('Attribution summary:')
  for (const [specId, mediaId] of Object.entries(ids)) {
    log(`  [${specId}] → media id=${mediaId}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('[seed:demo-media] Fatal error:', err)
  process.exit(1)
})
