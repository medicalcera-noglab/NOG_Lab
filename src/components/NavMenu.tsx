'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/nav'
import { NavSearch } from './search/NavSearch'

interface NavMenuProps {
  links: NavItem[]
}

// Hydration-safe client flag — false on server, true after hydration.
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function NavMenu({ links }: NavMenuProps) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isDark = isClient && theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  // Focus trap + Escape inside the drawer
  useEffect(() => {
    if (!open) return
    const el = menuRef.current
    if (!el) return

    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    // Delay so the drawer is fully painted before stealing focus
    const focusId = setTimeout(() => first?.focus(), 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusId)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const TOGGLE_CLASS = cn(
    'flex h-[44px] w-[44px] items-center justify-center rounded-lg',
    'text-muted hover:text-fg hover:bg-surface-raised',
    'transition-colors duration-150 focus-visible:outline-none',
    'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
  )

  return (
    <>
      {/* ── FAR RIGHT on desktop: search icon + ONE theme toggle ─────────── */}
      <div className="hidden items-center gap-1 md:flex" aria-label="Site utilities">
        <NavSearch />
        {isClient && (
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={TOGGLE_CLASS}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* ── Mobile hamburger — only control visible on small screens ─────── */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        className={cn(TOGGLE_CLASS, 'md:hidden')}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {/* ── Mobile drawer — portalled to document.body to escape the header's
           backdrop-filter stacking context (which traps position:fixed children) */}
      {open &&
        isClient &&
        createPortal(
          <div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            className="fixed inset-x-0 top-16 bottom-0 z-[200] overflow-y-auto shadow-xl md:hidden"
          >
            {/* Nav links */}
            <nav aria-label="Mobile navigation" className="flex flex-col gap-0.5 p-5 pt-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-xl px-4 py-3.5 text-lg font-medium',
                    'text-fg hover:bg-surface-raised hover:text-primary',
                    'transition-colors duration-150 focus-visible:outline-none',
                    'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider + utilities row */}
            <div
              className="flex items-center gap-2 border-t px-5 py-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-muted flex-1 text-sm">Search</span>
              <NavSearch onNavigate={() => setOpen(false)} />
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={TOGGLE_CLASS}
              >
                {isDark ? (
                  <Sun size={20} aria-hidden="true" />
                ) : (
                  <Moon size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
