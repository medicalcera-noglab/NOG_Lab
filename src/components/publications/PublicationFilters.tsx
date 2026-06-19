import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PublicationFilterOptions, PublicationFilters } from '@/lib/data/publications'
import type { Publication } from '../../../payload-types'

interface ActiveFilters extends PublicationFilters {
  view?: string
}

interface PublicationFiltersProps {
  options: PublicationFilterOptions
  active: ActiveFilters
}

const TYPE_LABELS: Record<Publication['type'], string> = {
  journal_article: 'Journal article',
  conference: 'Conference paper',
  preprint: 'Preprint',
  book_chapter: 'Book chapter',
}

/** Build a URL that toggles one filter param while preserving the others. */
function filterHref(current: ActiveFilters, key: keyof ActiveFilters, value: string): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(current)) {
    if (v && k !== key) params.set(k, v)
  }
  // Toggle: if already active, omit (clear it); otherwise set it
  if (current[key] !== value) params.set(key, value)
  const qs = params.toString()
  return `/publications${qs ? `?${qs}` : ''}`
}

const PILL =
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-150 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
const PILL_INACTIVE = 'border-border text-muted hover:text-fg hover:border-fg/30 bg-bg'
const PILL_ACTIVE = 'border-accent bg-accent/10 text-accent'

export function PublicationFilters({ options, active }: PublicationFiltersProps) {
  const hasFilters = Boolean(active.year || active.type || active.themeSlug || active.authorId)

  return (
    <aside aria-label="Filter publications">
      {/* Year */}
      {options.years.length > 0 && (
        <div className="mb-5">
          <p className="text-muted mb-2 text-[11px] font-semibold tracking-wide uppercase">Year</p>
          <ul role="list" className="flex flex-wrap gap-1.5">
            {options.years.map((year) => {
              const isActive = active.year === String(year)
              return (
                <li key={year}>
                  <Link
                    href={filterHref(active, 'year', String(year))}
                    aria-pressed={isActive}
                    className={cn(PILL, isActive ? PILL_ACTIVE : PILL_INACTIVE)}
                  >
                    {year}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Type */}
      {options.types.length > 0 && (
        <div className="mb-5">
          <p className="text-muted mb-2 text-[11px] font-semibold tracking-wide uppercase">Type</p>
          <ul role="list" className="flex flex-wrap gap-1.5">
            {options.types.map((type) => {
              const isActive = active.type === type
              return (
                <li key={type}>
                  <Link
                    href={filterHref(active, 'type', type)}
                    aria-pressed={isActive}
                    className={cn(PILL, isActive ? PILL_ACTIVE : PILL_INACTIVE)}
                  >
                    {TYPE_LABELS[type]}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Research Theme */}
      {options.themes.length > 0 && (
        <div className="mb-5">
          <p className="text-muted mb-2 text-[11px] font-semibold tracking-wide uppercase">Theme</p>
          <ul role="list" className="flex flex-wrap gap-1.5">
            {options.themes.map((theme) => {
              const slug = theme.slug ?? String(theme.id)
              const isActive = active.themeSlug === slug
              return (
                <li key={theme.id}>
                  <Link
                    href={filterHref(active, 'themeSlug', slug)}
                    aria-pressed={isActive}
                    className={cn(PILL, isActive ? PILL_ACTIVE : PILL_INACTIVE)}
                  >
                    {theme.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Lab member author */}
      {options.authors.length > 0 && (
        <div className="mb-5">
          <p className="text-muted mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Author
          </p>
          <ul role="list" className="flex flex-wrap gap-1.5">
            {options.authors.map((author) => {
              const isActive = active.authorId === String(author.id)
              return (
                <li key={author.id}>
                  <Link
                    href={filterHref(active, 'authorId', String(author.id))}
                    aria-pressed={isActive}
                    className={cn(PILL, isActive ? PILL_ACTIVE : PILL_INACTIVE)}
                  >
                    {author.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Clear all */}
      {hasFilters && (
        <Link
          href="/publications"
          className={cn(
            'text-muted hover:text-fg mt-1 inline-block text-xs underline',
            'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
          )}
        >
          Clear all filters
        </Link>
      )}
    </aside>
  )
}
