'use client'

import { useTranslations } from 'next-intl'
import { useConsent } from '@/providers/ConsentProvider'
import { cn } from '@/lib/utils'

export function CookiePreferencesLink() {
  const { reset } = useConsent()
  const t = useTranslations('footer')

  return (
    <button
      onClick={reset}
      className={cn(
        'text-muted hover:text-fg text-sm transition-colors duration-150',
        'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
        'text-start',
      )}
    >
      {t('cookiePreferences')}
    </button>
  )
}
