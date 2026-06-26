'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT, DUR, FADE_UP } from '@/lib/motion'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

// Set to true after the first client mount so subsequent route-change mounts
// can animate in. Never set on the server (useEffect doesn't run there).
let firstRenderDone = false

/**
 * Fade-up entrance animation.
 * - First page load: plain div so SSR content stays visible during JS hydration.
 * - After client-side navigation: fade-up animation plays (content was never
 *   visible before, so going from opacity 0 is not jarring).
 * - Reduced motion: always a plain div.
 */
export function FadeUp({ children, className, delay = 0 }: FadeUpProps) {
  const reduced = useReducedMotion()
  // Read the module flag once at mount; false on first load, true after navigation.
  const [shouldAnimate] = useState(() => firstRenderDone)

  useEffect(() => {
    firstRenderDone = true
  }, [])

  if (reduced || !shouldAnimate) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={FADE_UP}
      transition={{ duration: DUR.md, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
