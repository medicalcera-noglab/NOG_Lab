import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ResearchTheme } from '../../../payload-types'

interface ActiveFilters {
  theme?: string
  status?: string
  funder?: string
  province?: string
  view?: string
}

interface ProjectFiltersProps {
  themes: ResearchTheme[]
  funders: string[]
  provinces: string[]
  active: ActiveFilters
}

/** Build a new href preserving all current filters except the toggled one. */
function filterHref(
  current: ActiveFilters,
  key: keyof Omit<ActiveFilters, 'view'>,
  value: string,
): string {
  const p = new URLSearchParams()
  const next: ActiveFilters = { ...current }

  if (next[key] === value) {
    delete next[key] // toggle off
  } else {
    next[key] = value
  }

  if (next.theme) p.set('theme', next.theme)
  if (next.status) p.set('status', next.status)
  if (next.funder) p.set('funder', next.funder)
  if (next.province) p.set('province', next.province)
  if (next.view && next.view !== 'list') p.set('view', next.view)

  const qs = p.toString()
  return qs ? `/projects?${qs}` : '/projects'
}

/** href that clears all filters (preserves view). */
function clearHref(current: ActiveFilters): string {
  if (!current.view || current.view === 'list') return '/projects'
  return `/projects?view=${current.view}`
}

const hasActiveFilter = (f: ActiveFilters) => Boolean(f.theme || f.status || f.funder || f.province)

export function ProjectFilters({ themes, funders, provinces, active }: ProjectFiltersProps) {
  return (
    <aside aria-label="Project filters" className="flex flex-col gap-6">
      {/* Clear all */}
      {hasActiveFilter(active) && (
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs font-semibold tracking-wide uppercase">
            Filters active
          </span>
          <Link
            href={clearHref(active)}
            className={cn(
              'text-muted hover:text-fg inline-flex items-center gap-1 text-xs',
              'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            <X size={12} aria-hidden="true" />
            Clear all
          </Link>
        </div>
      )}

      {/* Status */}
      <FilterGroup label="Status">
        {(['ongoing', 'completed'] as const).map((s) => (
          <FilterPill
            key={s}
            href={filterHref(active, 'status', s)}
            isActive={active.status === s}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
          />
        ))}
      </FilterGroup>

      {/* Theme */}
      {themes.length > 0 && (
        <FilterGroup label="Theme">
          {themes.map((t) => (
            <FilterPill
              key={t.id}
              href={filterHref(active, 'theme', t.slug ?? String(t.id))}
              isActive={active.theme === (t.slug ?? String(t.id))}
              label={t.name}
              accentColor={t.color}
            />
          ))}
        </FilterGroup>
      )}

      {/* Funder */}
      {funders.length > 0 && (
        <FilterGroup label="Funder">
          {funders.map((f) => (
            <FilterPill
              key={f}
              href={filterHref(active, 'funder', f)}
              isActive={active.funder === f}
              label={f}
            />
          ))}
        </FilterGroup>
      )}

      {/* Province */}
      {provinces.length > 0 && (
        <FilterGroup label="Province / Region">
          {provinces.map((p) => (
            <FilterPill
              key={p}
              href={filterHref(active, 'province', p)}
              isActive={active.province === p}
              label={p}
            />
          ))}
        </FilterGroup>
      )}
    </aside>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function FilterPill({
  href,
  isActive,
  label,
  accentColor,
}: {
  href: string
  isActive: boolean
  label: string
  accentColor?: string
}) {
  return (
    <Link
      href={href}
      aria-pressed={isActive}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        'transition-colors duration-150',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        isActive
          ? 'border-transparent text-white'
          : 'border-border text-muted hover:text-fg hover:border-primary',
      )}
      style={
        isActive && accentColor
          ? { backgroundColor: accentColor, borderColor: accentColor }
          : isActive
            ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }
            : undefined
      }
    >
      {label}
    </Link>
  )
}
