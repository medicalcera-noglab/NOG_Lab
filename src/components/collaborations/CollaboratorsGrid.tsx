'use client'

import { motion } from 'framer-motion'
import { ExternalLink, MapPin, GraduationCap } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import type { Collaborator, Media } from '../../../payload-types'

interface CollaboratorsGridProps {
  collaborators: Collaborator[]
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  academic: {
    bg: 'color-mix(in oklch, var(--color-teal) 12%, transparent)',
    text: 'var(--color-teal)',
  },
  hospital: {
    bg: 'color-mix(in oklch, var(--color-coral) 12%, transparent)',
    text: 'var(--color-coral)',
  },
  ngo: {
    bg: 'color-mix(in oklch, var(--color-sand) 20%, transparent)',
    text: 'color-mix(in oklch, var(--color-sand) 80%, var(--fg))',
  },
  government: {
    bg: 'color-mix(in oklch, var(--color-teal) 10%, transparent)',
    text: 'var(--color-teal)',
  },
}

function getTypeStyle(type?: string | null) {
  return TYPE_COLORS[type ?? ''] ?? TYPE_COLORS.academic
}

export function CollaboratorsGrid({ collaborators }: CollaboratorsGridProps) {
  if (!collaborators.length) return null

  return (
    <ul
      role="list"
      aria-label="Collaborating institutions"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {collaborators.map((collab, i) => {
        const logo = collab.logo && typeof collab.logo === 'object' ? (collab.logo as Media) : null
        const typeStyle = getTypeStyle(collab.type)

        return (
          <motion.li
            key={collab.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.article
              className="group border-border bg-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm"
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
              style={{ willChange: 'transform' }}
            >
              {/* ── Image header ── */}
              <div className="bg-surface-raised relative h-44 overflow-hidden">
                <motion.div
                  className="h-full w-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <MediaImage
                    doc={logo}
                    seed={collab.id}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    placeholderLabel={`${collab.name} campus illustration`}
                  />
                </motion.div>

                {/* Gradient scrim */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)',
                  }}
                />

                {/* Country badge */}
                {collab.country && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                    <MapPin size={10} className="text-white/80" aria-hidden="true" />
                    <span className="text-xs font-medium text-white/90">{collab.country}</span>
                  </div>
                )}

                {/* Top-right hover glow */}
                <motion.div
                  className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, color-mix(in oklch, var(--color-teal) 35%, transparent) 0%, transparent 70%)',
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  aria-hidden="true"
                />
              </div>

              {/* ── Content ── */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                {/* Type badge */}
                {collab.type && (
                  <div
                    className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
                    style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
                  >
                    <GraduationCap size={10} aria-hidden="true" />
                    {collab.type}
                  </div>
                )}

                <h3 className="text-fg text-base leading-snug font-bold">{collab.name}</h3>

                {/* Divider */}
                <div className="border-border/50 h-px w-full border-t" />

                {/* Visit link */}
                {collab.website ? (
                  <motion.a
                    href={collab.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${collab.name} website (opens in new tab)`}
                    className="text-primary mt-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                  >
                    Visit website
                    <ExternalLink size={13} aria-hidden="true" />
                  </motion.a>
                ) : (
                  <div className="mt-auto" />
                )}
              </div>

              {/* Bottom accent line — sweeps on hover */}
              <motion.div
                className="h-[2px] rounded-b-2xl"
                style={{ backgroundColor: 'var(--color-teal)' }}
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
  )
}
