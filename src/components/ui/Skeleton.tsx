import { cn } from '@/lib/utils'

/** A single pulsing skeleton block. Use inside loading.tsx files. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-raised rounded',
        'motion-safe:animate-[skeleton-pulse_1.6s_ease-in-out_infinite]',
        className,
      )}
    />
  )
}
