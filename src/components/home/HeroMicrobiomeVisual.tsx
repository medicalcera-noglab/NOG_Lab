'use client'

import { motion } from 'framer-motion'

const TEAL = '#1A9090'
const CORAL = '#E2725B'
const SAND = '#E8C9A0'

// Each orbiter: which anchor point (cx,cy), orbit radius, starting angle, speed, size, color
const ORBITERS = [
  // Around head
  { cx: 140, cy: 60, r: 72, a0: 0, dur: 16, size: 4, color: CORAL, ring: true },
  { cx: 140, cy: 60, r: 72, a0: 180, dur: 16, size: 3, color: TEAL, ring: false },
  // Around upper torso / chest
  { cx: 140, cy: 200, r: 105, a0: 45, dur: 22, size: 3.5, color: TEAL, ring: true },
  { cx: 140, cy: 200, r: 105, a0: 225, dur: 22, size: 2.5, color: SAND, ring: false },
  // Around mid-body
  { cx: 140, cy: 260, r: 82, a0: 90, dur: 14, size: 3, color: CORAL, ring: false },
  { cx: 140, cy: 260, r: 82, a0: 270, dur: 14, size: 2.5, color: TEAL, ring: false },
  // Wide sweep around whole figure
  { cx: 140, cy: 230, r: 162, a0: 30, dur: 32, size: 3, color: SAND, ring: true },
  { cx: 140, cy: 230, r: 162, a0: 210, dur: 32, size: 2, color: CORAL, ring: false },
]

export function HeroMicrobiomeVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center"
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="0 0 280 460"
        width="100%"
        height="100%"
        style={{ maxWidth: '380px', overflow: 'visible' }}
      >
        {/* ── ORBITAL RINGS (visual only) ────────────────────────────── */}

        {/* Wide sweep ring */}
        <motion.ellipse
          cx={140}
          cy={230}
          rx={162}
          ry={52}
          fill="none"
          stroke={SAND}
          strokeWidth={0.6}
          opacity={0.2}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 230px' }}
        />

        {/* Torso ring – tilted */}
        <motion.ellipse
          cx={140}
          cy={200}
          rx={108}
          ry={36}
          fill="none"
          stroke={TEAL}
          strokeWidth={0.7}
          opacity={0.28}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 200px', transform: 'rotate(22deg)' }}
        />

        {/* Head ring */}
        <motion.ellipse
          cx={140}
          cy={60}
          rx={74}
          ry={28}
          fill="none"
          stroke={CORAL}
          strokeWidth={0.6}
          opacity={0.25}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 60px', transform: 'rotate(-18deg)' }}
        />

        {/* Mid-body ring */}
        <motion.ellipse
          cx={140}
          cy={260}
          rx={84}
          ry={26}
          fill="none"
          stroke={TEAL}
          strokeWidth={0.5}
          opacity={0.22}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 260px', transform: 'rotate(35deg)' }}
        />

        {/* ── HUMAN FIGURE ───────────────────────────────────────────── */}

        {/* Body glow backdrop */}
        <motion.ellipse
          cx={140}
          cy={265}
          rx={62}
          ry={138}
          fill={TEAL}
          fillOpacity={0.04}
          stroke="none"
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '140px 265px' }}
        />

        {/* Head */}
        <motion.circle
          cx={140}
          cy={60}
          r={34}
          fill={TEAL}
          fillOpacity={0.07}
          stroke={TEAL}
          strokeWidth={1.4}
          opacity={0.7}
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '140px 60px' }}
        />
        {/* Inner head dashed ring */}
        <motion.circle
          cx={140}
          cy={60}
          r={20}
          fill="none"
          stroke={TEAL}
          strokeWidth={0.6}
          strokeDasharray="3 4"
          opacity={0.3}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 60px' }}
        />

        {/* Neck */}
        <line
          x1={133}
          y1={94}
          x2={133}
          y2={110}
          stroke={TEAL}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.5}
        />
        <line
          x1={147}
          y1={94}
          x2={147}
          y2={110}
          stroke={TEAL}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Shoulders */}
        <path
          d="M 133 110 Q 108 110 82 122"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          d="M 147 110 Q 172 110 198 122"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.55}
        />

        {/* Left arm */}
        <path
          d="M 82 122 L 58 205 L 50 268"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* Right arm */}
        <path
          d="M 198 122 L 222 205 L 230 268"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Torso left/right sides */}
        <path
          d="M 86 122 L 82 215 Q 82 232 84 252 L 85 302"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M 194 122 L 198 215 Q 198 232 196 252 L 195 302"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Hip line */}
        <path
          d="M 85 302 Q 92 316 115 320"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M 195 302 Q 188 316 165 320"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />
        <line
          x1={115}
          y1={320}
          x2={165}
          y2={320}
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.45}
        />

        {/* Left leg */}
        <path
          d="M 115 320 L 108 420 L 100 452"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* Right leg */}
        <path
          d="M 165 320 L 172 420 L 180 452"
          fill="none"
          stroke={TEAL}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Spine dashed line */}
        <motion.line
          x1={140}
          y1={110}
          x2={140}
          y2={302}
          stroke={TEAL}
          strokeWidth={0.6}
          strokeDasharray="4 5"
          opacity={0.18}
          animate={{ opacity: [0.14, 0.28, 0.14] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Chest/rib ellipse hint */}
        <motion.ellipse
          cx={140}
          cy={198}
          rx={46}
          ry={60}
          fill="none"
          stroke={TEAL}
          strokeWidth={0.7}
          strokeDasharray="3 6"
          opacity={0.22}
          animate={{ scale: [1, 1.022, 1] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ transformOrigin: '140px 198px' }}
        />

        {/* ── ORBITING MOLECULE PARTICLES ───────────────────────────── */}
        {ORBITERS.map((o, i) => (
          <motion.g
            key={i}
            animate={{ rotate: [o.a0, o.a0 + 360] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${o.cx}px ${o.cy}px` }}
          >
            {/* Atom body */}
            <circle cx={o.cx + o.r} cy={o.cy} r={o.size} fill={o.color} opacity={0.85} />
            {/* Mini orbital ring on some atoms */}
            {o.ring && (
              <circle
                cx={o.cx + o.r}
                cy={o.cy}
                r={o.size * 2.5}
                fill="none"
                stroke={o.color}
                strokeWidth={0.7}
                opacity={0.45}
              />
            )}
          </motion.g>
        ))}

        {/* ── FLOATING DNA/MOLECULE ACCENTS ────────────────────────── */}
        {[
          { cx: 38, cy: 148, r: 3, color: TEAL, dy: -9, delay: 0 },
          { cx: 30, cy: 178, r: 2, color: CORAL, dy: -6, delay: 0.7 },
          { cx: 42, cy: 205, r: 2.5, color: SAND, dy: -7, delay: 1.4 },
          { cx: 242, cy: 152, r: 2.5, color: TEAL, dy: -8, delay: 0.3 },
          { cx: 250, cy: 182, r: 2, color: CORAL, dy: -6, delay: 1.1 },
          { cx: 238, cy: 210, r: 3, color: SAND, dy: -9, delay: 0.9 },
        ].map((d, i) => (
          <motion.circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.color}
            opacity={0.45}
            animate={{ y: [0, d.dy, 0], opacity: [0.45, 0.75, 0.45] }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: d.delay,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
