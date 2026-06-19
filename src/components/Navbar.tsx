import Link from 'next/link'
import { getSiteSettings } from '@/lib/data'
import { PRIMARY_NAV } from '@/lib/nav'
import { NavMenu } from './NavMenu'
import { Container } from './ui/Container'
import { cn } from '@/lib/utils'

export async function Navbar() {
  const settings = await getSiteSettings()

  return (
    <header
      className={cn(
        'border-border sticky top-0 z-30 border-b',
        'bg-bg/90 supports-backdrop-blur:bg-bg/80 backdrop-blur-md',
      )}
    >
      <Container>
        <nav
          aria-label="Primary navigation"
          className="flex h-16 items-center justify-between gap-6"
        >
          {/* Logo / lab name */}
          <Link
            href="/"
            aria-label={`${settings.labName} — home`}
            className={cn(
              'font-heading text-primary flex-shrink-0 text-lg font-bold',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              'focus-visible:ring-offset-bg rounded focus-visible:ring-offset-2',
            )}
          >
            {settings.labName}
          </Link>

          {/* Desktop nav links */}
          <ul role="list" className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium',
                    'text-muted hover:text-fg hover:bg-surface-raised',
                    'transition-colors duration-150 focus-visible:outline-none',
                    'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Theme toggle + mobile menu (client) */}
          <NavMenu links={PRIMARY_NAV} />
        </nav>
      </Container>
    </header>
  )
}
