import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Microscope,
  FlaskConical,
  Dna,
  Activity,
  TestTube,
  Atom,
  Quote,
} from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { lexicalToText } from '@/lib/richtext'
import { cn } from '@/lib/utils'
import type { About, Media, ResearchTheme } from '../../../payload-types'

// Lucide icon map — matches the icon field values stored in ResearchThemes
const ICON_MAP: Record<string, React.ElementType> = {
  microscope: Microscope,
  'flask-conical': FlaskConical,
  dna: Dna,
  activity: Activity,
  'test-tube': TestTube,
  atom: Atom,
}

// Fallback pillars used only when no ResearchThemes exist in the CMS
const FALLBACK_PILLARS = [
  {
    icon: Microscope,
    name: 'Oral Microbiome',
    body: 'Linking oral bacterial dysbiosis to systemic metabolic and cardiovascular risk.',
  },
  {
    icon: FlaskConical,
    name: 'Gut Health',
    body: 'Population-scale profiling of gut flora across diverse Pakistani communities.',
  },
  {
    icon: Dna,
    name: 'Nutrition Science',
    body: 'Dietary pattern interventions and their downstream effect on host microbiota.',
  },
]

interface AboutTeaserProps {
  about: About | null
  themes: ResearchTheme[]
}

export function AboutTeaser({ about, themes }: AboutTeaserProps) {
  const portrait =
    about?.directorPortrait && typeof about.directorPortrait === 'object'
      ? (about.directorPortrait as Media)
      : null

  const missionText = about?.mission
    ? lexicalToText(about.mission as Parameters<typeof lexicalToText>[0], ' ')
    : null

  const directorQuote = about?.directorMessage
    ? lexicalToText(about.directorMessage as Parameters<typeof lexicalToText>[0], ' ').slice(0, 220)
    : null

  // Use live themes (up to 3); fall back to hardcoded pillars only if CMS has none
  const pillars =
    themes.length > 0
      ? themes.slice(0, 3).map((t) => ({
          icon: ICON_MAP[t.icon ?? ''] ?? Microscope,
          name: t.name,
          body: lexicalToText(t.description as Parameters<typeof lexicalToText>[0], ' ').slice(
            0,
            120,
          ),
          color: t.color,
        }))
      : FALLBACK_PILLARS.map((p) => ({ ...p, color: 'var(--color-teal)' }))

  return (
    <Section className="bg-surface relative overflow-hidden py-10 md:py-16">
      {/* Subtle teal corner accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-64 w-64 opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, var(--color-teal) 0%, transparent 70%)' }}
      />

      <Container className="relative z-10">
        {/* Header row */}
        <FadeUp>
          <div className="mb-12">
            <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
              Who we are
            </p>
            <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">About the Lab</h2>
          </div>
        </FadeUp>

        {/* Two-column: portrait + mission text */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* Left: portrait or SEM fallback */}
          <FadeUp delay={0.05}>
            {portrait ? (
              <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl">
                <MediaImage
                  doc={portrait}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover object-top"
                />
                <div className="from-surface/80 absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent" />
              </div>
            ) : (
              <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl">
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

          {/* Right: mission + pillars + director quote */}
          <FadeUp delay={0.1}>
            <div className="flex flex-col justify-center gap-8">
              {missionText && (
                <p className="text-muted line-clamp-5 text-lg leading-relaxed">{missionText}</p>
              )}

              {/* Research pillars — driven by ResearchThemes from CMS */}
              <ul className="grid gap-5" role="list">
                {pillars.map(({ icon: Icon, name, body, color }) => (
                  <li key={name} className="flex items-start gap-4">
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
                    >
                      <Icon size={18} style={{ color }} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-fg font-semibold">{name}</p>
                      {body && <p className="text-muted mt-0.5 text-sm leading-relaxed">{body}</p>}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Director's voice — pull-quote without repeating the portrait */}
              {directorQuote && (
                <blockquote className="border-primary/30 bg-primary/5 relative rounded-xl border-l-4 px-5 py-4">
                  <Quote size={16} className="text-primary/40 mb-2" aria-hidden="true" />
                  <p className="text-muted text-sm leading-relaxed italic">
                    {directorQuote}
                    {directorQuote.length >= 220 ? '…' : ''}
                  </p>
                </blockquote>
              )}

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
