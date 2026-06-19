import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// ── SSRF guard ────────────────────────────────────────────────────────────────
// This endpoint ONLY ever calls this base URL — never a user-supplied host.
const CROSSREF_BASE = 'https://api.crossref.org/works/'

// Valid DOI: starts with "10.", 4+ digits, slash, non-empty suffix.
const DOI_RE = /^10\.\d{4,}\/.+$/

/** Extract a bare DOI from a user input string (accepts doi.org URLs). */
function parseDoi(raw: string): string | null {
  const s = raw.trim()
  let bare = s
  if (bare.startsWith('https://doi.org/')) bare = bare.slice(16)
  else if (bare.startsWith('http://doi.org/')) bare = bare.slice(15)
  else if (bare.startsWith('doi.org/')) bare = bare.slice(8)
  return DOI_RE.test(bare) ? bare : null
}

/** Strip JATS XML / HTML markup from Crossref abstract strings. */
function stripMarkup(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Map a Crossref work type string to our Publication type enum. */
function mapType(
  crossrefType: string,
): 'journal_article' | 'conference' | 'preprint' | 'book_chapter' {
  if (crossrefType.includes('proceedings-article') || crossrefType.includes('conference'))
    return 'conference'
  if (crossrefType === 'posted-content') return 'preprint'
  if (crossrefType === 'book-chapter') return 'book_chapter'
  return 'journal_article'
}

export async function POST(req: NextRequest) {
  // ── Auth: admin or editor only ─────────────────────────────────────────────
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = (user as { role?: string } | null)?.role
  if (role !== 'super_admin' && role !== 'editor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse request body ─────────────────────────────────────────────────────
  let body: { doi?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.doi !== 'string' || !body.doi) {
    return NextResponse.json({ error: 'Missing doi field' }, { status: 400 })
  }

  const doi = parseDoi(body.doi)
  if (!doi) {
    return NextResponse.json(
      {
        error: 'Invalid DOI. Expected format: 10.xxxx/suffix  or  https://doi.org/10.xxxx/suffix',
      },
      { status: 400 },
    )
  }

  // ── Call Crossref (SSRF-safe: URL is built from validated DOI only) ────────
  const contact = process.env.CROSSREF_CONTACT ?? ''
  const userAgent = `NOGLabSite/1.0 (mailto:${contact}; polite-pool)`
  const crossrefUrl = `${CROSSREF_BASE}${encodeURIComponent(doi)}`

  let crossrefData: Record<string, unknown>
  try {
    const res = await fetch(crossrefUrl, {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      // Cache Crossref responses in the fetch cache for 1 hour.
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: `DOI not found in Crossref: ${doi}` }, { status: 404 })
      }
      return NextResponse.json({ error: `Crossref returned status ${res.status}` }, { status: 502 })
    }
    crossrefData = (await res.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Network error reaching Crossref' }, { status: 502 })
  }

  // ── Map Crossref → our field structure ────────────────────────────────────
  const msg = crossrefData.message as Record<string, unknown>

  const title = (msg.title as string[] | undefined)?.[0]?.trim() ?? ''
  const journal = (msg['container-title'] as string[] | undefined)?.[0]?.trim() ?? ''
  const type = mapType((msg.type as string | undefined) ?? '')

  const crossrefAuthors = (msg.author as { given?: string; family?: string }[] | undefined) ?? []
  const authors = crossrefAuthors
    .map((a) => `${a.given ?? ''} ${a.family ?? ''}`.trim())
    .filter(Boolean)
    .map((name) => ({ author: name }))

  const dateParts = (msg.published as { 'date-parts'?: number[][] } | undefined)?.[
    'date-parts'
  ]?.[0]
  const year = dateParts?.[0] ?? new Date().getFullYear()

  const rawAbstract = (msg.abstract as string | undefined) ?? ''
  const abstractText = rawAbstract ? stripMarkup(rawAbstract) : ''

  return NextResponse.json({
    ok: true,
    fields: {
      title,
      journal,
      type,
      year,
      authors,
      crossrefRaw: crossrefData,
    },
    // Plain-text abstract preview — admin enters this manually in the richText field.
    abstractPreview: abstractText || null,
  })
}
