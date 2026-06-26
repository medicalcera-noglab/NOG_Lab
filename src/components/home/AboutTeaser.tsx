import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Microscope, FlaskConical, Dna } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { lexicalToText } from '@/lib/richtext'
import { cn } from '@/lib/utils'
import type { About, Media } from '../../../payload-types'

const PILLARS = [
  {
    icon: Microscope,
    title: 'Oral Microbiome',
    body: 'Linking oral bacterial dysbiosis to systemic metabolic and cardiovascular risk.',
  },
  {
    icon: FlaskConical,
    title: 'Gut Health',
    body: 'Population-scale profiling of gut flora across diverse Pakistani communities.',
  },
  {
    icon: Dna,
    title: 'Nutrition Science',
    body: 'Dietary pattern interventions and their downstream effect on host microbiota.',
  },
] as const

interface AboutTeaserProps {
  about: About | null
}

export function AboutTeaser({ about }: AboutTeaserProps) {
  const portrait =
    about?.directorPortrait && typeof about.directorPortrait === 'object'
      ? (about.directorPortrait as Media)
      : null

  const missionText = about?.mission
    ? lexicalToText(about.mission as Parameters<typeof lexicalToText>[0], ' ').slice(0, 280)
    : null

  return (
    <Section className="bg-surface relative overflow-hidden py-16 md:py-24">
      {/* Subtle teal corner accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-64 w-64 opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, var(--color-teal) 0%, transparent 70%)',
        }}
      />

      <Container className="relative z-10">
        {/* Header row */}
        <FadeUp>
          <div className="mb-12 grid grid-cols-1 items-end gap-6 md:grid-cols-2">
            <div>
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Who we are
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">About the Lab</h2>
            </div>

            <div className="flex md:justify-end">
              <Link
                href="/about"
                className={cn(
                  'text-primary inline-flex items-center gap-2 text-sm font-semibold',
                  'transition-[gap] duration-150 hover:gap-3',
                  'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                )}
              >
                Full story
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </FadeUp>

        {/* Two-column: portrait + mission text OR pillar cards */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* Left: director portrait + name, or fallback graphic */}
          <FadeUp delay={0.05}>
            {portrait ? (
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl">
                <MediaImage
                  doc={portrait}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover"
                />
                {/* Gradient overlay at bottom */}
                <div className="from-surface/80 absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent" />
              </div>
            ) : (
              /* No portrait set — show SEM lab background image */
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl">
                <Image
                  src="/media/site-hero-bg.jpg"
                  alt=""
                  fill
                  aria-hidden="true"
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover"
                  style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, color-mix(in oklch, #0E6E6E 40%, transparent) 0%, transparent 70%)',
                  }}
                />
                <div className="from-surface/70 absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent" />
              </div>
            )}
          </FadeUp>

          {/* Right: mission + pillars */}
          <FadeUp delay={0.1}>
            <div className="flex flex-col justify-center gap-8">
              {missionText && (
                <p className="text-muted text-lg leading-relaxed">
                  {missionText}
                  {missionText.length >= 280 ? '…' : ''}
                </p>
              )}

              {/* Research pillars */}
              <ul className="grid gap-5" role="list">
                {PILLARS.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="bg-primary/10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon size={18} className="text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-fg font-semibold">{title}</p>
                      <p className="text-muted mt-0.5 text-sm leading-relaxed">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href="/research"
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
                  'bg-primary text-white',
                  'w-fit transition-opacity duration-150 hover:opacity-90',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                )}
              >
                Explore our research
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </Container>
    </Section>
  )
}
