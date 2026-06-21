import Link from 'next/link'
import { Map } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

interface PakistanMapTeaserProps {
  siteCount: number
}

// Approximate marker positions within the SVG viewBox (decorative, not GPS-accurate)
// Placed at major study-site provinces: KPK, Punjab, Sindh, Balochistan
const MARKERS = [
  { cx: 118, cy: 68, label: 'KPK' },
  { cx: 148, cy: 112, label: 'Punjab' },
  { cx: 155, cy: 178, label: 'Sindh' },
  { cx: 90, cy: 155, label: 'Balochistan' },
  { cx: 175, cy: 55, label: 'Gilgit-Baltistan' },
] as const

export function PakistanMapTeaser({ siteCount }: PakistanMapTeaserProps) {
  return (
    <Section
      className="bg-bg relative overflow-hidden py-16 md:py-20"
      aria-label="Study sites map preview"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Text side */}
          <FadeUp>
            <div>
              <p className="text-primary mb-4 text-xs font-semibold tracking-[0.15em] uppercase">
                Where we work
              </p>
              <h2 className="font-heading text-fg mb-4 text-3xl font-bold">
                Field sites across Pakistan
              </h2>
              <p className="text-muted mb-2 leading-relaxed">
                Our research spans <strong className="text-fg font-semibold">{siteCount}</strong>{' '}
                {siteCount === 1 ? 'study site' : 'study sites'} — from urban hospitals in Peshawar
                to rural communities in Balochistan — generating population‑level microbiome data at
                scale.
              </p>
              <Link
                href="/projects?view=map"
                className={cn(
                  'text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold',
                  'transition-[gap] duration-150 hover:gap-3',
                  'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                )}
              >
                <Map size={16} aria-hidden="true" />
                View full interactive map
              </Link>
            </div>
          </FadeUp>

          {/* SVG map side */}
          <FadeUp delay={0.1}>
            <div
              className="relative mx-auto max-w-xs md:max-w-sm"
              aria-label={`Stylized map of Pakistan showing ${siteCount} study site${siteCount !== 1 ? 's' : ''}`}
              role="img"
            >
              <svg
                viewBox="0 0 240 260"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full drop-shadow-md"
                aria-hidden="true"
                focusable="false"
              >
                {/* Pakistan simplified outline */}
                <path
                  d={[
                    'M 175,22 L 188,28 L 198,38 L 200,50 L 193,60',
                    'L 200,68 L 208,80 L 205,90 L 195,95 L 185,88',
                    'L 175,98 L 165,108 L 158,120 L 162,135',
                    'L 168,148 L 165,162 L 155,172 L 148,190',
                    'L 145,208 L 138,220 L 128,228 L 118,230',
                    'L 108,222 L 100,210 L 92,195 L 82,188',
                    'L 70,182 L 60,172 L 55,158 L 52,142',
                    'L 58,128 L 65,115 L 60,102 L 52,90',
                    'L 45,78 L 42,65 L 48,54 L 58,46',
                    'L 70,42 L 80,48 L 88,58 L 98,65',
                    'L 108,60 L 115,50 L 118,40 L 125,32',
                    'L 135,26 L 148,22 L 160,20 Z',
                  ].join(' ')}
                  fill="var(--color-teal)"
                  fillOpacity="0.12"
                  stroke="var(--color-teal)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                {/* Dot markers for study-site regions */}
                {MARKERS.map((m) => (
                  <g key={m.label}>
                    {/* Outer pulse ring */}
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r="7"
                      fill="var(--color-coral)"
                      fillOpacity="0.2"
                      className="motion-safe:animate-[counter-drift_4s_ease-in-out_infinite_alternate]"
                    />
                    {/* Inner dot */}
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r="3.5"
                      fill="var(--color-coral)"
                      fillOpacity="0.85"
                    />
                  </g>
                ))}

                {/* Site count label */}
                <text
                  x="120"
                  y="250"
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--muted)"
                  fontFamily="var(--font-body)"
                >
                  {siteCount} active {siteCount === 1 ? 'site' : 'sites'}
                </text>
              </svg>
            </div>
          </FadeUp>
        </div>
      </Container>
    </Section>
  )
}
