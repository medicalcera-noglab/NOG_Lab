'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

// Build the URL for a given locale given the current raw pathname.
// With localePrefix: 'as-needed', English URLs have no prefix and Urdu
// URLs have '/ur/' prefix.
function buildLocaleHref(rawPath: string, targetLocale: string): string {
  // Strip any existing supported locale prefix from the raw path.
  const stripped = routing.locales.reduce<string>((path, loc) => {
    const prefix = `/${loc}`
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return path.slice(prefix.length) || '/'
    }
    return path
  }, rawPath)

  if (targetLocale === routing.defaultLocale) {
    return stripped
  }
  return stripped === '/' ? `/${targetLocale}` : `/${targetLocale}${stripped}`
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('locale')

  return (
    <div className="flex items-center gap-1" role="navigation" aria-label={t('switchLabel')}>
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={buildLocaleHref(pathname, loc)}
          aria-current={loc === locale ? 'true' : undefined}
          hrefLang={loc !== routing.defaultLocale ? loc : undefined}
          className={cn(
            'flex min-h-[44px] min-w-[44px] items-center justify-center',
            'rounded-lg px-2 text-sm font-medium',
            'transition-colors duration-150 focus-visible:outline-none',
            'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2',
            loc === locale
              ? 'text-primary font-semibold'
              : 'text-muted hover:text-fg hover:bg-surface-raised',
          )}
        >
          {t(loc)}
        </Link>
      ))}
    </div>
  )
}
