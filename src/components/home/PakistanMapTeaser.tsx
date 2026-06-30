import Link from 'next/link'
import { Map } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

interface PakistanMapTeaserProps {
  siteCount: number
}

// Real province paths projected from geographic coordinates into a 300×340 viewBox
// Pakistan bounding box: lon 60–77°E, lat 23–37°N
// Scale: x=(lon-60)*17.6  y=(37-lat)*24.3
const PROVINCE_PATHS = {
  // KPK (Khyber Pakhtunkhwa) — northwest
  kpk: 'M 198,15 L 212,12 L 228,18 L 238,30 L 242,48 L 235,60 L 220,65 L 210,75 L 200,85 L 188,90 L 178,80 L 172,68 L 175,52 L 185,38 Z',
  // Gilgit-Baltistan — north
  gb: 'M 198,15 L 212,12 L 228,18 L 238,30 L 260,22 L 278,10 L 290,5 L 298,15 L 292,30 L 280,38 L 265,42 L 250,48 L 242,48 L 235,60 L 220,65 Z',
  // Azad Kashmir — northeast
  ak: 'M 242,48 L 260,22 L 278,10 L 285,28 L 275,42 L 265,55 L 252,60 L 242,62 Z',
  // Punjab — center-east
  punjab:
    'M 178,80 L 188,90 L 200,85 L 210,75 L 220,65 L 235,60 L 252,60 L 265,75 L 268,95 L 260,115 L 248,130 L 230,140 L 210,145 L 192,138 L 178,125 L 172,108 L 175,92 Z',
  // Sindh — southeast
  sindh:
    'M 178,125 L 192,138 L 210,145 L 228,158 L 235,178 L 228,205 L 210,225 L 192,238 L 172,242 L 155,232 L 145,215 L 148,192 L 158,172 L 165,152 L 172,138 Z',
  // Balochistan — southwest (largest)
  balochistan:
    'M 42,92 L 58,78 L 75,68 L 95,65 L 115,62 L 135,65 L 155,72 L 172,68 L 175,92 L 172,108 L 178,125 L 172,138 L 165,152 L 158,172 L 148,192 L 145,215 L 135,228 L 118,235 L 98,238 L 78,225 L 62,208 L 48,188 L 38,165 L 32,140 L 35,115 L 42,92 Z',
  // FATA/merged districts (part of KPK)
  fata: 'M 135,65 L 155,72 L 172,68 L 175,52 L 185,38 L 175,30 L 158,28 L 142,32 L 130,42 L 128,55 Z',
}

// Study site: Peshawar (KMU) — lon 71.5°E, lat 34.0°N
// x = (71.5-60)*17.6 = 202.4 ≈ 202, y = (37-34)*24.3 = 72.9 ≈ 73
const PESHAWAR = { cx: 202, cy: 73, label: 'Peshawar, KPK', sublabel: 'KMU — NOG Lab' }

export function PakistanMapTeaser({ siteCount }: PakistanMapTeaserProps) {
  return (
    <Section
      className="bg-bg relative overflow-hidden py-10 md:py-16"
      aria-label="Study sites map preview"
    >
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 75% 50%, rgba(14,110,110,0.05), transparent 70%)',
        }}
      />

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
              className="relative mx-auto max-w-sm"
              aria-label={`Map of Pakistan highlighting ${siteCount} study site${siteCount !== 1 ? 's' : ''} — NOG Lab operates from Peshawar, KPK`}
              role="img"
            >
              <svg
                viewBox="0 0 340 280"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  {/* Province fill gradient */}
                  <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0E6E6E" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0E6E6E" stopOpacity="0.08" />
                  </linearGradient>
                  {/* KPK highlight */}
                  <linearGradient id="kpkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0E6E6E" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0E6E6E" stopOpacity="0.30" />
                  </linearGradient>
                  {/* Marker glow */}
                  <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E2725B" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#E2725B" stopOpacity="0" />
                  </radialGradient>
                  {/* Drop shadow */}
                  <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="3"
                      floodColor="#0E6E6E"
                      floodOpacity="0.18"
                    />
                  </filter>
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Grid lines (subtle graticule) */}
                {[0, 60, 120, 180, 240, 300].map((x) => (
                  <line
                    key={`vg${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="280"
                    stroke="#0E6E6E"
                    strokeOpacity="0.06"
                    strokeWidth="1"
                  />
                ))}
                {[0, 56, 112, 168, 224, 280].map((y) => (
                  <line
                    key={`hg${y}`}
                    x1="0"
                    y1={y}
                    x2="340"
                    y2={y}
                    stroke="#0E6E6E"
                    strokeOpacity="0.06"
                    strokeWidth="1"
                  />
                ))}

                {/* Province fills */}
                <path
                  d={PROVINCE_PATHS.balochistan}
                  fill="url(#mapGrad)"
                  stroke="#0E6E6E"
                  strokeWidth="1"
                  strokeOpacity="0.35"
                  strokeLinejoin="round"
                  filter="url(#mapShadow)"
                />
                <path
                  d={PROVINCE_PATHS.punjab}
                  fill="url(#mapGrad)"
                  stroke="#0E6E6E"
                  strokeWidth="1"
                  strokeOpacity="0.35"
                  strokeLinejoin="round"
                />
                <path
                  d={PROVINCE_PATHS.sindh}
                  fill="url(#mapGrad)"
                  stroke="#0E6E6E"
                  strokeWidth="1"
                  strokeOpacity="0.35"
                  strokeLinejoin="round"
                />
                <path
                  d={PROVINCE_PATHS.gb}
                  fill="url(#mapGrad)"
                  stroke="#0E6E6E"
                  strokeWidth="1"
                  strokeOpacity="0.35"
                  strokeLinejoin="round"
                />
                <path
                  d={PROVINCE_PATHS.ak}
                  fill="url(#mapGrad)"
                  stroke="#0E6E6E"
                  strokeWidth="1"
                  strokeOpacity="0.25"
                  strokeLinejoin="round"
                />
                <path
                  d={PROVINCE_PATHS.fata}
                  fill="url(#mapGrad)"
                  stroke="#0E6E6E"
                  strokeWidth="0.8"
                  strokeOpacity="0.2"
                  strokeLinejoin="round"
                />

                {/* KPK — highlighted as active province */}
                <path
                  d={PROVINCE_PATHS.kpk}
                  fill="url(#kpkGrad)"
                  stroke="#0E6E6E"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                  strokeLinejoin="round"
                />

                {/* Peshawar marker — pulsing glow */}
                <circle
                  cx={PESHAWAR.cx}
                  cy={PESHAWAR.cy}
                  r="20"
                  fill="url(#markerGlow)"
                  className="motion-safe:animate-ping"
                  style={{ animationDuration: '2.8s' }}
                />
                <circle
                  cx={PESHAWAR.cx}
                  cy={PESHAWAR.cy}
                  r="10"
                  fill="#E2725B"
                  fillOpacity="0.18"
                />
                <circle
                  cx={PESHAWAR.cx}
                  cy={PESHAWAR.cy}
                  r="5.5"
                  fill="#E2725B"
                  fillOpacity="0.9"
                />
                <circle cx={PESHAWAR.cx} cy={PESHAWAR.cy} r="2.5" fill="white" fillOpacity="0.95" />

                {/* Connector line to label */}
                <line
                  x1={PESHAWAR.cx}
                  y1={PESHAWAR.cy - 6}
                  x2={PESHAWAR.cx + 18}
                  y2={PESHAWAR.cy - 22}
                  stroke="#E2725B"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                  strokeDasharray="2 2"
                />

                {/* Label callout */}
                <rect
                  x={PESHAWAR.cx + 18}
                  y={PESHAWAR.cy - 38}
                  width="90"
                  height="30"
                  rx="5"
                  fill="#0E6E6E"
                  fillOpacity="0.88"
                />
                <text
                  x={PESHAWAR.cx + 22}
                  y={PESHAWAR.cy - 24}
                  fill="white"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  Peshawar, KPK
                </text>
                <text
                  x={PESHAWAR.cx + 22}
                  y={PESHAWAR.cy - 14}
                  fill="white"
                  fontSize="6"
                  fontWeight="400"
                  fontFamily="system-ui, sans-serif"
                  opacity="0.8"
                >
                  KMU — NOG Lab
                </text>

                {/* Map title */}
                <text
                  x="170"
                  y="268"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#0E6E6E"
                  fillOpacity="0.55"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.08em"
                  fontWeight="500"
                >
                  PAKISTAN — {siteCount} ACTIVE RESEARCH {siteCount === 1 ? 'SITE' : 'SITES'}
                </text>

                {/* North indicator */}
                <text
                  x="312"
                  y="22"
                  fontSize="8"
                  fill="#0E6E6E"
                  fillOpacity="0.5"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  N
                </text>
                <line
                  x1="312"
                  y1="25"
                  x2="312"
                  y2="38"
                  stroke="#0E6E6E"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                />
                <polygon points="312,25 309,33 315,33" fill="#0E6E6E" fillOpacity="0.45" />
              </svg>
            </div>
          </FadeUp>
        </div>
      </Container>
    </Section>
  )
}
