'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GroupedResults, SearchResult } from '@/lib/search'

const TYPE_LABELS: Record<string, string> = {
  publication: 'Publications',
  person: 'People',
  project: 'Projects',
  blog: 'Blog',
  news: 'News',
}

function SnippetText({ html }: { html: string }) {
  // ts_headline wraps matches in <mark> from our own DB — safe to render.
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

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
          active ? 'bg-accent text-white' : 'hover:bg-surface-raised text-fg',
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

interface Props {
  /** Pass 'w-full' to render as a full-width mobile search widget */
  className?: string
  onNavigate?: () => void
}

export function NavSearch({ className, onNavigate }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GroupedResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // closeSearch must be declared before the outside-click effect that references it.
  const closeSearch = () => {
    setOpen(false)
    setQuery('')
    setResults(null)
    setActiveIdx(-1)
  }

  // Outside-click handler
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Debounced fetch — all setState calls inside the timeout callback (not synchronously)
  useEffect(() => {
    const delay = query.length >= 2 ? 220 : 0
    const t = setTimeout(async () => {
      if (query.length < 2) {
        setResults(null)
        setActiveIdx(-1)
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=4`)
        if (res.ok) {
          const data = (await res.json()) as { results: GroupedResults }
          setResults(data.results)
        }
      } finally {
        setLoading(false)
        setActiveIdx(-1)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [query])

  const openSearch = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  // Flatten results for arrow-key navigation
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

  const dropdownOpen = open && query.length >= 2

  // Build display groups with cumulative offsets for keyboard nav
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

  const isMobileWidget = className?.includes('w-full')

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      {!open && (
        <button
          type="button"
          onClick={openSearch}
          aria-label="Open search"
          className={cn(
            'flex h-[44px] items-center justify-center rounded-lg',
            'text-muted hover:text-fg hover:bg-surface-raised',
            'transition-colors duration-150 focus-visible:outline-none',
            'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
            isMobileWidget ? 'w-full gap-2 px-3' : 'w-[44px]',
          )}
        >
          <Search size={18} aria-hidden="true" />
          {isMobileWidget && <span className="text-sm">Search…</span>}
        </button>
      )}

      {/* Expanded input */}
      {open && (
        <div className={cn('flex items-center gap-1', isMobileWidget ? 'w-full' : 'w-64')}>
          <div
            className={cn(
              'border-border bg-surface relative flex-1 rounded-lg border',
              'focus-within:ring-ring focus-within:ring-2',
            )}
          >
            <Search
              size={15}
              aria-hidden="true"
              className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-label="Search site"
              aria-expanded={dropdownOpen}
              aria-controls="nav-search-listbox"
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-activedescendant={activeIdx >= 0 ? `nav-result-${activeIdx}` : undefined}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search…"
              autoComplete="off"
              className="text-fg placeholder:text-muted w-full bg-transparent py-2 pr-3 pl-8 text-sm outline-none"
            />
            {loading && (
              <Loader
                size={14}
                aria-hidden="true"
                className="text-muted absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
              />
            )}
          </div>

          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className={cn(
              'flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-lg',
              'text-muted hover:text-fg hover:bg-surface-raised',
              'transition-colors duration-150 focus-visible:outline-none',
              'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
            )}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Results dropdown */}
      {dropdownOpen && (
        <div
          id="nav-search-listbox"
          role="listbox"
          aria-label="Search results"
          className={cn(
            'border-border bg-bg absolute top-full left-0 z-50 mt-1 rounded-xl border shadow-lg',
            'max-h-[70vh] overflow-y-auto',
            isMobileWidget ? 'w-full' : 'w-80',
          )}
        >
          {/* Screen-reader live region */}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {loading
              ? 'Searching…'
              : totalResults > 0
                ? `${totalResults} result${totalResults === 1 ? '' : 's'} for ${query}`
                : `No results for ${query}`}
          </p>

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
                          id={`nav-result-${globalIdx}`}
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
                  See all results for &ldquo;{query}&rdquo; →
                </Link>
              </div>
            </div>
          ) : !loading ? (
            <p className="text-muted px-4 py-6 text-center text-sm">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <p className="text-muted px-4 py-6 text-center text-sm">Searching…</p>
          )}
        </div>
      )}
    </div>
  )
}
