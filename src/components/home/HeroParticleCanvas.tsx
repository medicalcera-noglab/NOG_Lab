'use client'

import { useEffect, useRef } from 'react'

const TEAL = '#1A9090'
const CORAL = '#E2725B'
const SAND = '#E8C9A0'
const PALETTE = [TEAL, TEAL, TEAL, CORAL, SAND]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  opacity: number
}

export function HeroParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    let mouseX = w / 2
    let mouseY = h / 2
    let raf = 0

    const isMobile = window.innerWidth < 768
    const N = isMobile ? 60 : 100

    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }
    resize()

    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 0.8,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      opacity: Math.random() * 0.18 + 0.08,
    }))

    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('resize', resize, { passive: true })

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      const px = ((mouseX - w / 2) / w) * 18
      const py = ((mouseY - h / 2) / h) * 18

      // Update positions
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        else if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        else if (p.y > h) p.y = 0
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        const ax = a.x + px
        const ay = a.y + py
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = ax - (b.x + px)
          const dy = ay - (b.y + py)
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.globalAlpha = (1 - d / 120) * 0.18
            ctx.strokeStyle = a.color
            ctx.lineWidth = 0.5
            ctx.moveTo(ax, ay)
            ctx.lineTo(b.x + px, b.y + py)
            ctx.stroke()
          }
        }
      }

      // Dots
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x + px * 0.6, p.y + py * 0.6, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{ willChange: 'transform' }}
    />
  )
}
