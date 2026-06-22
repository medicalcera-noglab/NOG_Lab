'use client'

import { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterSheetProps {
  /** Number of currently active filters — shown as a badge on the trigger. */
  activeCount?: number
  children: React.ReactNode
  className?: string
}

/**
 * On mobile: renders a pill trigger button. Tapping it opens a bottom-sheet
 * overlay with the filter content. On md+: renders nothing (desktop layout
 * shows the filters in its own sidebar column).
 */
export function FilterSheet({ activeCount = 0, children, className }: FilterSheetProps) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus close button when sheet opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => closeRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={className}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'border-border inline-flex items-center gap-2 rounded-lg border px-4 py-2.5',
          'text-fg text-sm font-medium transition-colors duration-150',
          'hover:bg-surface-raised',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="bg-primary flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Bottom-sheet overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter options"
          className="fixed inset-0 z-[9990]"
        >
          {/* Scrim */}
          <div
            className="bg-fg/40 absolute inset-0"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet panel — slides up from bottom */}
          <div className="bg-bg absolute right-0 bottom-0 left-0 max-h-[80vh] overflow-y-auto rounded-t-2xl shadow-2xl">
            {/* Sheet header */}
            <div className="border-border bg-bg sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4">
              <p className="text-sm font-semibold">
                Filters{activeCount > 0 ? ` · ${activeCount} active` : ''}
              </p>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'text-muted hover:text-fg hover:bg-surface-raised transition-colors duration-150',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                )}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Filter content */}
            <div className="px-5 py-4 pb-8">{children}</div>
          </div>
        </div>
      )}
    </div>
  )
}
