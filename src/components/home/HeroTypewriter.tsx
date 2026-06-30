'use client'

import { useEffect, useState } from 'react'

interface HeroTypewriterProps {
  text: string
  /** ms delay before typing starts */
  startDelay?: number
  /** ms per character */
  speed?: number
}

function prefersReduced() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function HeroTypewriter({ text, startDelay = 1200, speed = 32 }: HeroTypewriterProps) {
  const [displayed, setDisplayed] = useState(() => (prefersReduced() ? text : ''))
  const [done, setDone] = useState(() => prefersReduced())

  useEffect(() => {
    if (prefersReduced()) return

    let i = 0
    let timer: ReturnType<typeof setTimeout>

    const startTimer = setTimeout(() => {
      const type = () => {
        if (i < text.length) {
          i++
          setDisplayed(text.slice(0, i))
          timer = setTimeout(type, speed)
        } else {
          setDone(true)
        }
      }
      type()
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(timer)
    }
  }, [text, startDelay, speed])

  return (
    <p className="hero-tagline mb-0 max-w-xl text-base font-normal text-[#1A1A1A]/55 sm:text-lg">
      {displayed}
      {!done && (
        <span
          className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-[#0E6E6E]/50"
          aria-hidden="true"
        />
      )}
    </p>
  )
}
