'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Sun, Moon, ExternalLink, BookOpen, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CellBlob } from './motifs/CellBlob'
import { MolecularDots } from './motifs/MolecularDots'
import { NavSearch } from './search/NavSearch'
import type { NavItem } from '@/lib/nav'

export interface MobileMenuProps {
  onClose: () => void
  links: NavItem[]
  isDark: boolean
  onToggleTheme: () => void
  social?: {
    twitter?: string | null
    linkedin?: string | null
    researchgate?: string | null
    github?: string | null
  }
  contactEmail?: string | null
}

// Cubic bezier typed as a tuple so framer-motion's BezierDefinition constraint is met
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const SOCIAL_CHIP = cn(
  'inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5',
  'text-xs text-muted hover:border-accent hover:text-accent',
  'transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)

const UTIL_BTN = cn(
  'flex h-[44px] w-[44px] items-center justify-center rounded-lg',
  'text-muted hover:text-fg hover:bg-surface-raised transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)

export function MobileMenu({
  onClose,
  links,
  isDark,
  onToggleTheme,
  social,
  contactEmail,
}: MobileMenuProps) {
  const reduced = useReducedMotion()
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // ── Variants ────────────────────────────────────────────────────────────────
  // All timing collapses to 0 when prefers-reduced-motion is active.

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: reduced ? 0 : 0.22, ease: EASE },
    },
    exit: {
      opacity: 0,
      transition: { duration: reduced ? 0 : 0.18 },
    },
  }

  // Stagger container: only carries transition metadata — no visual change on the ul.
  const navContainerVariants = {
    hidden: {},
    visible: {
      transition: reduced ? {} : { staggerChildren: 0.055, delayChildren: 0.08 },
    },
    exit: {},
  }

  // Each nav link item.
  const itemVariants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.36, ease: EASE },
    },
    exit: { opacity: 0, transition: { duration: 0 } },
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  // Close on route change (link tap already calls onClose, but covers programmatic nav)
  useEffect(() => {
    if (pathname !== prevPathname.current) onClose()
    prevPathname.current = pathname
  }, [pathname, onClose])

  // Focus close button on mount
  useEffect(() => {
    const id = setTimeout(() => closeButtonRef.current?.focus(), 60)
    return () => clearTimeout(id)
  }, [])

  // Scroll lock + signal to Leaflet maps that nav is open (so they hide via CSS)
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.dataset.navOpen = 'true'
    return () => {
      document.body.style.overflow = prev
      delete document.documentElement.dataset.navOpen
    }
  }, [])

  // Focus trap + Escape
  useEffect(() => {
    const el = menuRef.current
    if (!el) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const hasSocial = social?.twitter || social?.linkedin || social?.researchgate || social?.github

  return (
    <motion.div
      ref={menuRef}
      id="mobile-nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-bg fixed inset-0 z-[9999] flex flex-col overflow-hidden md:hidden"
    >
      {/* ── Decorative microbiome motifs ─────────────────────────────────────── */}
      <CellBlob
        className="pointer-events-none absolute -right-24 -bottom-20 h-80 w-80 opacity-[0.07]"
        color="var(--color-teal)"
      />
      <CellBlob
        className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 opacity-[0.04]"
        color="var(--color-sand)"
      />
      <MolecularDots className="pointer-events-none absolute inset-0 opacity-[0.035]" />

      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
        <span
          className="font-heading text-muted/50 text-[11px] font-semibold tracking-[0.2em] uppercase"
          aria-hidden="true"
        >
          Navigation
        </span>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close navigation menu"
          className={UTIL_BTN}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* ── Nav links — independent scroll so secondary zone stays anchored ─── */}
      <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-5 pt-2 pb-2 sm:px-8">
        <motion.ul
          role="list"
          variants={navContainerVariants}
          // Variant strings propagated from the parent motion.div above
          className="flex flex-col"
        >
          {links.map((link, i) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)

            return (
              <motion.li key={link.href} variants={itemVariants}>
                <Link
                  href={link.href}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={onClose}
                  className={cn(
                    'flex min-h-[52px] items-center gap-4 rounded-lg py-2.5',
                    'border-border/40 border-b last:border-0',
                    'transition-colors duration-150',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    isActive ? 'text-primary' : 'text-fg hover:text-primary',
                  )}
                >
                  {/* Index number — decorative, hidden from SR */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'w-5 shrink-0 font-mono text-[10px] leading-none tabular-nums',
                      isActive ? 'text-primary/60' : 'text-muted/40',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Label */}
                  <span className="font-heading flex-1 text-[2rem] leading-none font-bold sm:text-4xl">
                    {link.label}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span aria-hidden="true" className="bg-primary h-2 w-2 shrink-0 rounded-full" />
                  )}
                </Link>
              </motion.li>
            )
          })}
        </motion.ul>
      </nav>

      {/* ── Secondary zone — pinned at bottom, within thumb reach ────────────── */}
      <div className="border-border shrink-0 border-t px-5 pt-4 pb-8 sm:px-8">
        {/* Row 1: search + theme toggle */}
        <div className="flex items-center gap-2">
          <NavSearch onNavigate={onClose} />
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={UTIL_BTN}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <span className="text-muted ml-1 text-sm" aria-hidden="true">
            Search &amp; theme
          </span>
        </div>

        {/* Row 2: primary CTA — coral */}
        <Link
          href="/join"
          onClick={onClose}
          className={cn(
            'mt-3 flex min-h-[44px] items-center justify-center rounded-xl px-5 py-2.5',
            'bg-accent text-sm font-semibold text-white',
            'hover:bg-accent-hover transition-colors duration-150',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          )}
        >
          Join the Lab →
        </Link>

        {/* Row 3: social chips + contact email */}
        {(hasSocial || contactEmail) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {social?.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X (opens in new tab)"
                className={SOCIAL_CHIP}
              >
                <ExternalLink size={10} aria-hidden="true" />X
              </a>
            )}
            {social?.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn (opens in new tab)"
                className={SOCIAL_CHIP}
              >
                <ExternalLink size={10} aria-hidden="true" />
                LinkedIn
              </a>
            )}
            {social?.researchgate && (
              <a
                href={social.researchgate}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ResearchGate (opens in new tab)"
                className={SOCIAL_CHIP}
              >
                <BookOpen size={10} aria-hidden="true" />
                RG
              </a>
            )}
            {social?.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub (opens in new tab)"
                className={SOCIAL_CHIP}
              >
                <ExternalLink size={10} aria-hidden="true" />
                GitHub
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                aria-label={`Email ${contactEmail}`}
                className={SOCIAL_CHIP}
              >
                <Mail size={10} aria-hidden="true" />
                {contactEmail}
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
