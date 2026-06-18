'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

const fadeVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

/**
 * Scroll-triggered fade-up reveal.
 * No-ops when the user has requested reduced motion.
 */
export function FadeUp({ children, className, delay = 0 }: FadeUpProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeVariants}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
