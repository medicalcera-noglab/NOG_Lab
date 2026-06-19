import type { MapSite } from '@/app/(payload)/api/map-sites/route'
import { ProjectsMapWrapper } from './ProjectsMapWrapper'
import { EmptyState } from '@/components/placeholders'

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

  // Call our own API route — works in both local dev and production.
  // On the server this is a same-origin request; Next.js deduplicates it.
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

  if (sites.length === 0) {
    const hasFilters = Object.values(searchParams ?? {}).some(Boolean)
    return (
      <EmptyState
        variant={2}
        heading={hasFilters ? 'No study sites match these filters' : 'Map coming soon'}
        body={
          hasFilters
            ? 'No geo-tagged study sites match the active filters. Try clearing them.'
            : 'Study site locations will appear on the map once sites are added to projects.'
        }
        action={hasFilters ? { label: 'Clear all filters', href: '/projects?view=map' } : undefined}
        className="min-h-[400px] justify-center"
      />
    )
  }

  return <ProjectsMapWrapper sites={sites} />
}
