import Link from 'next/link'
import { Map } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

interface PakistanMapTeaserProps {
  siteCount: number
}

// SVG paths projected from real GeoJSON (pakistan-boundaries.geojson)
// ViewBox: 0 0 300 320, PAD=12
// Projection: equirectangular, lon 60.87–77.5°E, lat 23.6–37.1°N
const PROVINCES = [
  {
    code: 'bal',
    name: 'Balochistan',
    active: false,
    d: 'M 12.0,177.1 L 12.5,233.5 L 30.8,275.1 L 55.6,299.2 L 88.8,303.6 L 122.0,303.6 L 146.9,294.8 L 160.2,266.3 L 166.8,222.5 L 163.5,178.6 L 155.2,145.7 L 138.6,134.8 L 122.0,123.8 L 80.5,134.8 L 55.6,139.2 L 39.1,145.7 L 22.5,156.7 Z',
  },
  {
    code: 'sin',
    name: 'Sindh',
    active: false,
    d: 'M 122.0,303.6 L 146.9,308.0 L 180.1,299.2 L 183.4,266.3 L 180.1,233.5 L 166.8,222.5 L 160.2,266.3 L 146.9,294.8 Z',
  },
  {
    code: 'pun',
    name: 'Punjab',
    active: false,
    d: 'M 166.8,222.5 L 180.1,233.5 L 183.4,266.3 L 213.3,244.4 L 238.2,222.5 L 253.1,167.7 L 238.2,112.9 L 221.6,90.9 L 205.0,80.0 L 188.4,90.9 L 171.8,101.9 L 155.2,134.8 L 155.2,145.7 L 163.5,178.6 Z',
  },
  {
    code: 'ajk',
    name: 'AJK',
    active: false,
    d: 'M 213.3,90.9 L 221.6,90.9 L 229.9,101.9 L 238.2,90.9 L 241.5,69.0 L 238.2,58.0 L 229.9,53.7 L 221.6,58.0 L 213.3,69.0 Z',
  },
  {
    code: 'gb',
    name: 'Gilgit-Baltistan',
    active: false,
    d: 'M 196.7,25.2 L 205.0,36.1 L 213.3,47.1 L 221.6,58.0 L 229.9,53.7 L 238.2,58.0 L 241.5,69.0 L 246.5,62.4 L 263.1,47.1 L 279.7,36.1 L 288.0,18.6 L 263.1,12.0 L 238.2,12.0 L 213.3,18.6 Z',
  },
  {
    code: 'kpk',
    name: 'Khyber Pakhtunkhwa',
    active: true, // NOG Lab province
    d: 'M 155.2,145.7 L 155.2,134.8 L 171.8,101.9 L 188.4,90.9 L 205.0,80.0 L 213.3,69.0 L 213.3,47.1 L 205.0,36.1 L 196.7,25.2 L 180.1,25.2 L 163.5,25.2 L 146.9,47.1 L 138.6,80.0 L 130.3,112.9 L 122.0,123.8 L 138.6,134.8 Z',
  },
]

// Peshawar (KMU) — lon 71.5°E, lat 34.0°N → (188.4, 80.0)
const PESHAWAR = { cx: 188.4, cy: 80.0 }

export function PakistanMapTeaser({ siteCount }: PakistanMapTeaserProps) {
  return (
    <Section
      className="bg-bg relative overflow-hidden py-10 md:py-16"
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
              <p className="text-muted mb-6 leading-relaxed">
                Our research is anchored at{' '}
                <strong className="text-fg font-semibold">
                  Khyber Medical University, Peshawar
                </strong>{' '}
                — spanning <strong className="text-fg font-semibold">{siteCount}</strong>{' '}
                {siteCount === 1 ? 'active study site' : 'active study sites'} and generating
                population‑level microbiome data across KPK and beyond.
              </p>

              {/* Active site card */}
              <div className="border-border bg-surface mb-6 flex items-start gap-3 rounded-xl border p-4">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(14,110,110,0.12)' }}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: '#0E6E6E' }}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="text-fg text-sm font-semibold">Peshawar — KMU Campus</p>
                  <p className="text-muted text-xs">
                    Institute of Basic Medical Sciences, Hayat Abad Phase 5
                  </p>
                </div>
              </div>

              <Link
                href="/research?view=map"
                className={cn(
                  'text-primary inline-flex items-center gap-2 text-sm font-semibold',
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
              className="relative mx-auto max-w-[300px]"
              aria-label={`Map of Pakistan showing ${siteCount} active study site${siteCount !== 1 ? 's' : ''} in Khyber Pakhtunkhwa`}
              role="img"
            >
              <svg
                viewBox="0 0 300 320"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full drop-shadow-sm"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <linearGradient id="provGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0E6E6E" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0E6E6E" stopOpacity="0.07" />
                  </linearGradient>
                  <linearGradient id="kpkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0E6E6E" stopOpacity="0.50" />
                    <stop offset="100%" stopColor="#0E6E6E" stopOpacity="0.28" />
                  </linearGradient>
                  <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E2725B" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#E2725B" stopOpacity="0" />
                  </radialGradient>
                  <filter id="provShadow">
                    <feDropShadow
                      dx="0"
                      dy="1"
                      stdDeviation="2"
                      floodColor="#0E6E6E"
                      floodOpacity="0.12"
                    />
                  </filter>
                </defs>

                {/* Province fills — inactive */}
                {PROVINCES.filter((p) => !p.active).map((p) => (
                  <path
                    key={p.code}
                    d={p.d}
                    fill="url(#provGrad)"
                    stroke="#0E6E6E"
                    strokeWidth="1.2"
                    strokeOpacity="0.35"
                    strokeLinejoin="round"
                  />
                ))}

                {/* KPK — highlighted */}
                {PROVINCES.filter((p) => p.active).map((p) => (
                  <path
                    key={p.code}
                    d={p.d}
                    fill="url(#kpkGrad)"
                    stroke="#0E6E6E"
                    strokeWidth="1.8"
                    strokeOpacity="0.75"
                    strokeLinejoin="round"
                    filter="url(#provShadow)"
                  />
                ))}

                {/* Peshawar pulse rings */}
                <circle
                  cx={PESHAWAR.cx}
                  cy={PESHAWAR.cy}
                  r="18"
                  fill="url(#markerGlow)"
                  className="motion-safe:animate-ping"
                  style={{
                    animationDuration: '2.5s',
                    transformOrigin: `${PESHAWAR.cx}px ${PESHAWAR.cy}px`,
                  }}
                />
                <circle cx={PESHAWAR.cx} cy={PESHAWAR.cy} r="9" fill="#E2725B" fillOpacity="0.15" />
                <circle cx={PESHAWAR.cx} cy={PESHAWAR.cy} r="5" fill="#E2725B" fillOpacity="0.92" />
                <circle cx={PESHAWAR.cx} cy={PESHAWAR.cy} r="2.2" fill="white" fillOpacity="0.95" />

                {/* Callout line + label */}
                <line
                  x1={PESHAWAR.cx + 5}
                  y1={PESHAWAR.cy - 5}
                  x2={PESHAWAR.cx + 22}
                  y2={PESHAWAR.cy - 22}
                  stroke="#E2725B"
                  strokeWidth="1"
                  strokeOpacity="0.7"
                  strokeDasharray="2 2"
                />
                <rect
                  x={PESHAWAR.cx + 22}
                  y={PESHAWAR.cy - 38}
                  width="88"
                  height="28"
                  rx="5"
                  fill="#0E6E6E"
                  fillOpacity="0.92"
                />
                <text
                  x={PESHAWAR.cx + 27}
                  y={PESHAWAR.cy - 24}
                  fill="white"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  Peshawar, KPK
                </text>
                <text
                  x={PESHAWAR.cx + 27}
                  y={PESHAWAR.cy - 14}
                  fill="white"
                  fontSize="6"
                  fontFamily="system-ui, sans-serif"
                  opacity="0.8"
                >
                  KMU — NOG Lab
                </text>

                {/* North arrow */}
                <text
                  x="285"
                  y="24"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="700"
                  fill="#0E6E6E"
                  fillOpacity="0.55"
                  fontFamily="system-ui, sans-serif"
                >
                  N
                </text>
                <line
                  x1="285"
                  y1="27"
                  x2="285"
                  y2="38"
                  stroke="#0E6E6E"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
                <polygon points="285,27 282.5,34 287.5,34" fill="#0E6E6E" fillOpacity="0.4" />

                {/* Caption */}
                <text
                  x="150"
                  y="316"
                  textAnchor="middle"
                  fontSize="7.5"
                  fill="#0E6E6E"
                  fillOpacity="0.5"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.06em"
                  fontWeight="500"
                >
                  PAKISTAN — {siteCount} ACTIVE RESEARCH {siteCount === 1 ? 'SITE' : 'SITES'}
                </text>
              </svg>
            </div>
          </FadeUp>
        </div>
      </Container>
    </Section>
  )
}
