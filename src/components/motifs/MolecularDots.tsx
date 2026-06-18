import { cn } from '@/lib/utils'

interface MolecularDotsProps {
  className?: string
}

/**
 * Faint radial dot grid suggesting molecular / microbiome structure.
 * Pure CSS background — zero JS, GPU-cheap, aria-hidden.
 * Automatically absent under prefers-reduced-motion (animation only;
 * the static pattern still shows if reduced-motion is on).
 */
export function MolecularDots({ className }: MolecularDotsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none select-none', className)}
      style={{
        backgroundImage: `radial-gradient(circle, var(--color-teal) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        opacity: 0.08,
      }}
    />
  )
}
