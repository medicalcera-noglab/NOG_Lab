'use client'

import { useEffect } from 'react'
import { PlaceholderSvg } from '@/components/placeholders/PlaceholderSvg'
import { cn } from '@/lib/utils'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Surface the error to an error reporting service here if needed.
    // Not logging to console — no console.log in production.
  }, [error])

  return (
    <div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center',
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-6 w-40 opacity-75" aria-hidden="true">
        <PlaceholderSvg forceVariant={3} seed="error" className="h-auto w-full" />
      </div>

      <h1 className="font-heading text-fg mb-3 text-2xl font-bold">Something went wrong</h1>

      <p className="text-muted mb-8 max-w-sm text-sm leading-relaxed">
        An unexpected error occurred. Please try again — if the problem persists, contact us.
      </p>

      <button
        onClick={reset}
        className={cn(
          'bg-primary text-primary-fg min-h-[44px] rounded-lg px-5 py-2.5 text-sm font-semibold',
          'focus-visible:ring-ring transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        Try again
      </button>
    </div>
  )
}
