import { type NextRequest, NextResponse } from 'next/server'
import { getSearchProvider } from '@/lib/search'

// Never cache — results must reflect current DB state and published-only content.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limitParam = req.nextUrl.searchParams.get('limit')
  const limitPerGroup = Math.min(Math.max(parseInt(limitParam ?? '5', 10), 1), 20)

  if (q.length < 2) {
    return NextResponse.json({
      query: q,
      results: { publications: [], people: [], projects: [], blog: [], news: [] },
      total: 0,
    })
  }

  try {
    const provider = getSearchProvider()
    const results = await provider.search(q, { limitPerGroup })
    return NextResponse.json({ query: q, results, total: results.total })
  } catch {
    return NextResponse.json({ error: 'Search unavailable' }, { status: 503 })
  }
}
