'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useConsent } from '@/providers/ConsentProvider'
import { cn } from '@/lib/utils'

export function CookieBanner() {
  const { consent, grant, deny } = useConsent()
  const t = useTranslations('consent')

  // useSyncExternalStore returns null (server snapshot) until the client
  // reads localStorage. Once mounted, null means "no preference yet" → show.
  if (consent !== null) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('bannerLabel')}
      className={cn(
        'border-border bg-surface fixed inset-x-0 bottom-0 z-50 border-t shadow-lg',
        'motion-safe:animate-[slideUp_220ms_ease-out]',
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 lg:px-8">
        <p className="text-muted flex-1 text-sm leading-relaxed">
          {t('bannerText')}{' '}
          <Link
            href="/privacy"
            className="text-primary focus-visible:ring-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
          >
            {t('privacyLink')}
          </Link>
        </p>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={deny}
            className={cn(
              'border-border text-muted hover:text-fg min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium',
              'focus-visible:ring-ring transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            {t('decline')}
          </button>
          <button
            onClick={grant}
            className={cn(
              'bg-primary text-primary-fg min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium',
              'hover:bg-accent-hover focus-visible:ring-ring transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
