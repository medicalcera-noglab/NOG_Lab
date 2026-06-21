'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// KMU Peshawar — Khyber Medical University
const KMU_LAT = 34.0137
const KMU_LNG = 71.49

const TILES = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

const MARKER_SVG = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
    <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2.5"/>
    <polygon points="6,20 18,20 12,30" fill="${color}"/>
  </svg>`

export function ContactMapClient() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    async function init() {
      const L = (await import('leaflet')).default
      if (cancelled || !containerRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      const accentColor = isDark ? '#1A9090' : '#0E6E6E'

      const map = L.map(containerRef.current!, {
        center: [KMU_LAT, KMU_LNG],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      })

      L.tileLayer(isDark ? TILES.dark : TILES.light, { maxZoom: 19 }).addTo(map)

      const icon = L.divIcon({
        html: MARKER_SVG(accentColor),
        className: '',
        iconSize: [24, 32],
        iconAnchor: [12, 32],
      })

      L.marker([KMU_LAT, KMU_LNG], { icon, title: 'Khyber Medical University' }).addTo(map)

      mapRef.current = map
    }

    init()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="border-border aspect-[4/3] w-full overflow-hidden rounded-xl border sm:aspect-video"
      role="img"
      aria-label="Map showing Khyber Medical University, Peshawar"
    />
  )
}
