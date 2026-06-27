'use client'

import { motion } from 'framer-motion'
import { Building2, ExternalLink } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import type { Collaborator, Media } from '../../../payload-types'

interface PartnerStripProps {
  collaborators: Collaborator[]
}

export function PartnerStrip({ collaborators }: PartnerStripProps) {
  if (!collaborators.length) return null

  return (
    <Section
      className="border-border/40 bg-surface relative overflow-hidden border-t py-12 md:py-16"
      aria-label="Partner institutions"
    >
      {/* Subtle radial gradient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, color-mix(in oklch, var(--color-teal) 6%, transparent), transparent)',
        }}
      />

      <Container className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-muted mb-10 text-center text-[10px] font-bold tracking-[0.22em] uppercase"
        >
          Research partners
        </motion.p>

        <ul
          role="list"
          aria-label="Partner and collaborator institutions"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {collaborators.map((collab, i) => {
            const logo = (collab.logo as Media | null | undefined) ?? null

            return (
              <motion.li
                key={collab.id}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
              >
                {collab.website ? (
                  <a
                    href={collab.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${collab.name} (opens in new tab)`}
                    className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <PartnerChip collab={collab} logo={logo} linked />
                  </a>
                ) : (
                  <PartnerChip collab={collab} logo={logo} linked={false} />
                )}
              </motion.li>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}

function PartnerChip({
  collab,
  logo,
  linked,
}: {
  collab: Collaborator
  logo: Media | null
  linked: boolean
}) {
  if (logo) {
    return (
      <motion.div
        className="relative h-8 w-28 grayscale transition-[filter] duration-300 hover:grayscale-0"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <MediaImage doc={logo} fill sizes="112px" className="object-contain" />
      </motion.div>
    )
  }

  return (
    <motion.span
      className="group border-border/50 bg-bg text-muted hover:border-primary/35 hover:bg-surface-raised hover:text-fg inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-250 hover:shadow-md"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      <Building2
        size={12}
        className="text-primary/35 group-hover:text-primary/60 shrink-0 transition-colors duration-200"
        aria-hidden="true"
      />
      <span className="leading-tight">{collab.name}</span>
      {linked && (
        <ExternalLink
          size={10}
          className="text-muted/40 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
    </motion.span>
  )
}
