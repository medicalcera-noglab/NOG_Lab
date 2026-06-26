/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fetches citation counts from CrossRef for all publications with a DOI
 * and updates the citationCount field in Payload.
 *
 * CrossRef API is free, no key required. Uses polite pool (mailto in User-Agent).
 * Rate-limited to ~1 req/sec to stay within CrossRef's polite pool guidelines.
 *
 * Run: tsx --require ./scripts/load-env.cjs scripts/update-citations.ts
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

const UA = 'NOGLab/1.0 (microbiome research; citation fetch; mailto:medicalcera@gmail.com)'

function log(msg: string) {
  console.log(`[update-citations] ${msg}`)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchCitations(doi: string): Promise<number | null> {
  try {
    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const json: any = await res.json()
    return json?.message?.['is-referenced-by-count'] ?? null
  } catch {
    return null
  }
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  const result = await payload.find({
    collection: 'publications',
    limit: 1000,
    overrideAccess: true,
  })

  const pubs = result.docs
  log(`Found ${pubs.length} publications`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const pub of pubs) {
    const doi = (pub as any).doi as string | null | undefined
    if (!doi) {
      skipped++
      continue
    }

    const citations = await fetchCitations(doi)
    if (citations === null) {
      log(`  FAIL doi:${doi} — not found on CrossRef`)
      failed++
      await sleep(500)
      continue
    }

    await payload.update({
      collection: 'publications',
      id: pub.id,
      data: { citationCount: citations },
      overrideAccess: true,
    })
    log(`  OK   doi:${doi} → ${citations} citations`)
    updated++
    await sleep(1000) // ~1 req/sec polite pool
  }

  log(`\nSummary: ${updated} updated, ${skipped} skipped (no DOI), ${failed} failed`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
