'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GroupedResults, SearchResult } from '@/lib/search'

// ── Snippet renderer ─────────────────────────────────────────────────────────
// ts_headline wraps matches in <mark> from our own DB — safe to render.
function SnippetText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// ── Single result row ─────────────────────────────────────────────────────────
function ResultItem({
  result,
  active,
  id,
  onSelect,
}: {
  result: SearchResult
  active: boolean
  id: string
  onSelect: () => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <li role="option" aria-selected={active} id={id}>
      <Link
        ref={ref}
        href={result.url}
        onClick={onSelect}
        className={cn(
          'block rounded-lg px-3 py-2 text-sm transition-colors',
          active ? 'bg-accent text-white' : 'text-fg hover:bg-surface-raised',
        )}
      >
        <span className={cn('block truncate font-medium', active ? 'text-white' : 'text-fg')}>
          {result.title}
        </span>
        {result.snippet && result.snippet !== result.title && (
          <span
            className={cn(
              'mt-0.5 line-clamp-1 block text-xs',
              active ? 'text-white/80' : 'text-muted',
              '[&_mark]:rounded-sm [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:text-yellow-900',
            )}
          >
            <SnippetText html={result.snippet} />
          </span>
        )}
      </Link>
    </li>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  className?: string
  onNavigate?: () => void
}

// Hydration-safe: returns false on server, true after hydration.
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

const TYPE_LABELS: Record<string, string> = {
  publication: 'Publications',
  person: 'People',
  project: 'Projects',
  blog: 'Blog',
  news: 'News',
}

// ── NavSearch — icon trigger that opens a full-viewport modal overlay ─────────
export function NavSearch({ className, onNavigate }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GroupedResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  // Portal can only render client-side — useSyncExternalStore gives us
  // server=false / client=true without a setState-in-effect pattern.
  const isClient = useIsClient()

  const inputRef = useRef<HTMLInputElement>(null)

  const closeSearch = () => {
    setOpen(false)
    setQuery('')
    setResults(null)
    setActiveIdx(-1)
  }

  // Focus the input every time the overlay opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(id)
    }
  }, [open])

  // Global Escape handler when overlay is open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Debounced search fetch
  useEffect(() => {
    const delay = query.length >= 2 ? 220 : 0
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults(null)
        setActiveIdx(-1)
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        if (res.ok) {
          const data = (await res.json()) as { results: GroupedResults }
          setResults(data.results)
        }
      } finally {
        setLoading(false)
        setActiveIdx(-1)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [query])

  // Flatten for arrow-key navigation
  const flat: SearchResult[] = results
    ? [
        ...results.publications,
        ...results.people,
        ...results.projects,
        ...results.blog,
        ...results.news,
      ]
    : []
  const totalResults = flat.length

  // Build display groups with cumulative offsets
  const groups: Array<{ label: string; items: SearchResult[]; offset: number }> = []
  if (results) {
    let offset = 0
    const sections: Array<[string, SearchResult[]]> = [
      ['publication', results.publications],
      ['person', results.people],
      ['project', results.projects],
      ['blog', results.blog],
      ['news', results.news],
    ]
    for (const [type, items] of sections) {
      if (items.length > 0) {
        groups.push({ label: TYPE_LABELS[type] ?? type, items, offset })
        offset += items.length
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, totalResults - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
      return
    }
    if (e.key === 'Enter') {
      const target = activeIdx >= 0 ? flat[activeIdx]?.url : null
      const dest = target ?? (query.length >= 2 ? `/search?q=${encodeURIComponent(query)}` : null)
      if (dest) {
        router.push(dest)
        closeSearch()
        onNavigate?.()
      }
    }
  }

  const hasQuery = query.length >= 2

  // ── Modal portal ───────────────────────────────────────────────────────────
  const modal =
    open && isClient
      ? createPortal(
          <div
            // Outer layer: full-viewport backdrop
            className="fixed inset-0 z-[300] flex items-start justify-center px-4 pt-[12vh] pb-8"
            aria-label="Search overlay"
            role="presentation"
          >
            {/* Dimmed backdrop — click to close */}
            <div
              aria-hidden="true"
              className="bg-ink/50 absolute inset-0 backdrop-blur-sm"
              onClick={closeSearch}
            />

            {/* Search card */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Site search"
              className={cn(
                'relative z-10 w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl',
                'border-border bg-bg border',
              )}
            >
              {/* Input row */}
              <div className="border-border flex items-center gap-3 border-b px-4 py-3.5">
                <Search size={18} className="text-muted flex-shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  role="combobox"
                  aria-label="Search site"
                  aria-expanded={hasQuery}
                  aria-controls="search-overlay-listbox"
                  aria-haspopup="listbox"
                  aria-autocomplete="list"
                  aria-activedescendant={activeIdx >= 0 ? `search-result-${activeIdx}` : undefined}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search publications, people, projects…"
                  autoComplete="off"
                  className="text-fg placeholder:text-muted min-w-0 flex-1 bg-transparent text-base outline-none"
                />
                {loading && (
                  <Loader
                    size={16}
                    className="text-muted flex-shrink-0 animate-spin"
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className={cn(
                    'text-muted hover:text-fg hover:bg-surface-raised flex-shrink-0 rounded-md p-1.5',
                    'transition-colors duration-150 focus-visible:outline-none',
                    'focus-visible:ring-ring focus-visible:ring-2',
                  )}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Live region for screen readers */}
              <p aria-live="polite" aria-atomic="true" className="sr-only">
                {loading
                  ? 'Searching…'
                  : hasQuery && totalResults > 0
                    ? `${totalResults} result${totalResults === 1 ? '' : 's'} for ${query}`
                    : hasQuery
                      ? `No results for ${query}`
                      : ''}
              </p>

              {/* Results */}
              {hasQuery ? (
                <div
                  id="search-overlay-listbox"
                  role="listbox"
                  aria-label="Search results"
                  className="max-h-[min(60vh,440px)] overflow-y-auto"
                >
                  {totalResults > 0 ? (
                    <div className="p-2">
                      {groups.map((group) => (
                        <div key={group.label} className="mb-2 last:mb-0">
                          <p className="text-muted mb-1 px-3 text-xs font-semibold tracking-wide uppercase">
                            {group.label}
                          </p>
                          <ul>
                            {group.items.map((item, i) => {
                              const globalIdx = group.offset + i
                              return (
                                <ResultItem
                                  key={`${item.type}-${item.id}`}
                                  result={item}
                                  active={activeIdx === globalIdx}
                                  id={`search-result-${globalIdx}`}
                                  onSelect={() => {
                                    closeSearch()
                                    onNavigate?.()
                                  }}
                                />
                              )
                            })}
                          </ul>
                        </div>
                      ))}
                      <div className="border-border mt-2 border-t pt-2">
                        <Link
                          href={`/search?q=${encodeURIComponent(query)}`}
                          onClick={() => {
                            closeSearch()
                            onNavigate?.()
                          }}
                          className={cn(
                            'text-accent block rounded-lg px-3 py-2 text-sm font-medium',
                            'hover:bg-surface-raised transition-colors duration-150',
                            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                          )}
                        >
                          See all results for &ldquo;{query}&rdquo;
                        </Link>
                      </div>
                    </div>
                  ) : !loading ? (
                    <p className="text-muted px-4 py-8 text-center text-sm">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    <p className="text-muted px-4 py-8 text-center text-sm">Searching…</p>
                  )}
                </div>
              ) : (
                <p className="text-muted px-4 py-5 text-center text-sm">
                  Type to search publications, people, projects, and blog posts.
                </p>
              )}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      {/* Icon-only trigger — constant 44×44 tap target, never expands inline */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex h-[44px] w-[44px] items-center justify-center rounded-lg',
          'text-muted hover:text-fg hover:bg-surface-raised',
          'transition-colors duration-150 focus-visible:outline-none',
          'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
          className,
        )}
      >
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search</span>
      </button>

      {modal}
    </>
  )
}
