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
  X,
  Eye,
  CheckCircle,
} from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { JoinForm } from '@/components/forms/JoinForm'
import { MediaImage } from '@/components/MediaImage'
import { RichText } from '@/components/RichText'
import type { OpenPosition, Media } from '../../../payload-types'

interface Testimonial {
  id?: string | null
  name: string
  role: string
  quote: string
}

export interface PositionCard {
  id: string | number
  title: string
  type: string
  previewText: string
  image?: Media | null
  rawDoc?: OpenPosition
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
  const [activeDetailPosition, setActiveDetailPosition] = useState<PositionCard | null>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  const handleApply = (positionTitle: string) => {
    setSelectedPosition(positionTitle)
    setActiveDetailPosition(null)
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
            <div className="border-border bg-surface flex flex-col items-center rounded-2xl border p-10 text-center">
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
            </div>
          ) : (
            <ul
              role="list"
              aria-label="Open positions"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {positions.map((position) => {
                const typeStyle = getTypeStyle(position.type)
                const TypeIcon = getTypeIcon(position.type)

                return (
                  <li key={position.id}>
                    <motion.article
                      className="group border-border bg-surface relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow duration-300 hover:shadow-md"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      style={{ willChange: 'transform' }}
                      onClick={() => setActiveDetailPosition(position)}
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

                      {/* Card Cover Image */}
                      <div className="bg-muted/20 border-border/50 relative h-48 w-full overflow-hidden border-b">
                        <MediaImage
                          doc={position.image}
                          seed={position.id}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          placeholderLabel={`${position.title} illustration`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute right-4 bottom-3 left-4 flex items-center justify-between">
                          <div
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold capitalize shadow-sm backdrop-blur-md"
                            style={{
                              backgroundColor: typeStyle.bg,
                              color: typeStyle.text,
                            }}
                          >
                            <TypeIcon size={11} aria-hidden="true" />
                            {position.type.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-fg group-hover:text-primary mb-2.5 text-lg leading-snug font-bold transition-colors">
                          {position.title}
                        </h3>

                        {position.previewText && (
                          <p className="text-muted mb-6 line-clamp-3 text-sm leading-relaxed">
                            {position.previewText}
                          </p>
                        )}

                        <div className="mt-auto flex flex-col gap-2 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDetailPosition(position)
                            }}
                            className="bg-bg border-border text-fg hover:bg-muted/30 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                          >
                            <Eye size={13} aria-hidden="true" />
                            View Position Details
                          </button>

                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApply(position.title)
                            }}
                            className="focus-visible:ring-ring inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none"
                            style={{
                              backgroundColor: `color-mix(in oklch, ${typeStyle.text} 12%, transparent)`,
                              color: typeStyle.text,
                              border: `1px solid color-mix(in oklch, ${typeStyle.text} 30%, transparent)`,
                            }}
                            whileHover={{
                              backgroundColor: `color-mix(in oklch, ${typeStyle.text} 20%, transparent)`,
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
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </Section>

      {/* ── Position Detail Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {activeDetailPosition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetailPosition(null)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="border-border bg-surface relative z-10 my-8 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="position-modal-title"
            >
              {/* Modal Cover Header */}
              <div className="bg-muted/20 relative h-56 w-full flex-shrink-0 overflow-hidden">
                <MediaImage
                  doc={activeDetailPosition.image}
                  seed={activeDetailPosition.id}
                  fill
                  className="object-cover"
                  placeholderLabel={`${activeDetailPosition.title} cover`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setActiveDetailPosition(null)}
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-black/70 focus-visible:outline-none"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <div className="absolute right-6 bottom-4 left-6">
                  <div
                    className="mb-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize backdrop-blur-md"
                    style={{
                      backgroundColor: getTypeStyle(activeDetailPosition.type).bg,
                      color: getTypeStyle(activeDetailPosition.type).text,
                    }}
                  >
                    {activeDetailPosition.type.replace(/_/g, ' ')}
                  </div>
                  <h2
                    id="position-modal-title"
                    className="text-2xl leading-tight font-bold text-white md:text-3xl"
                  >
                    {activeDetailPosition.title}
                  </h2>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <p className="text-primary mb-4 text-xs font-semibold tracking-wider uppercase">
                  Position Description & Requirements
                </p>

                {activeDetailPosition.rawDoc?.description ? (
                  <RichText
                    data={activeDetailPosition.rawDoc.description}
                    className="text-fg text-base leading-relaxed"
                  />
                ) : (
                  <p className="text-fg text-base leading-relaxed">
                    {activeDetailPosition.previewText}
                  </p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="border-border bg-bg/60 flex flex-wrap items-center justify-between gap-4 border-t p-6 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setActiveDetailPosition(null)}
                  className="border-border text-fg hover:bg-muted/30 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(activeDetailPosition.title)}
                  className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg focus-visible:outline-none"
                >
                  <CheckCircle size={16} />
                  Apply for this Position
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
