import Link from 'next/link'
import { getSiteSettings, getNavigation } from '@/lib/data'
import { NavMenu } from './NavMenu'
import { NavLinks } from './NavLinks'
import { Container } from './ui/Container'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/nav'

export async function Navbar() {
  const [settings, navData] = await Promise.all([getSiteSettings(), getNavigation()])

  const headerLinks: NavItem[] = (navData?.headerLinks ?? [])
    .filter((l) => l.isVisible !== false)
    .map((l) => ({
      label: l.label,
      href: l.href,
      isExternal: l.isExternal,
      isVisible: l.isVisible,
    }))

  const social = settings.social ?? {}
  const contactEmail = settings.contactEmail ?? null

  return (
    <header className="sticky top-0 z-[45] border-b border-white/10 bg-[#071918]">
      <div aria-hidden="true" className="absolute inset-0 -z-10" />
      <Container className="max-w-none">
        <nav
          aria-label="Primary navigation"
          className="grid h-16 grid-cols-[1fr_auto] items-center gap-6 md:grid-cols-[auto_1fr_auto]"
        >
          {/* ── FAR LEFT: logo mark + wordmark ──────────────────────────────── */}
          <Link
            href="/"
            aria-label={`${settings.labName} — home`}
            className={cn(
              'flex flex-shrink-0 items-center gap-2.5',
              'focus-visible:ring-ring focus-visible:ring-offset-bg rounded',
              'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/NOG_LAB.png"
              alt={settings.labName}
              style={{
                height: '44px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '8px',
              }}
            />
          </Link>

          {/* ── MIDDLE: primary nav links (desktop only) — always rendered to hold col 2 */}
          <NavLinks links={headerLinks} />

          {/* ── FAR RIGHT: search + theme toggle (desktop) / hamburger (mobile) */}
          <NavMenu links={headerLinks} social={social} contactEmail={contactEmail} />
        </nav>
      </Container>
    </header>
  )
}
