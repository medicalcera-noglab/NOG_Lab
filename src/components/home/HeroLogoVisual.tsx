'use client'

import { motion } from 'framer-motion'

const TEAL = '#0E6E6E'
const CORAL = '#E2725B'
const SAND = '#E8C9A0'

export function HeroLogoVisual() {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 320 320"
        width="100%"
        height="100%"
        style={{ maxWidth: '360px', overflow: 'visible' }}
      >
        {/* Outer slow ring */}
        <motion.ellipse
          cx={160}
          cy={160}
          rx={148}
          ry={52}
          fill="none"
          stroke={SAND}
          strokeWidth={1}
          opacity={0.35}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px', transform: 'rotate(-12deg)' }}
        />

        {/* Mid teal ring */}
        <motion.ellipse
          cx={160}
          cy={160}
          rx={118}
          ry={40}
          fill="none"
          stroke={TEAL}
          strokeWidth={1.2}
          opacity={0.3}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px', transform: 'rotate(22deg)' }}
        />

        {/* Inner coral ring */}
        <motion.ellipse
          cx={160}
          cy={160}
          rx={88}
          ry={30}
          fill="none"
          stroke={CORAL}
          strokeWidth={0.9}
          opacity={0.28}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px', transform: 'rotate(-30deg)' }}
        />

        {/* Orbiting particles — outer ring */}
        {[
          { a0: 0, dur: 36, size: 5, color: SAND },
          { a0: 180, dur: 36, size: 3.5, color: TEAL },
        ].map((o, i) => (
          <motion.circle
            key={`outer-${i}`}
            cx={160 + 148}
            cy={160}
            r={o.size}
            fill={o.color}
            opacity={0.8}
            animate={{ rotate: [o.a0, o.a0 + 360] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '160px 160px' }}
          />
        ))}

        {/* Orbiting particles — mid ring */}
        {[
          { a0: 60, dur: 22, size: 4.5, color: TEAL },
          { a0: 240, dur: 22, size: 3, color: CORAL },
        ].map((o, i) => (
          <motion.circle
            key={`mid-${i}`}
            cx={160 + 118}
            cy={160}
            r={o.size}
            fill={o.color}
            opacity={0.85}
            animate={{ rotate: [o.a0, o.a0 - 360] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '160px 160px' }}
          />
        ))}

        {/* Orbiting particles — inner ring */}
        {[
          { a0: 120, dur: 14, size: 3.5, color: CORAL },
          { a0: 300, dur: 14, size: 2.5, color: TEAL },
        ].map((o, i) => (
          <motion.circle
            key={`inner-${i}`}
            cx={160 + 88}
            cy={160}
            r={o.size}
            fill={o.color}
            opacity={0.8}
            animate={{ rotate: [o.a0, o.a0 + 360] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '160px 160px' }}
          />
        ))}

        {/* Floating accent dots */}
        {[
          { cx: 52, cy: 90, r: 3, color: TEAL, dy: -8, delay: 0 },
          { cx: 268, cy: 100, r: 2.5, color: CORAL, dy: -6, delay: 0.6 },
          { cx: 40, cy: 230, r: 2, color: SAND, dy: -7, delay: 1.2 },
          { cx: 280, cy: 220, r: 3, color: TEAL, dy: -9, delay: 0.9 },
        ].map((d, i) => (
          <motion.circle
            key={`accent-${i}`}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.color}
            opacity={0.5}
            animate={{ y: [0, d.dy, 0], opacity: [0.5, 0.9, 0.5] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: d.delay,
            }}
          />
        ))}

        {/* Centre glow */}
        <motion.circle
          cx={160}
          cy={160}
          r={80}
          fill={TEAL}
          fillOpacity={0.04}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 160px' }}
        />
      </svg>

      {/* Logo image centred over the SVG */}
      <motion.img
        src="/NOG_LAB.png"
        alt=""
        className="absolute"
        style={{
          width: '56%',
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 6px 24px rgba(14,110,110,0.18))',
        }}
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
