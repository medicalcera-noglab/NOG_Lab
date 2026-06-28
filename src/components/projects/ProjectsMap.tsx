import { getPayload } from 'payload'
import config from '@payload-config'
import type { MapSite } from '@/app/(payload)/api/map-sites/route'
import { ProjectsMapWrapper } from './ProjectsMapWrapper'

interface Props {
  searchParams?: {
    theme?: string
    status?: string
    funder?: string
    province?: string
  }
}

interface PgPool {
  query: (text: string, values: (string | number)[]) => Promise<{ rows: Record<string, unknown>[] }>
}

async function querySites(filters: Props['searchParams']): Promise<MapSite[]> {
  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pool = (payload.db as any).pool as PgPool

  const conditions: string[] = ['ss.location IS NOT NULL']
  const params: (string | number)[] = []
  let idx = 1

  if (filters?.province) {
    conditions.push(`ss.province ILIKE $${idx++}`)
    params.push(`%${filters.province}%`)
  }
  if (filters?.status) {
    conditions.push(`p.status = $${idx++}`)
    params.push(filters.status)
  }
  if (filters?.funder) {
    conditions.push(`p.funder::text ILIKE $${idx++}`)
    params.push(`%${filters.funder}%`)
  }
  if (filters?.theme) {
    conditions.push(`rt.slug = $${idx++}`)
    params.push(filters.theme)
  }

  const query = `
    SELECT
      ss.id, ss.name, ss.district, ss.province,
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

  try {
    const result = await pool.query(query, params)
    return result.rows.map((r) => ({
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
  } catch {
    return []
  }
}

export async function ProjectsMap({ searchParams }: Props) {
  const sites = await querySites(searchParams)
  return <ProjectsMapWrapper sites={sites} />
}
