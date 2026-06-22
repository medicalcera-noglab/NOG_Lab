'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT, DUR, FADE_UP, VIEWPORT } from '@/lib/motion'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Scroll-triggered fade-up reveal.
 * No-ops (renders a plain div) when the user has requested reduced motion.
 */
export function FadeUp({ children, className, delay = 0 }: FadeUpProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={FADE_UP}
      transition={{ duration: DUR.md, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
