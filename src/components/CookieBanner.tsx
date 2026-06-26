'use client'

import Link from 'next/link'
import { useConsent } from '@/providers/ConsentProvider'
import { cn } from '@/lib/utils'

export function CookieBanner() {
  const { consent, ready, grant, deny } = useConsent()

  // Don't render until localStorage has been read (prevents flash on reload)
  // and don't render if the user has already made a choice
  if (!ready || consent !== null) return null

  return (
    <>
      {/* Backdrop — no click-to-dismiss to avoid accidental taps on mobile */}
      <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

      {/* Modal — slides up from bottom on mobile, floating card on sm+ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
        className={cn(
          // Mobile: full-width sheet anchored to bottom edge
          'fixed inset-x-0 bottom-0 z-50',
          // sm+: floating card with rounded corners on all sides
          'sm:inset-x-4 sm:bottom-6 sm:mx-auto sm:max-w-lg sm:rounded-2xl',
          'rounded-t-2xl',
          'bg-surface border-border border-t shadow-2xl sm:border',
          // Padding — extra bottom padding for notched phones
          'px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-7',
          // Cap height so it never overflows on short screens
          'max-h-[85svh] overflow-y-auto',
          'motion-safe:animate-[slideUp_260ms_cubic-bezier(0.22,1,0.36,1)]',
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
              We use <strong className="text-fg font-semibold">Plausible Analytics</strong> — a
              privacy-first tool that collects no personal data, uses no cookies, and is fully GDPR
              compliant. You can decline and the site works exactly the same.{' '}
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
            Decline — no tracking
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
            Accept analytics
          </button>
        </div>
      </div>
    </>
  )
}
