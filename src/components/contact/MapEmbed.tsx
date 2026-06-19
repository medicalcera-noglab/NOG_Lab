'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface Props {
  src: string
}

export function MapEmbed({ src }: Props) {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className="border-border bg-surface hover:bg-surface-raised flex w-full items-center gap-2 rounded-xl border px-5 py-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        aria-label="Load Google Maps embed"
      >
        <MapPin size={18} className="text-accent" aria-hidden />
        <span>Show map</span>
        <span className="text-muted ml-auto text-xs">(loads Google Maps)</span>
      </button>
    )
  }

  return (
    <div className="border-border aspect-video w-full overflow-hidden rounded-xl border">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps location"
      />
    </div>
  )
}
