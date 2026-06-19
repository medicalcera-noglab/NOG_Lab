import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { apiLimiter, checkLimit, getIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export interface MapSite {
  id: number
  name: string
  district: string
  province: string
  lng: number
  lat: number
  project: {
    id: number
    title: string
    slug: string
    status: string
  }
  theme: {
    id: number
    name: string
    color: string
    slug: string
  } | null
}

interface PgPool {
  query: (text: string, values: (string | number)[]) => Promise<{ rows: Record<string, unknown>[] }>
}

export async function GET(req: NextRequest) {
  const { success } = await checkLimit(apiLimiter, `map:${getIp(req)}`)
  if (!success) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  const { searchParams } = req.nextUrl
  const themeFilter = searchParams.get('theme')
  const statusFilter = searchParams.get('status')
  const funderFilter = searchParams.get('funder')
  const provinceFilter = searchParams.get('province')

  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pool = (payload.db as any).pool as PgPool

  const conditions: string[] = ['ss.location IS NOT NULL']
  const params: (string | number)[] = []
  let idx = 1

  if (provinceFilter) {
    conditions.push(`ss.province ILIKE $${idx++}`)
    params.push(`%${provinceFilter}%`)
  }
  if (statusFilter) {
    conditions.push(`p.status = $${idx++}`)
    params.push(statusFilter)
  }
  if (funderFilter) {
    conditions.push(`p.funders::text ILIKE $${idx++}`)
    params.push(`%${funderFilter}%`)
  }
  if (themeFilter) {
    conditions.push(`rt.slug = $${idx++}`)
    params.push(themeFilter)
  }

  const query = `
    SELECT
      ss.id,
      ss.name,
      ss.district,
      ss.province,
      ST_X(ss.location::geometry) AS lng,
      ST_Y(ss.location::geometry) AS lat,
      p.id     AS project_id,
      p.title  AS project_title,
      p.slug   AS project_slug,
      p.status AS project_status,
      rt.id    AS theme_id,
      rt.name  AS theme_name,
      rt.color AS theme_color,
      rt.slug  AS theme_slug
    FROM study_sites ss
    JOIN projects p ON p.id = ss.project_id
    LEFT JOIN research_themes rt ON rt.id = p.theme_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY ss.id
  `

  let rows: Record<string, unknown>[]
  try {
    const result = await pool.query(query, params)
    rows = result.rows
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DB query failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const sites: MapSite[] = rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    district: r.district as string,
    province: r.province as string,
    lng: Number(r.lng),
    lat: Number(r.lat),
    project: {
      id: r.project_id as number,
      title: r.project_title as string,
      slug: r.project_slug as string,
      status: r.project_status as string,
    },
    theme:
      r.theme_id != null
        ? {
            id: r.theme_id as number,
            name: (r.theme_name as string) ?? '',
            color: (r.theme_color as string) ?? '#0E6E6E',
            slug: (r.theme_slug as string) ?? '',
          }
        : null,
  }))

  return NextResponse.json(
    { sites },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  )
}
