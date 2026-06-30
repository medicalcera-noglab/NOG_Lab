'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/nav'

interface Props {
  links: NavItem[]
  /** Renders as a vertical stack for the mobile drawer */
  mobile?: boolean
  onNavigate?: () => void
}

export function NavLinks({ links, mobile = false, onNavigate }: Props) {
  const pathname = usePathname()

  if (mobile) {
    return (
      <nav aria-label="Mobile navigation" className="flex flex-col gap-0.5 p-5 pt-6">
        {links.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              aria-current={isActive ? 'page' : undefined}
              onClick={onNavigate}
              className={cn(
                'rounded-xl px-4 py-3.5 text-lg font-medium',
                'transition-colors duration-150 focus-visible:outline-none',
                'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-white/10 text-[#1A9090]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <ul role="list" className="hidden items-center justify-center gap-0.5 md:flex">
      {links.map((link) => {
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium',
                'transition-colors duration-150 focus-visible:outline-none',
                'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-white/10 font-semibold text-[#1A9090]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
