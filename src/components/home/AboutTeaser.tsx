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
    <Section className="bg-surface relative overflow-hidden py-14 md:py-24">
      {/* Subtle teal corner accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-96 w-96 opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, var(--color-teal) 0%, transparent 70%)' }}
      />

      <Container className="relative z-10">
        {/* Header row */}
        <FadeUp>
          <div className="mb-10">
            <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
              Who we are
            </p>
            <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">About the Lab</h2>
          </div>
        </FadeUp>

        {/* Two-column: NOG Lab graphic + mission text — stretch so both columns match height */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-stretch md:gap-14">
          {/* Left: NOG Lab research graphic — stretches to full column height */}
          <FadeUp delay={0.05} className="md:h-full">
            <div
              className="relative w-full overflow-hidden rounded-2xl shadow-lg md:h-full"
              style={{
                minHeight: '320px',
                background:
                  'linear-gradient(145deg, color-mix(in oklch, var(--color-teal) 5%, white) 0%, white 55%, color-mix(in oklch, var(--color-sand) 8%, white) 100%)',
              }}
            >
              <Image
                src="/nog-lab-graphic.png"
                alt="NOG Lab — Nutrition, Oral, Gut Microbiome research illustration"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-8"
                priority
              />
            </div>
          </FadeUp>

          {/* Right: mission + pillars + director quote */}
          <FadeUp delay={0.1}>
            <div className="flex flex-col justify-center gap-7">
              {missionText && (
                <p className="text-muted line-clamp-6 text-base leading-relaxed md:text-lg">
                  {missionText}
                </p>
              )}

              {/* Research pillars — driven by ResearchThemes from CMS */}
              <ul className="grid gap-4" role="list">
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
