'use client'

import Link from 'next/link'
import { useConsent } from '@/providers/ConsentProvider'
import { cn } from '@/lib/utils'

const DEFAULT_DESCRIPTION =
  'We use Plausible Analytics — a privacy-first tool that collects no personal data, uses no cookies, and is fully GDPR compliant. You can decline and the site works exactly the same.'

interface CookieBannerProps {
  enabled?: boolean
  description?: string | null
  acceptLabel?: string | null
  declineLabel?: string | null
}

export function CookieBanner({
  enabled = true,
  description,
  acceptLabel,
  declineLabel,
}: CookieBannerProps) {
  const { consent, ready, grant, deny } = useConsent()

  if (!ready || consent !== null || !enabled) return null

  return (
    <>
      {/* Backdrop — pointer-events-none + no backdrop-filter so iOS Safari
          never creates a stacking context that blocks touches on z-50 buttons */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 bg-black/40" />

      {/* Modal — no CSS transform animation: iOS Safari caches the touch
          hit-area at the translateY(100%) start position, making buttons
          appear visible but untappable. Static render is instant and safe. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'sm:inset-x-4 sm:bottom-6 sm:mx-auto sm:max-w-lg sm:rounded-2xl',
          'rounded-t-2xl',
          'bg-surface border-border border-t shadow-2xl sm:border',
          'px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-7',
        )}
      >
        {/* Drag handle — visual hint for mobile sheet */}
        <div className="mb-4 flex justify-center sm:hidden" aria-hidden="true">
          <div className="bg-border h-1 w-10 rounded-full" />
        </div>

        {/* Icon + heading */}
        <div className="mb-3 flex items-start gap-3">
          <span role="img" aria-label="Cookie" className="mt-0.5 shrink-0 text-2xl">
            🍪
          </span>
          <div>
            <h2 className="font-heading text-fg text-base font-bold">We respect your privacy</h2>
            <p className="text-muted mt-1 text-sm leading-relaxed">
              {description || DEFAULT_DESCRIPTION}{' '}
              <Link
                href="/privacy"
                className="text-primary focus-visible:ring-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
              >
                Privacy Policy →
              </Link>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={deny}
            className={cn(
              'border-border text-muted hover:text-fg hover:bg-surface-raised',
              'min-h-[44px] rounded-xl border px-5 py-2.5 text-sm font-semibold',
              'focus-visible:ring-ring transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
              'order-2 sm:order-1',
            )}
          >
            {declineLabel || 'Decline — no tracking'}
          </button>
          <button
            onClick={grant}
            className={cn(
              'bg-primary text-white hover:opacity-90',
              'min-h-[44px] rounded-xl px-5 py-2.5 text-sm font-semibold',
              'focus-visible:ring-ring transition-opacity duration-150 focus-visible:ring-2 focus-visible:outline-none',
              'order-1 sm:order-2',
            )}
          >
            {acceptLabel || 'Accept analytics'}
          </button>
        </div>
      </div>
    </>
  )
}
