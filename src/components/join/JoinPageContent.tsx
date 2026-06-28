'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  FlaskConical,
  Globe,
  Briefcase,
  ArrowRight,
  Quote,
  Sparkles,
} from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { JoinForm } from '@/components/forms/JoinForm'
import type { OpenPosition } from '../../../payload-types'

interface Testimonial {
  id?: string | null
  name: string
  role: string
  quote: string
}

export interface PositionCard {
  id: number
  title: string
  type: string
  previewText: string
}

interface JoinPageContentProps {
  positions: PositionCard[]
  rawPositions: OpenPosition[]
  testimonials: Testimonial[]
  noPositionsMessage?: string | null
  recaptchaSiteKey?: string | null
}

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  phd: {
    bg: 'color-mix(in oklch, var(--color-coral) 12%, transparent)',
    text: 'var(--color-coral)',
  },
  postdoc: {
    bg: 'color-mix(in oklch, var(--color-teal) 12%, transparent)',
    text: 'var(--color-teal)',
  },
  research_assistant: {
    bg: 'color-mix(in oklch, var(--color-sand) 22%, transparent)',
    text: 'color-mix(in oklch, var(--color-sand) 75%, var(--fg))',
  },
  visiting: {
    bg: 'color-mix(in oklch, var(--color-teal) 8%, transparent)',
    text: 'var(--color-teal)',
  },
}

function getTypeStyle(type: string) {
  return (
    TYPE_STYLES[type.toLowerCase().replace(/\s+/g, '_')] ?? {
      bg: 'color-mix(in oklch, var(--fg) 8%, transparent)',
      text: 'var(--muted)',
    }
  )
}

function getTypeIcon(type: string) {
  const t = type.toLowerCase()
  if (t === 'phd') return GraduationCap
  if (t === 'postdoc') return FlaskConical
  if (t === 'visiting') return Globe
  return Briefcase
}

export function JoinPageContent({
  positions,
  rawPositions,
  testimonials,
  noPositionsMessage,
  recaptchaSiteKey,
}: JoinPageContentProps) {
  const [selectedPosition, setSelectedPosition] = useState('')
  const formSectionRef = useRef<HTMLDivElement>(null)

  const handleApply = (positionTitle: string) => {
    setSelectedPosition(positionTitle)
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <>
      {/* ── Open Positions ──────────────────────────────────────────────── */}
      <Section className="bg-bg py-16 md:py-24">
        <Container>
          <div className="mb-12">
            <p className="text-primary mb-3 text-xs font-semibold tracking-[0.15em] uppercase">
              Current openings
            </p>
            <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">Open Positions</h2>
          </div>

          {positions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="border-border bg-surface flex flex-col items-center rounded-2xl border p-10 text-center"
            >
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: 'color-mix(in oklch, var(--color-teal) 10%, transparent)',
                }}
              >
                <Briefcase size={24} style={{ color: 'var(--color-teal)' }} aria-hidden="true" />
              </div>
              <p className="text-fg mb-2 text-lg font-semibold">
                {noPositionsMessage ?? 'No open positions at this time.'}
              </p>
              <p className="text-muted max-w-sm text-sm leading-relaxed">
                We still welcome motivated researchers. Use the form below for a general inquiry or
                to register your interest.
              </p>
              <button
                onClick={() =>
                  formSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
                className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline focus-visible:underline focus-visible:outline-none"
              >
                Go to application form
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </motion.div>
          ) : (
            <ul
              role="list"
              aria-label="Open positions"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {positions.map((position, i) => {
                const typeStyle = getTypeStyle(position.type)
                const TypeIcon = getTypeIcon(position.type)

                return (
                  <motion.li
                    key={position.id}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: (i % 3) * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <motion.article
                      className="group border-border bg-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      style={{ willChange: 'transform' }}
                    >
                      {/* Hover glow */}
                      <motion.div
                        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full"
                        style={{
                          background: `radial-gradient(circle, color-mix(in oklch, ${typeStyle.text} 18%, transparent) 0%, transparent 70%)`,
                        }}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        aria-hidden="true"
                      />

                      {/* Card header */}
                      <div className="p-6 pb-4">
                        <div
                          className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold capitalize"
                          style={{
                            backgroundColor: typeStyle.bg,
                            color: typeStyle.text,
                          }}
                        >
                          <TypeIcon size={11} aria-hidden="true" />
                          {position.type.replace(/_/g, ' ')}
                        </div>

                        <h3 className="text-fg text-lg leading-snug font-bold">{position.title}</h3>
                      </div>

                      {/* Preview text */}
                      {position.previewText && (
                        <div className="flex-1 px-6 pb-2">
                          <p className="text-muted line-clamp-3 text-sm leading-relaxed">
                            {position.previewText}
                          </p>
                        </div>
                      )}

                      {/* Apply CTA */}
                      <div className="p-6 pt-4">
                        <motion.button
                          type="button"
                          onClick={() => handleApply(position.title)}
                          className="focus-visible:ring-ring inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none"
                          style={{
                            backgroundColor: `color-mix(in oklch, ${typeStyle.text} 10%, transparent)`,
                            color: typeStyle.text,
                            border: `1px solid color-mix(in oklch, ${typeStyle.text} 25%, transparent)`,
                          }}
                          whileHover={{
                            backgroundColor: `color-mix(in oklch, ${typeStyle.text} 16%, transparent)`,
                            scale: 1.01,
                            transition: { duration: 0.15 },
                          }}
                          whileTap={{ scale: 0.98 }}
                          aria-label={`Apply for ${position.title}`}
                        >
                          Apply for this position
                          <ArrowRight
                            size={14}
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </motion.button>
                      </div>

                      {/* Accent sweep */}
                      <motion.div
                        className="h-[2px] rounded-b-2xl"
                        style={{ backgroundColor: typeStyle.text }}
                        initial={{ scaleX: 0, originX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        aria-hidden="true"
                      />
                    </motion.article>
                  </motion.li>
                )
              })}
            </ul>
          )}
        </Container>
      </Section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <Section className="border-border/40 bg-surface border-t py-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="mb-10"
            >
              <p className="text-primary mb-3 text-xs font-semibold tracking-[0.15em] uppercase">
                Life at NOG Lab
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold">What Our Team Says</h2>
            </motion.div>

            <ul role="list" aria-label="Team testimonials" className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <motion.li
                  key={t.id ?? i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <blockquote className="border-border bg-bg relative h-full rounded-2xl border p-7 shadow-sm">
                    <Quote
                      size={36}
                      className="absolute top-5 right-5 opacity-[0.08]"
                      style={{ color: 'var(--color-teal)' }}
                      aria-hidden="true"
                    />
                    <p className="text-fg relative z-10 mb-5 text-base leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="border-border/50 border-t pt-4">
                      <p className="text-fg text-sm font-semibold">{t.name}</p>
                      {t.role && <p className="text-muted text-xs">{t.role}</p>}
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* ── Application Form ─────────────────────────────────────────────── */}
      <div ref={formSectionRef} id="apply" className="scroll-mt-20">
        <Section className="bg-bg py-16 md:py-24">
          <Container className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45 }}
              className="mb-8"
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={14} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
                <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                  Take the next step
                </p>
              </div>

              <AnimatePresence mode="wait">
                {selectedPosition ? (
                  <motion.h2
                    key={`applying-${selectedPosition}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="font-heading text-fg text-3xl font-bold"
                  >
                    Applying for{' '}
                    <span style={{ color: 'var(--color-teal)' }}>{selectedPosition}</span>
                  </motion.h2>
                ) : (
                  <motion.h2
                    key="apply-generic"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="font-heading text-fg text-3xl font-bold"
                  >
                    Apply to Join the Lab
                  </motion.h2>
                )}
              </AnimatePresence>

              {!selectedPosition && positions.length > 0 && (
                <p className="text-muted mt-2 text-sm">
                  Select a position above or choose from the dropdown below.
                </p>
              )}
            </motion.div>

            <JoinForm
              positions={rawPositions}
              recaptchaSiteKey={recaptchaSiteKey}
              defaultPosition={selectedPosition}
            />
          </Container>
        </Section>
      </div>
    </>
  )
}
