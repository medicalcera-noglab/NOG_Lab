import { cn } from '@/lib/utils'

interface GrainTextureProps {
  className?: string
  opacity?: number
}

/**
 * Subtle film-grain / micrograph texture overlay.
 * Uses an inline SVG feTurbulence filter — no external assets.
 * Purely decorative, aria-hidden, pointer-events-none.
 */
export function GrainTexture({ className, opacity = 0.035 }: GrainTextureProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none select-none', className)}
      style={{ opacity }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </div>
  )
}
