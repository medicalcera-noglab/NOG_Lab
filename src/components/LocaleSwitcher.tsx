'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('locale')

  return (
    <div className="flex items-center gap-1" role="navigation" aria-label={t('switchLabel')}>
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          aria-current={loc === locale ? 'true' : undefined}
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
