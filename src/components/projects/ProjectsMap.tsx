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

async function fetchSites(filters: Props['searchParams']): Promise<MapSite[]> {
  const params = new URLSearchParams()
  if (filters?.theme) params.set('theme', filters.theme)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.funder) params.set('funder', filters.funder)
  if (filters?.province) params.set('province', filters.province)

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const qs = params.toString()
  const url = `${base}/api/map-sites${qs ? `?${qs}` : ''}`

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = (await res.json()) as { sites?: MapSite[] }
    return data.sites ?? []
  } catch {
    return []
  }
}

export async function ProjectsMap({ searchParams }: Props) {
  const sites = await fetchSites(searchParams)
  // Always render the map — ProjectsMapWrapper handles empty sites gracefully
  // by showing Pakistan's base map centered and a "no sites yet" overlay.
  return <ProjectsMapWrapper sites={sites} />
}
