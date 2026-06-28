'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Stat {
  value: number
  suffix: string
  label: string
}

function prefersReduced() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(() => (prefersReduced() ? target : 0))
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (prefersReduced()) return
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return count
}

function Counter({ stat, delay }: { stat: Stat; delay: number }) {
  const count = useCountUp(stat.value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-start"
    >
      <span className="font-heading text-2xl font-bold text-white sm:text-3xl">
        {count}
        {stat.suffix}
      </span>
      <span className="mt-0.5 text-xs font-medium tracking-wide text-white/45 uppercase">
        {stat.label}
      </span>
    </motion.div>
  )
}

interface HeroStatCountersProps {
  publications: number
  teamMembers: number
  foundingYear?: number | null
}

export function HeroStatCounters({
  publications,
  teamMembers,
  foundingYear,
}: HeroStatCountersProps) {
  const yearsActive = foundingYear ? new Date().getFullYear() - foundingYear : 5

  const stats: Stat[] = [
    { value: publications, suffix: '+', label: 'Publications' },
    { value: teamMembers, suffix: '', label: 'Researchers' },
    { value: yearsActive, suffix: '+', label: 'Years Active' },
  ]

  return (
    <div className="relative mt-6 mb-8">
      {/* Divider */}
      <div className="mb-5 h-px w-full bg-white/10" />
      <div className="flex gap-7 sm:gap-10">
        {stats.map((stat, i) => (
          <Counter key={stat.label} stat={stat} delay={1.4 + i * 0.12} />
        ))}
      </div>
    </div>
  )
}
