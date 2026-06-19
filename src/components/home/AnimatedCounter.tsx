'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  label: string
}

export function AnimatedCounter({ target, suffix = '', label }: AnimatedCounterProps) {
  const prefersReduced = useReducedMotion()
  const [display, setDisplay] = useState(prefersReduced ? target : 0)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (prefersReduced || hasAnimated.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        hasAnimated.current = true

        const duration = 1400
        let startTime: number | null = null

        const step = (ts: number) => {
          if (!startTime) startTime = ts
          const progress = Math.min((ts - startTime) / duration, 1)
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(eased * target))
          if (progress < 1) requestAnimationFrame(step)
        }

        requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [target, prefersReduced])

  const formatted = display.toLocaleString()
  const finalFormatted = target.toLocaleString()

  return (
    <div ref={containerRef} className="text-center">
      {/* Screen readers see the final value always — the animation is cosmetic */}
      <div role="group" aria-label={`${finalFormatted} ${label}`}>
        <span
          aria-hidden="true"
          className="font-heading text-primary block text-5xl font-bold tabular-nums md:text-6xl"
        >
          {formatted}
          {suffix}
        </span>
        {/* Invisible final number for AT — prevents announcement of every intermediate value */}
        <span className="sr-only">
          {finalFormatted}
          {suffix}
        </span>
      </div>
      <p className="text-muted mt-2 text-sm font-medium tracking-wider uppercase">{label}</p>
    </div>
  )
}
