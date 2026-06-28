'use client'

import { motion } from 'framer-motion'

const TEAL = '#1A9090'
const CORAL = '#E2725B'
const SAND = '#E8C9A0'

// Satellite dots orbiting at different radii + speeds
const SATELLITES = [
  { r: 112, angle: 0, speed: 14, size: 3, color: CORAL },
  { r: 112, angle: 120, speed: 14, size: 2.5, color: TEAL },
  { r: 112, angle: 240, speed: 14, size: 2, color: SAND },
  { r: 148, angle: 60, speed: 22, size: 3.5, color: TEAL },
  { r: 148, angle: 200, speed: 22, size: 2, color: CORAL },
  { r: 82, angle: 30, speed: 9, size: 2.5, color: TEAL },
  { r: 82, angle: 160, speed: 9, size: 2, color: CORAL },
  { r: 82, angle: 300, speed: 9, size: 3, color: SAND },
  { r: 170, angle: 90, speed: 30, size: 2, color: TEAL },
  { r: 170, angle: 270, speed: 30, size: 2.5, color: CORAL },
]

export function HeroMicrobiomeVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center"
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="0 0 360 360"
        width="100%"
        height="100%"
        style={{ maxWidth: '460px', maxHeight: '460px', overflow: 'visible' }}
      >
        {/* Outer diffuse glow ring */}
        <motion.circle
          cx={180}
          cy={180}
          r={160}
          fill="none"
          stroke={TEAL}
          strokeWidth={0.5}
          opacity={0.12}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '180px 180px' }}
        />

        {/* Orbital ring 1 — slow, teal */}
        <motion.ellipse
          cx={180}
          cy={180}
          rx={155}
          ry={60}
          fill="none"
          stroke={TEAL}
          strokeWidth={0.8}
          opacity={0.25}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '180px 180px' }}
        />

        {/* Orbital ring 2 — medium, coral, tilted */}
        <motion.ellipse
          cx={180}
          cy={180}
          rx={130}
          ry={45}
          fill="none"
          stroke={CORAL}
          strokeWidth={0.6}
          opacity={0.2}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '180px 180px', transform: 'rotate(35deg)' }}
        />

        {/* Orbital ring 3 — fast, sand */}
        <motion.ellipse
          cx={180}
          cy={180}
          rx={170}
          ry={30}
          fill="none"
          stroke={SAND}
          strokeWidth={0.5}
          opacity={0.15}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '180px 180px', transform: 'rotate(70deg)' }}
        />

        {/* Secondary cell — top-left */}
        <motion.circle
          cx={120}
          cy={120}
          r={50}
          fill="none"
          stroke={TEAL}
          strokeWidth={1}
          opacity={0.3}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          style={{ transformOrigin: '120px 120px' }}
        />
        <motion.circle
          cx={120}
          cy={120}
          r={50}
          fill={TEAL}
          opacity={0.04}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          style={{ transformOrigin: '120px 120px' }}
        />

        {/* Secondary cell — bottom-right */}
        <motion.circle
          cx={245}
          cy={245}
          r={40}
          fill="none"
          stroke={CORAL}
          strokeWidth={1}
          opacity={0.28}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
          style={{ transformOrigin: '245px 245px' }}
        />
        <motion.circle
          cx={245}
          cy={245}
          r={40}
          fill={CORAL}
          opacity={0.04}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
          style={{ transformOrigin: '245px 245px' }}
        />

        {/* Small accent cell — top-right */}
        <motion.circle
          cx={265}
          cy={110}
          r={28}
          fill="none"
          stroke={SAND}
          strokeWidth={0.8}
          opacity={0.22}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ transformOrigin: '265px 110px' }}
        />

        {/* Main cell — central */}
        <motion.circle
          cx={180}
          cy={180}
          r={90}
          fill="none"
          stroke={TEAL}
          strokeWidth={1.2}
          opacity={0.45}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '180px 180px' }}
        />
        <motion.circle
          cx={180}
          cy={180}
          r={90}
          fill={TEAL}
          opacity={0.055}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '180px 180px' }}
        />

        {/* Inner nucleus */}
        <motion.circle
          cx={180}
          cy={180}
          r={32}
          fill="none"
          stroke={CORAL}
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.4}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '180px 180px' }}
        />
        <circle cx={180} cy={180} r={32} fill={CORAL} opacity={0.06} />

        {/* Centre dot */}
        <circle cx={180} cy={180} r={4} fill={CORAL} opacity={0.7} />

        {/* Satellite dots — CSS keyframe animation via inline style */}
        {SATELLITES.map((sat, i) => (
          <motion.circle
            key={i}
            cx={180 + sat.r}
            cy={180}
            r={sat.size}
            fill={sat.color}
            opacity={0.6}
            animate={{ rotate: [sat.angle, sat.angle + 360] }}
            transition={{
              duration: sat.speed,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: '180px 180px' }}
          />
        ))}

        {/* DNA-strand cross lines */}
        <line
          x1={180}
          y1={88}
          x2={180}
          y2={272}
          stroke={TEAL}
          strokeWidth={0.4}
          opacity={0.12}
          strokeDasharray="3 5"
        />
        <line
          x1={88}
          y1={180}
          x2={272}
          y2={180}
          stroke={TEAL}
          strokeWidth={0.4}
          opacity={0.12}
          strokeDasharray="3 5"
        />
      </svg>
    </div>
  )
}
