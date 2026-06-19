'use client'

import dynamic from 'next/dynamic'
import type { MapSite } from '@/app/(payload)/api/map-sites/route'

const ProjectsMapClient = dynamic(
  () => import('./ProjectsMapClient').then((m) => m.ProjectsMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface border-border flex h-[520px] w-full animate-pulse items-center justify-center rounded-xl border">
        <p className="text-muted text-sm">Loading map…</p>
      </div>
    ),
  },
)

export function ProjectsMapWrapper({ sites }: { sites: MapSite[] }) {
  return <ProjectsMapClient sites={sites} />
}
