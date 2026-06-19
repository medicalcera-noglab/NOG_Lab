import { NextRequest, NextResponse } from 'next/server'
import { getFilteredPublications, getPublicationsByIds } from '@/lib/data/publications'
import { manyBibTeX, manyRIS } from '@/lib/citations'
import type { PublicationFilters } from '@/lib/data/publications'

type Params = { format: string }

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { format } = await params

  if (format !== 'bibtex' && format !== 'ris') {
    return NextResponse.json({ error: 'Format must be bibtex or ris' }, { status: 400 })
  }

  const sp = req.nextUrl.searchParams

  // Per-item export: ?ids=1,2,3
  const idsParam = sp.get('ids')
  let pubs

  if (idsParam) {
    const ids = idsParam
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n))
    pubs = await getPublicationsByIds(ids)
  } else {
    // Filtered list export: same params as the publications page
    const filters: PublicationFilters = {
      year: sp.get('year') ?? undefined,
      type: sp.get('type') ?? undefined,
      themeSlug: sp.get('theme') ?? undefined,
      authorId: sp.get('author') ?? undefined,
    }
    pubs = await getFilteredPublications(filters)
  }

  if (format === 'bibtex') {
    return new NextResponse(manyBibTeX(pubs), {
      headers: {
        'Content-Type': 'application/x-bibtex; charset=utf-8',
        'Content-Disposition': 'attachment; filename="publications.bib"',
        'Cache-Control': 'no-store',
      },
    })
  }

  return new NextResponse(manyRIS(pubs), {
    headers: {
      'Content-Type': 'application/x-research-info-systems; charset=utf-8',
      'Content-Disposition': 'attachment; filename="publications.ris"',
      'Cache-Control': 'no-store',
    },
  })
}
