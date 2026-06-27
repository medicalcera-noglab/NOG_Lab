'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MolecularDots } from '@/components/motifs/MolecularDots'
import type { SiteSetting } from '../../../payload-types'

interface BigQuestionsStripProps {
  questions: NonNullable<SiteSetting['bigQuestions']>
}

const ACCENT_COLORS = [
  'var(--color-teal)',
  'var(--color-coral)',
  'var(--color-sand)',
  'var(--color-teal)',
  'var(--color-coral)',
]

export function BigQuestionsStrip({ questions }: BigQuestionsStripProps) {
  if (!questions.length) return null

  return (
    <Section className="bg-surface relative overflow-hidden py-12 md:py-20">
      <MolecularDots className="absolute inset-0 opacity-20" />

      {/* Large decorative "?" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-8 -translate-y-1/2 text-[18rem] leading-none font-black opacity-[0.03] select-none"
        style={{ color: 'var(--color-teal)' }}
      >
        ?
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.18em] uppercase">
            What we ask
          </p>
          <div className="via-primary/50 mx-auto h-px w-16 bg-gradient-to-r from-transparent to-transparent" />
        </motion.div>

        <ol role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((item, i) => (
            <QuestionCard key={item.id ?? i} question={item.question} index={i} delay={i * 0.07} />
          ))}
        </ol>
      </Container>
    </Section>
  )
}

function QuestionCard({
  question,
  index,
  delay,
}: {
  question: string
  index: number
  delay: number
}) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group border-border/60 bg-bg relative h-full min-h-[150px] cursor-default overflow-hidden rounded-2xl border p-6 shadow-sm"
      style={
        {
          '--accent': accent,
        } as React.CSSProperties
      }
    >
      {/* Radial glow in top-right corner on hover */}
      <motion.div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--accent) 25%, transparent) 0%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        aria-hidden="true"
      />

      {/* Animated bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] rounded-full"
        style={{ backgroundColor: accent }}
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        aria-hidden="true"
      />

      {/* Number badge */}
      <div
        className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold"
        style={{
          backgroundColor: `color-mix(in oklch, ${accent} 15%, transparent)`,
          color: accent,
        }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <p className="text-fg text-[15px] leading-relaxed font-medium">{question}</p>
    </motion.li>
  )
}
