'use client'

import { useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/nav'
import { NavSearch } from './search/NavSearch'
import { MobileMenu } from './MobileMenu'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface NavMenuProps {
  links: NavItem[]
  social?: {
    twitter?: string | null
    linkedin?: string | null
    researchgate?: string | null
    github?: string | null
  }
  contactEmail?: string | null
}

// Hydration-safe: returns false on server, true after hydration.
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

// ── Morphing hamburger ↔ X icon ───────────────────────────────────────────────
// Three bars animate: top/bottom rotate ±45° toward center, middle fades out.
function HamburgerIcon({ open }: { open: boolean }) {
  const reduced = useReducedMotion()
  const t = { duration: reduced ? 0 : 0.3, ease: EASE }

  return (
    // Container: 20×14 px, bars absolutely positioned for precise X morph math
    <span
      className="relative block h-[14px] w-5 shrink-0"
      aria-hidden="true"
      style={{ willChange: 'transform' }}
    >
      {/* Top bar — translates to center and rotates 45° */}
      <motion.span
        className="absolute inset-x-0 top-0 h-[1.5px] origin-center rounded-full bg-current"
        animate={{ y: open ? 6.25 : 0, rotate: open ? 45 : 0 }}
        transition={t}
      />
      {/* Middle bar — fades and scales out */}
      <motion.span
        className="absolute inset-x-0 h-[1.5px] origin-center rounded-full bg-current"
        style={{ top: '50%', marginTop: '-0.75px' }}
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
        transition={t}
      />
      {/* Bottom bar — translates to center and rotates –45° */}
      <motion.span
        className="absolute inset-x-0 bottom-0 h-[1.5px] origin-center rounded-full bg-current"
        animate={{ y: open ? -6.25 : 0, rotate: open ? -45 : 0 }}
        transition={t}
      />
    </span>
  )
}

const UTIL_BTN = cn(
  'flex h-[44px] w-[44px] items-center justify-center rounded-lg',
  'text-muted hover:text-fg hover:bg-surface-raised',
  'transition-colors duration-150 focus-visible:outline-none',
  'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
)

export function NavMenu({ links, social, contactEmail }: NavMenuProps) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()

  const isDark = isClient && theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <>
      {/* ── Desktop utilities: search + theme toggle ─────────────────────────── */}
      <div className="hidden items-center gap-1 md:flex" aria-label="Site utilities">
        <NavSearch />
        {isClient && (
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={UTIL_BTN}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* ── Mobile trigger — hamburger morphs to X ───────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-overlay"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-haspopup="dialog"
        className={cn(UTIL_BTN, 'md:hidden')}
      >
        <HamburgerIcon open={isClient ? open : false} />
      </button>

      {/* ── Full-screen overlay — portalled to escape navbar stacking context ── */}
      {isClient &&
        createPortal(
          <AnimatePresence>
            {open && (
              <MobileMenu
                key="mobile-nav"
                onClose={() => setOpen(false)}
                links={links}
                isDark={isDark}
                onToggleTheme={toggleTheme}
                social={social}
                contactEmail={contactEmail}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
