/**
 * Deterministic microbiome-themed SVG placeholder system.
 *
 * Four variants evoke different microscopy / micrograph aesthetics:
 *   0 – CellField      : phase-contrast colony clusters
 *   1 – DriftingDots   : DAPI-stained particle field
 *   2 – GradientMembrane: electron-microscopy membrane cross-section
 *   3 – MicrographTexture: confocal biofilm network
 *
 * All colours reference CSS custom properties so the SVG responds to the
 * active theme (light / dark) automatically.  No hex codes here.
 */
import { cn } from '@/lib/utils'

// ─── Seed hashing ────────────────────────────────────────────────────────────

/** FNV-1a 32-bit hash → unsigned 32-bit int */
function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0
  }
  return h
}

/**
 * Extract `n` pseudo-random byte-values (0-255) from a seed.
 * Deterministic: same seed always returns the same array.
 */
function seedBytes(seed: string | number, n: number): number[] {
  const bytes: number[] = []
  let h = fnv1a(String(seed))
  while (bytes.length < n) {
    // One more FNV pass to spread the bits
    h = fnv1a(String(h))
    bytes.push(h & 0xff, (h >>> 8) & 0xff, (h >>> 16) & 0xff, (h >>> 24) & 0xff)
  }
  return bytes.slice(0, n)
}

// ─── SVG variant sub-components ─────────────────────────────────────────────
// All viewBox coordinates are on a 400 × 300 canvas.
// CSS variable references (e.g. var(--color-teal)) resolve against the
// document's cascade, making every variant fully theme-aware.

type VProps = { uid: string }

function CellField({ uid }: VProps) {
  // Suppress uid warning — kept for gradient-ID consistency across variants
  void uid
  return (
    <>
      {/* Large cells — filled + outlined */}
      <circle cx="130" cy="130" r="48" fill="var(--color-teal)" fillOpacity="0.12" />
      <circle
        cx="130"
        cy="130"
        r="48"
        fill="none"
        stroke="var(--color-teal)"
        strokeOpacity="0.38"
        strokeWidth="1.5"
      />
      <circle cx="285" cy="98" r="38" fill="var(--color-teal)" fillOpacity="0.14" />
      <circle
        cx="285"
        cy="98"
        r="38"
        fill="none"
        stroke="var(--color-teal)"
        strokeOpacity="0.40"
        strokeWidth="1.5"
      />
      <circle cx="238" cy="225" r="30" fill="var(--color-teal)" fillOpacity="0.12" />
      <circle
        cx="238"
        cy="225"
        r="30"
        fill="none"
        stroke="var(--color-teal)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      {/* Nuclei */}
      <circle cx="130" cy="130" r="13" fill="var(--color-teal)" fillOpacity="0.40" />
      <circle cx="285" cy="98" r="10" fill="var(--color-teal)" fillOpacity="0.42" />
      <circle cx="238" cy="225" r="9" fill="var(--color-sand)" fillOpacity="0.40" />
      {/* Satellite cells */}
      <circle cx="72" cy="175" r="18" fill="var(--color-sand)" fillOpacity="0.20" />
      <circle
        cx="72"
        cy="175"
        r="18"
        fill="none"
        stroke="var(--color-sand)"
        strokeOpacity="0.30"
        strokeWidth="1.2"
      />
      <circle cx="72" cy="175" r="5" fill="var(--color-sand)" fillOpacity="0.38" />
      <circle cx="168" cy="70" r="14" fill="var(--color-sand)" fillOpacity="0.18" />
      <circle
        cx="168"
        cy="70"
        r="14"
        fill="none"
        stroke="var(--color-sand)"
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />
      <circle cx="340" cy="168" r="12" fill="var(--color-teal)" fillOpacity="0.20" />
      <circle
        cx="340"
        cy="168"
        r="12"
        fill="none"
        stroke="var(--color-teal)"
        strokeOpacity="0.32"
        strokeWidth="1.2"
      />
      <circle cx="192" cy="268" r="10" fill="var(--color-sand)" fillOpacity="0.22" />
      {/* Tiny spores */}
      <circle cx="202" cy="152" r="4" fill="var(--color-teal)" fillOpacity="0.28" />
      <circle cx="100" cy="218" r="3" fill="var(--color-teal)" fillOpacity="0.25" />
      <circle cx="315" cy="142" r="3.5" fill="var(--color-sand)" fillOpacity="0.28" />
      <circle cx="50" cy="82" r="3" fill="var(--color-teal)" fillOpacity="0.22" />
    </>
  )
}

function DriftingDots({ uid }: VProps) {
  void uid
  // Hand-placed dot positions that evoke DAPI nuclear staining
  const large = [
    { cx: 85, cy: 88, r: 14, coral: false },
    { cx: 215, cy: 172, r: 16, coral: false },
    { cx: 328, cy: 80, r: 12, coral: true },
    { cx: 158, cy: 252, r: 13, coral: false },
    { cx: 352, cy: 215, r: 11, coral: true },
  ]
  const medium = [
    { cx: 45, cy: 175, r: 7 },
    { cx: 125, cy: 152, r: 6 },
    { cx: 172, cy: 58, r: 8 },
    { cx: 262, cy: 128, r: 7 },
    { cx: 295, cy: 252, r: 6 },
    { cx: 378, cy: 140, r: 5 },
    { cx: 55, cy: 262, r: 6 },
    { cx: 198, cy: 102, r: 5 },
    { cx: 370, cy: 278, r: 4.5 },
    { cx: 98, cy: 42, r: 6 },
  ]
  const tiny = [
    { cx: 142, cy: 192, r: 3 },
    { cx: 268, cy: 62, r: 3.5 },
    { cx: 312, cy: 172, r: 2.5 },
    { cx: 30, cy: 118, r: 3 },
    { cx: 378, cy: 28, r: 2.5 },
    { cx: 242, cy: 288, r: 3 },
    { cx: 62, cy: 232, r: 2.5 },
    { cx: 192, cy: 218, r: 3 },
    { cx: 148, cy: 122, r: 2.5 },
    { cx: 318, cy: 298, r: 2 },
  ]
  return (
    <>
      {large.map(({ cx, cy, r, coral }, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={coral ? 'var(--color-coral)' : 'var(--color-teal)'}
          fillOpacity={coral ? 0.35 : 0.3}
        />
      ))}
      {medium.map(({ cx, cy, r }, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={i % 4 === 1 ? 'var(--color-coral)' : 'var(--color-teal)'}
          fillOpacity={0.25}
        />
      ))}
      {tiny.map(({ cx, cy, r }, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="var(--color-teal)" fillOpacity={0.2} />
      ))}
    </>
  )
}

function GradientMembrane({ uid }: VProps) {
  const gId = `ph-gm-${uid}`
  const rings = [
    { rx: 178, ry: 136, op: 0.3 },
    { rx: 144, ry: 108, op: 0.27 },
    { rx: 110, ry: 80, op: 0.25 },
    { rx: 76, ry: 54, op: 0.23 },
    { rx: 42, ry: 28, op: 0.21 },
  ]
  return (
    <>
      <defs>
        <radialGradient id={gId} cx="50%" cy="44%" r="55%">
          <stop offset="0%" stopColor="var(--color-teal)" stopOpacity="0.28" />
          <stop offset="42%" stopColor="var(--color-teal)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Soft central fill */}
      <ellipse cx="200" cy="148" rx="145" ry="108" fill={`url(#${gId})`} />
      {/* Concentric rings */}
      {rings.map(({ rx, ry, op }, i) => (
        <ellipse
          key={i}
          cx="200"
          cy="148"
          rx={rx}
          ry={ry}
          fill="none"
          stroke="var(--color-teal)"
          strokeOpacity={op}
          strokeWidth="1.5"
        />
      ))}
      {/* Membrane particles */}
      <circle cx="312" cy="82" r="5" fill="var(--color-teal)" fillOpacity="0.20" />
      <circle cx="92" cy="240" r="4" fill="var(--color-teal)" fillOpacity="0.18" />
      <circle cx="345" cy="222" r="3.5" fill="var(--color-teal)" fillOpacity="0.20" />
      <circle cx="54" cy="64" r="3" fill="var(--color-sand)" fillOpacity="0.22" />
      <circle cx="175" cy="272" r="4" fill="var(--color-sand)" fillOpacity="0.18" />
      <circle cx="358" cy="148" r="3" fill="var(--color-teal)" fillOpacity="0.16" />
      <circle cx="42" cy="148" r="3" fill="var(--color-teal)" fillOpacity="0.16" />
    </>
  )
}

function MicrographTexture({ uid }: VProps) {
  void uid
  const nodes = [
    { x: 110, y: 95 },
    { x: 262, y: 74 },
    { x: 342, y: 175 },
    { x: 272, y: 252 },
    { x: 128, y: 242 },
    { x: 54, y: 165 },
  ]
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 0],
    [0, 2],
    [1, 4],
    [3, 5],
  ]
  const bgDots = [
    [200, 150],
    [155, 58],
    [322, 114],
    [375, 242],
    [46, 242],
    [200, 272],
    [90, 34],
    [308, 292],
  ]
  return (
    <>
      {/* Background stipple */}
      {bgDots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="var(--color-teal)" fillOpacity="0.11" />
      ))}
      {/* Edges — quadratic bezier */}
      {edges.map(([a, b], i) => {
        const p1 = nodes[a],
          p2 = nodes[b]
        const cpx = (p1.x + p2.x) / 2 + (p1.y - p2.y) * 0.2
        const cpy = (p1.y + p2.y) / 2 + (p2.x - p1.x) * 0.2
        return (
          <path
            key={i}
            d={`M ${p1.x} ${p1.y} Q ${cpx} ${cpy} ${p2.x} ${p2.y}`}
            fill="none"
            stroke="var(--color-teal)"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />
        )
      })}
      {/* Node halos */}
      {nodes.map((n, i) => (
        <circle
          key={`h${i}`}
          cx={n.x}
          cy={n.y}
          r="18"
          fill="none"
          stroke={i % 2 === 0 ? 'var(--color-teal)' : 'var(--color-sand)'}
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={`n${i}`}
          cx={n.x}
          cy={n.y}
          r="10"
          fill={i % 2 === 0 ? 'var(--color-teal)' : 'var(--color-sand)'}
          fillOpacity="0.40"
        />
      ))}
      {/* Central hub */}
      <circle cx="200" cy="156" r="5" fill="var(--color-teal)" fillOpacity="0.50" />
    </>
  )
}

// ─── Public component ────────────────────────────────────────────────────────

interface PlaceholderSvgProps {
  /**
   * Seed for deterministic variant + orientation selection.
   * Pass the record's id (number) or slug (string).
   */
  seed?: string | number
  /**
   * Override the variant selected by the seed.
   * Useful when you need a specific illustration regardless of seed.
   */
  forceVariant?: 0 | 1 | 2 | 3
  className?: string
}

/**
 * Renders one of 4 microbiome-style SVG illustrations, picked and oriented
 * deterministically from the seed.  Fully theme-aware via CSS variables.
 * Always aria-hidden — decorative only.
 */
export function PlaceholderSvg({ seed = 0, forceVariant, className }: PlaceholderSvgProps) {
  const b = seedBytes(seed, 6)

  const variant = forceVariant !== undefined ? forceVariant : ((b[0] % 4) as 0 | 1 | 2 | 3)
  const rot = (b[1] % 60) - 30 // −30 … +29 °
  const dx = (b[2] % 40) - 20 // −20 … +19 canvas units
  const dy = (b[3] % 30) - 15 // −15 … +14 canvas units

  // Short stable string for gradient / filter IDs
  const uid = fnv1a(String(seed)).toString(36).slice(-5)

  // Rotate around centre of the 400×300 canvas, with slight translation
  const transform = `translate(${200 + dx} ${150 + dy}) rotate(${rot}) translate(-200 -150)`

  return (
    <svg
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn('pointer-events-none select-none', className)}
    >
      <g transform={transform}>
        {variant === 0 && <CellField uid={uid} />}
        {variant === 1 && <DriftingDots uid={uid} />}
        {variant === 2 && <GradientMembrane uid={uid} />}
        {variant === 3 && <MicrographTexture uid={uid} />}
      </g>
    </svg>
  )
}

/** Deterministically pick the variant index (0-3) for a given seed. */
export function pickVariant(seed: string | number): 0 | 1 | 2 | 3 {
  const [b] = seedBytes(seed, 1)
  return (b % 4) as 0 | 1 | 2 | 3
}
