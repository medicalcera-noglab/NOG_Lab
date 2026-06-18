import { cn } from '@/lib/utils'

interface CellBlobProps {
  className?: string
  color?: string
}

/**
 * Organic blob shape evoking microbial cells.
 * Purely decorative — hidden from assistive tech.
 * GPU-composited (transform only), disabled under reduced-motion via CSS.
 */
export function CellBlob({ className, color = 'currentColor' }: CellBlobProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        'pointer-events-none select-none',
        'motion-safe:animate-[blob-drift_18s_ease-in-out_infinite_alternate]',
        className,
      )}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ willChange: 'transform' }}
    >
      <path
        d="M210.5,-244.8C267.5,-207.3,304.7,-140.5,318.4,-70.5C332.1,-0.5,322.3,72.7,291.1,132.2C259.9,191.7,207.3,237.5,147.2,261.6C87.1,285.7,19.5,288.2,-47.9,274.3C-115.2,260.5,-182.3,230.3,-226.4,179.5C-270.6,128.7,-291.8,57.2,-285.2,-11.1C-278.7,-79.4,-244.3,-144.5,-194.5,-184.3C-144.7,-224.1,-79.5,-238.6,-8.4,-228.6C62.7,-218.7,153.5,-282.3,210.5,-244.8Z"
        transform="translate(200 200)"
        fill={color}
        opacity="0.07"
      />
    </svg>
  )
}
