'use client'

import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

// Solid organic blob shapes — look like cell bodies under a microscope
const BLOBS = [
  {
    cls: 'absolute -top-32 -right-20 w-[620px] h-[620px] text-[#0E6E6E] opacity-[0.12]',
    delay: '0s',
    dur: '34s',
    path: 'M210.5,-244.8C267.5,-207.3,304.7,-140.5,318.4,-70.5C332.1,-0.5,322.3,72.7,291.1,132.2C259.9,191.7,207.3,237.5,147.2,261.6C87.1,285.7,19.5,288.2,-47.9,274.3C-115.2,260.5,-182.3,230.3,-226.4,179.5C-270.6,128.7,-291.8,57.2,-285.2,-11.1C-278.7,-79.4,-244.3,-144.5,-194.5,-184.3C-144.7,-224.1,-79.5,-238.6,-8.4,-228.6C62.7,-218.7,153.5,-282.3,210.5,-244.8Z',
  },
  {
    cls: 'absolute top-1/2 -left-40 w-[440px] h-[440px] text-[#E2725B] opacity-[0.07]',
    delay: '-8s',
    dur: '41s',
    path: 'M168.5,-195.2C218.7,-162.8,260.2,-113.6,278.1,-56.5C296,-0.5,290.2,64.3,261.6,117.5C233,170.7,181.7,212.4,123.9,233.7C66.1,255,2,255.9,-62.5,242.6C-127,229.3,-192,201.8,-234.6,154.8C-277.2,107.8,-297.5,41.3,-291.2,-22.1C-284.9,-85.5,-252.2,-145.8,-203.9,-178.7C-155.7,-211.5,-91.9,-217.1,-30.4,-213.5C31.1,-209.8,118.3,-227.6,168.5,-195.2Z',
  },
  {
    cls: 'absolute bottom-10 right-1/4 w-[320px] h-[320px] text-[#1A9090] opacity-[0.10]',
    delay: '-14s',
    dur: '29s',
    path: 'M124.2,-143.9C162.7,-115.8,196.7,-80.3,207.4,-38.8C218.1,2.7,205.4,50.1,183.2,92.1C161,134.1,129.3,170.7,88.7,189.4C48.2,208.1,-1.2,208.9,-48.4,196.3C-95.7,183.7,-140.8,157.7,-173.4,119.1C-206,80.5,-226.2,29.3,-223.6,-20.7C-221,-70.8,-195.5,-119.7,-157.7,-147.5C-119.9,-175.3,-69.7,-182.1,-20.5,-162.5C28.7,-142.8,85.8,-172,124.2,-143.9Z',
  },
  {
    cls: 'absolute top-1/4 right-8 w-[220px] h-[220px] text-[#E8C9A0] opacity-[0.06]',
    delay: '-5s',
    dur: '38s',
    path: 'M87.5,-99.2C112.5,-78.9,131.9,-50.8,136.8,-20.8C141.7,9.3,132,41.3,113,66C94,90.7,65.7,108.1,34.3,120.1C2.9,132.1,-31.6,138.6,-61.3,128.7C-91,118.7,-115.9,92.3,-129.2,60.9C-142.5,29.5,-144.3,-6.9,-134.3,-39.9C-124.3,-72.9,-102.6,-102.4,-74.6,-122.1C-46.6,-141.7,-11.5,-151.5,16.7,-142.6C44.9,-133.7,62.5,-119.5,87.5,-99.2Z',
  },
] as const

// Ring shapes — cell membrane silhouettes (stroke only, no fill)
const RINGS = [
  {
    cls: 'absolute top-1/3 right-[12%] w-[280px] h-[280px] text-[#0E6E6E] opacity-[0.08]',
    delay: '-20s',
    dur: '44s',
    r: 130,
  },
  {
    cls: 'absolute bottom-1/4 -left-16 w-[200px] h-[200px] text-[#E2725B] opacity-[0.06]',
    delay: '-3s',
    dur: '52s',
    r: 90,
  },
  {
    cls: 'absolute top-[60%] right-[5%] w-[120px] h-[120px] text-[#1A9090] opacity-[0.09]',
    delay: '-17s',
    dur: '37s',
    r: 55,
  },
] as const

// Dot grid — tiny cell nuclei (static decorative layer)
function DotGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `radial-gradient(circle, #1A9090 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    />
  )
}

function BlobSvg({
  className,
  delay,
  dur,
  path,
}: {
  className: string
  delay: string
  dur: string
  path: string
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        'pointer-events-none select-none',
        'motion-safe:animate-[blob-drift_var(--blob-dur)_ease-in-out_infinite_alternate]',
        className,
      )}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={
        {
          willChange: 'transform',
          animationDelay: delay,
          '--blob-dur': dur,
        } as React.CSSProperties
      }
    >
      <path d={path} transform="translate(200 200)" fill="currentColor" />
    </svg>
  )
}

function RingSvg({
  className,
  delay,
  dur,
  r,
}: {
  className: string
  delay: string
  dur: string
  r: number
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        'pointer-events-none select-none',
        'motion-safe:animate-[blob-drift_var(--blob-dur)_ease-in-out_infinite_alternate]',
        className,
      )}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={
        {
          willChange: 'transform',
          animationDelay: delay,
          '--blob-dur': dur,
        } as React.CSSProperties
      }
    >
      <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Inner ring — simulates cell inner membrane */}
      <circle
        cx="100"
        cy="100"
        r={r * 0.72}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="4 6"
        opacity="0.5"
      />
    </svg>
  )
}

export function HeroCellField() {
  const prefersReduced = useReducedMotion()
  const [paused, setPaused] = useState(false)

  if (prefersReduced) {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {BLOBS.map((b, i) => (
          <BlobSvg key={i} className={b.cls} delay="0s" dur={b.dur} path={b.path} />
        ))}
        {RINGS.map((r, i) => (
          <RingSvg key={i} className={r.cls} delay="0s" dur={r.dur} r={r.r} />
        ))}
        <DotGrid />
      </div>
    )
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 overflow-hidden',
          paused && 'hero-paused',
        )}
      >
        {BLOBS.map((b, i) => (
          <BlobSvg key={i} className={b.cls} delay={b.delay} dur={b.dur} path={b.path} />
        ))}
        {RINGS.map((r, i) => (
          <RingSvg key={i} className={r.cls} delay={r.delay} dur={r.dur} r={r.r} />
        ))}
        <DotGrid />
      </div>

      {/* Pause / resume control */}
      <button
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Resume hero animation' : 'Pause hero animation'}
        aria-pressed={paused}
        className={cn(
          'absolute right-5 bottom-14 z-20',
          'flex h-8 w-8 items-center justify-center rounded-full',
          'bg-white/10 text-white/40 backdrop-blur-sm',
          'hover:bg-white/15 hover:text-white/70',
          'transition-colors duration-150',
          'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071918] focus-visible:outline-none',
        )}
      >
        {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
      </button>
    </>
  )
}
