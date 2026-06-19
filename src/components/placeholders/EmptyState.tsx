import Link from 'next/link'
import { PlaceholderSvg } from './PlaceholderSvg'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** Short heading, e.g. "No publications yet" */
  heading: string
  /** One- or two-sentence supporting message */
  body: string
  /** Optional call-to-action link */
  action?: { label: string; href: string }
  /**
   * Which illustration variant to display (0–3).
   * Default: 0.  Pick per-page for visual variety.
   *   0 – CellField        (People, News)
   *   1 – DriftingDots     (Blog, Search)
   *   2 – GradientMembrane (Publications, Map)
   *   3 – MicrographTexture(Projects, Collaborations)
   */
  variant?: 0 | 1 | 2 | 3
  className?: string
}

/**
 * On-brand empty state with a microbiome SVG illustration.
 * Server Component — no client JS needed.
 */
export function EmptyState({ heading, body, action, variant = 0, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center py-20 text-center', className)}
      role="status"
      aria-live="polite"
    >
      {/* Illustration */}
      <div className="mb-6 w-44" aria-hidden="true">
        <PlaceholderSvg
          forceVariant={variant}
          seed={variant}
          className="h-auto w-full opacity-70"
        />
      </div>

      <h2 className="font-heading text-fg mb-2 text-xl font-bold">{heading}</h2>
      <p className="text-muted max-w-sm text-sm leading-relaxed">{body}</p>

      {action && (
        <Link
          href={action.href}
          className={cn(
            'text-primary mt-5 inline-block rounded text-sm font-semibold underline underline-offset-2',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
