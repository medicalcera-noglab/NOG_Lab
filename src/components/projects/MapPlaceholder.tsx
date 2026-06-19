import { Map } from 'lucide-react'

/**
 * Placeholder for the interactive projects map — to be replaced in Step 9.
 * Renders at the same location as the project card grid and reads the same
 * searchParams (passed from the projects page).
 */
export function MapPlaceholder() {
  return (
    <div
      className="border-border bg-surface flex min-h-[480px] flex-col items-center justify-center rounded-xl border"
      role="region"
      aria-label="Projects map — coming soon"
    >
      <Map size={48} className="text-muted mb-4 opacity-40" aria-hidden="true" />
      <p className="text-muted text-sm font-medium">Interactive map</p>
      <p className="text-muted mt-1 text-xs">Step 9 will render study-site markers here.</p>
    </div>
  )
}
