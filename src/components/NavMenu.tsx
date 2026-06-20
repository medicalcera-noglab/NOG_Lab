'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/nav'
import { NavSearch } from './search/NavSearch'
import { LocaleSwitcher } from './LocaleSwitcher'

interface NavMenuProps {
  links: NavItem[]
}

// Hydration-safe client detection — returns false on server, true on client.
// useSyncExternalStore avoids the react-hooks/set-state-in-effect lint rule.
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
  const t = useTranslations('nav')
  const tTheme = useTranslations('theme')

  // Focus trap + Escape handler
  useEffect(() => {
    if (!open) return

    const el = menuRef.current
    if (!el) return

    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

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
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Prevent body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const isDark = theme === 'dark'

  return (
    <>
      {/* ── Desktop right-side controls ──────────────────────────────── */}
      <div className="hidden items-center gap-1 md:flex">
        <NavSearch />

        {/* Theme toggle */}
        {isClient && (
          <button
            onClick={toggleTheme}
            aria-label={isDark ? tTheme('switchToLight') : tTheme('switchToDark')}
            className={cn(
              'flex h-[44px] w-[44px] items-center justify-center rounded-lg',
              'text-muted hover:text-fg hover:bg-surface-raised',
              'transition-colors duration-150 focus-visible:outline-none',
              'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
            )}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* ── Mobile hamburger ─────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t('closeMenu') : t('openMenu')}
        className={cn(
          'flex h-[44px] w-[44px] items-center justify-center rounded-lg md:hidden',
          'text-muted hover:text-fg hover:bg-surface-raised',
          'transition-colors duration-150 focus-visible:outline-none',
          'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
        )}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {/* ── Mobile menu drawer ───────────────────────────────────────── */}
      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('mobileMenuLabel')}
          className="bg-bg fixed inset-0 top-[64px] z-40 md:hidden"
        >
          <nav aria-label={t('mobileNavLabel')} className="flex flex-col gap-1 p-6 pt-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-4 py-3 text-lg font-medium',
                  'text-fg hover:bg-surface-raised hover:text-primary',
                  'transition-colors duration-150 focus-visible:outline-none',
                  'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
                )}
              >
                {link.label}
              </Link>
            ))}

            <hr className="border-border my-4" />

            <div className="flex items-center gap-3 px-4">
              <NavSearch className="w-full" onNavigate={() => setOpen(false)} />

              {isClient && (
                <button
                  onClick={toggleTheme}
                  aria-label={isDark ? tTheme('switchToLight') : tTheme('switchToDark')}
                  className={cn(
                    'flex h-[44px] w-[44px] items-center justify-center rounded-lg',
                    'text-muted hover:text-fg hover:bg-surface-raised',
                    'transition-colors duration-150 focus-visible:outline-none',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
                  )}
                >
                  {isDark ? (
                    <Sun size={20} aria-hidden="true" />
                  ) : (
                    <Moon size={20} aria-hidden="true" />
                  )}
                </button>
              )}
            </div>

            <div className="mt-2 px-4">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
