'use client'

import dynamic from 'next/dynamic'
import type { MapSite } from '@/app/(payload)/api/map-sites/route'

const ProjectsMiniMapClient = dynamic(
  () => import('./ProjectsMiniMapClient').then((m) => m.ProjectsMiniMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface border-border h-56 w-full animate-pulse rounded-lg border" />
    ),
  },
)

interface Props {
  sites: MapSite[]
}

export function ProjectsMiniMap({ sites }: Props) {
  if (sites.length === 0) return null
  return <ProjectsMiniMapClient sites={sites} />
}
