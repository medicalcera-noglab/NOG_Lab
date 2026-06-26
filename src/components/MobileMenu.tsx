'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Sun, Moon, ExternalLink, BookOpen, Mail, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
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

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]
const EASE_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]

const SOCIAL_CHIP = cn(
  'inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5',
  'text-xs text-muted hover:border-accent hover:text-accent',
  'transition-colors duration-150',
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

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reduced ? 0 : 0.2 } },
    exit: { opacity: 0, transition: { duration: reduced ? 0 : 0.18 } },
  }

  const panelVariants = {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.38, ease: EASE },
    },
    exit: {
      x: '100%',
      transition: reduced ? { duration: 0 } : { duration: 0.28, ease: EASE_OUT },
    },
  }

  const navContainerVariants = {
    hidden: {},
    visible: { transition: reduced ? {} : { staggerChildren: 0.045, delayChildren: 0.12 } },
    exit: {},
  }

  const itemVariants = {
    hidden: reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.3, ease: EASE },
    },
    exit: { opacity: 0, transition: { duration: 0 } },
  }

  useEffect(() => {
    if (pathname !== prevPathname.current) onClose()
    prevPathname.current = pathname
  }, [pathname, onClose])

  // Focus close button — only on desktop (pointer devices) to avoid visible
  // focus ring on first paint on mobile touchscreens
  useEffect(() => {
    const id = setTimeout(() => {
      if (window.matchMedia('(pointer: fine)').matches) {
        closeButtonRef.current?.focus()
      }
    }, 60)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.dataset.navOpen = 'true'
    return () => {
      document.body.style.overflow = prev
      delete document.documentElement.dataset.navOpen
    }
  }, [])

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
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 z-[9998] bg-black/50 md:hidden"
      />

      {/* ── Slide panel ───────────────────────────────────────────────────────── */}
      <motion.div
        ref={menuRef}
        id="mobile-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-bg fixed top-0 right-0 bottom-0 z-[9999] flex w-[85vw] max-w-[340px] flex-col shadow-2xl md:hidden"
      >
        {/* Subtle top accent bar */}
        <div className="bg-primary h-[3px] w-full shrink-0" />

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex h-14 shrink-0 items-center justify-between px-5">
          <span className="font-heading text-primary text-sm font-bold tracking-wide">NOG Lab</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              'text-muted hover:text-fg hover:bg-surface-raised',
              'transition-colors duration-150',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────────── */}
        <div className="bg-border mx-5 h-px shrink-0" />

        {/* ── Nav links ───────────────────────────────────────────────────────── */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-3">
          <motion.ul role="list" variants={navContainerVariants} className="flex flex-col gap-0.5">
            {links.map((link) => {
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
                      'group flex min-h-[48px] items-center gap-3 rounded-lg px-3',
                      'transition-colors duration-150',
                      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                      isActive
                        ? 'bg-primary/8 text-primary'
                        : 'text-fg/80 hover:bg-surface-raised hover:text-fg',
                    )}
                  >
                    {/* Active indicator */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-4 w-[2px] shrink-0 rounded-full transition-all duration-150',
                        isActive ? 'bg-primary' : 'group-hover:bg-border bg-transparent',
                      )}
                    />

                    <span className="font-heading flex-1 text-[1.0625rem] leading-none font-semibold">
                      {link.label}
                    </span>

                    {link.isExternal && (
                      <ArrowUpRight
                        size={14}
                        aria-hidden="true"
                        className="text-muted shrink-0 opacity-60"
                      />
                    )}
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        </nav>

        {/* ── Footer zone ─────────────────────────────────────────────────────── */}
        <div className="border-border shrink-0 border-t px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {/* Search + theme row */}
          <div className="mb-3 flex items-center gap-2">
            <NavSearch onNavigate={onClose} />
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                'text-muted hover:text-fg hover:bg-surface-raised',
                'transition-colors duration-150',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              {isDark ? (
                <Sun size={16} aria-hidden="true" />
              ) : (
                <Moon size={16} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Join CTA */}
          <Link
            href="/join"
            onClick={onClose}
            className={cn(
              'flex min-h-[44px] items-center justify-center rounded-xl px-5',
              'bg-accent text-sm font-semibold text-white',
              'hover:bg-accent-hover transition-colors duration-150',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            Join the Lab →
          </Link>

          {/* Social chips */}
          {(hasSocial || contactEmail) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
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
    </>
  )
}
