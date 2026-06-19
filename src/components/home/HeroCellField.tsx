'use client'

import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

// Blob descriptors — purely decorative, positions/sizes are structural
const BLOBS = [
  {
    cls: 'absolute -top-24 -right-24 w-[520px] h-[520px] text-primary opacity-[0.06]',
    delay: '0s',
  },
  { cls: 'absolute top-1/3 -left-32 w-[380px] h-[380px] text-accent opacity-[0.05]', delay: '-6s' },
  {
    cls: 'absolute bottom-0 right-1/4 w-[280px] h-[280px] text-primary opacity-[0.08]',
    delay: '-12s',
  },
] as const

function BlobSvg({ className, delay }: { className: string; delay: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        'pointer-events-none select-none',
        'motion-safe:animate-[blob-drift_22s_ease-in-out_infinite_alternate]',
        className,
      )}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ willChange: 'transform', animationDelay: delay }}
    >
      <path
        d="M210.5,-244.8C267.5,-207.3,304.7,-140.5,318.4,-70.5C332.1,-0.5,322.3,72.7,291.1,132.2C259.9,191.7,207.3,237.5,147.2,261.6C87.1,285.7,19.5,288.2,-47.9,274.3C-115.2,260.5,-182.3,230.3,-226.4,179.5C-270.6,128.7,-291.8,57.2,-285.2,-11.1C-278.7,-79.4,-244.3,-144.5,-194.5,-184.3C-144.7,-224.1,-79.5,-238.6,-8.4,-228.6C62.7,-218.7,153.5,-282.3,210.5,-244.8Z"
        transform="translate(200 200)"
        fill="currentColor"
      />
    </svg>
  )
}

export function HeroCellField() {
  const prefersReduced = useReducedMotion()
  const [paused, setPaused] = useState(false)

  // Under reduced-motion: static decorative layer only, no pause button
  if (prefersReduced) {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {BLOBS.map((b, i) => (
          <BlobSvg key={i} className={b.cls} delay="0s" />
        ))}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-teal) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>
    )
  }

  return (
    <>
      {/* Animated blob layer — toggled by hero-paused CSS class */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 overflow-hidden',
          paused && 'hero-paused',
        )}
      >
        {BLOBS.map((b, i) => (
          <BlobSvg key={i} className={b.cls} delay={b.delay} />
        ))}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-teal) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Pause / resume control */}
      <button
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Resume hero animation' : 'Pause hero animation'}
        aria-pressed={paused}
        className={cn(
          'absolute right-6 bottom-6 z-10',
          'flex h-9 w-9 items-center justify-center rounded-full',
          'bg-surface/70 text-muted backdrop-blur-sm',
          'hover:bg-surface hover:text-fg',
          'transition-colors duration-150',
          'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </>
  )
}
