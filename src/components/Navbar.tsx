import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/data'
import { PRIMARY_NAV } from '@/lib/nav'
import { NavMenu } from './NavMenu'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Container } from './ui/Container'
import { MediaImage } from './MediaImage'
import { cn } from '@/lib/utils'
import type { Media } from '@/../../payload-types'

export async function Navbar() {
  const [settings, t] = await Promise.all([getSiteSettings(), getTranslations('nav')])

  const logo = typeof settings.logo === 'object' ? (settings.logo as Media) : null
  const logoDark = typeof settings.logoDark === 'object' ? (settings.logoDark as Media) : null

  return (
    <header
      className={cn(
        'border-border sticky top-0 z-30 border-b',
        'bg-bg/90 supports-backdrop-blur:bg-bg/80 backdrop-blur-md',
      )}
    >
      <Container>
        <nav aria-label={t('primaryNav')} className="flex h-16 items-center justify-between gap-6">
          {/* Logo / lab name */}
          <Link
            href="/"
            aria-label={`${settings.labName} — ${t('logoHomeLabel')}`}
            className={cn(
              'flex flex-shrink-0 items-center gap-2.5',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              'focus-visible:ring-offset-bg rounded focus-visible:ring-offset-2',
            )}
          >
            {logo ? (
              <>
                {/* Light-mode logo */}
                <span className={cn('block h-8 w-8', logoDark ? 'dark:hidden' : '')}>
                  <MediaImage
                    doc={logo}
                    sizes="32px"
                    className="h-full w-full object-contain"
                    priority
                  />
                </span>
                {/* Dark-mode logo (only rendered when logoDark is configured) */}
                {logoDark && (
                  <span className="hidden h-8 w-8 dark:block">
                    <MediaImage
                      doc={logoDark}
                      sizes="32px"
                      className="h-full w-full object-contain"
                      priority
                    />
                  </span>
                )}
              </>
            ) : null}
            <span
              className={cn(
                'font-heading text-primary text-lg font-bold',
                logo ? 'sr-only md:not-sr-only' : '',
              )}
            >
              {settings.labName}
            </span>
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
                  {t(link.msgKey)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Locale switcher + theme toggle + mobile menu (client) */}
          <div className="flex items-center gap-1">
            <div className="hidden md:flex">
              <LocaleSwitcher />
            </div>
            <NavMenu links={PRIMARY_NAV} />
          </div>
        </nav>
      </Container>
    </header>
  )
}
