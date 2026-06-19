/**
 * GET /api/cron/citations
 *
 * Updates citationCount on every publication that has a DOI.
 * Protected by the CRON_SECRET env var (passed as the x-cron-secret header).
 *
 * Run manually:
 *   curl -X GET https://yoursite.com/api/cron/citations \
 *        -H "x-cron-secret: <CRON_SECRET>"
 *
 * Production schedule is wired in Step 14 (GitHub Actions / Vercel cron).
 * The citation source is Crossref's is-referenced-by-count field.
 * To swap in Semantic Scholar: implement a CitationSource that calls
 * https://api.semanticscholar.org/graph/v1/paper/DOI:<doi>?fields=citationCount
 * and replace `fetchCrossrefCitationCount` below.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAllPublicationsWithDoi } from '@/lib/data/publications'

// ── Pluggable citation source ──────────────────────────────────────────────

const CROSSREF_BASE = 'https://api.crossref.org/works/'

async function fetchCrossrefCitationCount(doi: string, userAgent: string): Promise<number | null> {
  const url = `${CROSSREF_BASE}${encodeURIComponent(doi)}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      // No cache: always fetch fresh counts
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { message?: { 'is-referenced-by-count'?: number } }
    return data.message?.['is-referenced-by-count'] ?? null
  } catch {
    return null
  }
}

// ── Throttle helper ───────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // ── Secret check ────────────────────────────────────────────────────────────
  const secret = req.headers.get('x-cron-secret')
  const expected = process.env.CRON_SECRET
  if (!expected || !secret || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contact = process.env.CROSSREF_CONTACT ?? ''
  const userAgent = `NOGLabSite/1.0 (mailto:${contact}; citation-cron)`

  const payload = await getPayload({ config })
  const pubs = await getAllPublicationsWithDoi()

  let updated = 0
  let unchanged = 0
  let failed = 0

  for (const pub of pubs) {
    if (!pub.doi) continue

    // Polite throttle: 500 ms between requests to stay in Crossref's polite pool.
    await sleep(500)

    const count = await fetchCrossrefCitationCount(pub.doi, userAgent)

    if (count === null) {
      failed++
      continue
    }

    if (count === (pub.citationCount ?? 0)) {
      unchanged++
      continue
    }

    await payload.update({
      collection: 'publications',
      id: pub.id,
      data: { citationCount: count },
      overrideAccess: true,
    })
    updated++
  }

  const summary = {
    total: pubs.length,
    updated,
    unchanged,
    failed,
    ranAt: new Date().toISOString(),
  }

  // Log to server console for observability.
  console.info('[cron/citations]', summary)

  return NextResponse.json({ ok: true, ...summary })
}
