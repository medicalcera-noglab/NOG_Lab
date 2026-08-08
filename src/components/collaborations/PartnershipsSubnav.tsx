'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface NavItem {
  id: string
  label: string
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'what-we-offer', label: 'What We Offer' },
  { id: 'research-infrastructure', label: 'Infrastructure' },
  { id: 'who-we-work-with', label: 'Who We Work With' },
  { id: 'example-projects', label: 'Example Projects' },
  { id: 'partnership-models', label: 'Partnership Models' },
  { id: 'partner-institutions', label: 'Partner Institutions' },
  { id: 'enquiry', label: 'Get in Touch' },
]

interface PartnershipsSubnavProps {
  items?: NavItem[]
}

export function PartnershipsSubnav({ items }: PartnershipsSubnavProps) {
  const navItems = items && items.length > 0 ? items : DEFAULT_NAV_ITEMS
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? 'what-we-offer')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible?.target.id) {
          setActiveSection(visible.target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    )

    navItems.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [navItems])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 90
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      setActiveSection(id)
    }
  }

  if (navItems.length === 0) return null

  return (
    <div className="border-border bg-bg/95 sticky top-16 z-30 border-y backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Partnership page sections"
          className="no-scrollbar flex items-center gap-2 overflow-x-auto py-3 text-xs font-medium sm:text-sm"
        >
          {navItems.map(({ id, label }) => {
            const isActive = activeSection === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className={cn(
                  'focus-visible:ring-primary shrink-0 rounded-full px-4 py-1.5 transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none',
                  isActive
                    ? 'bg-primary font-semibold text-white shadow-sm'
                    : 'text-muted hover:bg-surface-raised hover:text-fg',
                )}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
