'use client'

import React, { useEffect, useRef } from 'react'

// Minimal Leaflet types — same pattern as MapPicker.tsx
interface LL {
  map: (el: HTMLElement, opts?: object) => LMap
  tileLayer: (url: string, opts?: object) => LLayer
  marker: (latlng: [number, number]) => LMarker
  latLngBounds: (latlngs: [number, number][]) => LBounds
}
interface LMap {
  addLayer: (layer: LLayer | LMarker) => void
  setView: (latlng: [number, number], zoom: number) => void
  fitBounds: (bounds: LBounds, opts?: object) => void
  remove: () => void
}
interface LLayer {
  addTo: (map: LMap) => LLayer
}
interface LMarker {
  addTo: (map: LMap) => LMarker
  bindPopup: (html: string) => LMarker
}
interface LBounds {
  isValid: () => boolean
}

export type SiteForMap = {
  id: string
  name: string
  location: [number, number] // [lng, lat] GeoJSON order
  project: string | null
}

export function StudySitesMapWidget({ sites }: { sites: SiteForMap[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || sites.length === 0) return
    let cancelled = false

    async function init() {
      const [{ default: L }] = await Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css' as string),
      ])

      if (cancelled || !containerRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = (L as unknown as LL).map(containerRef.current, {
        center: [30.3753, 69.3451] as [number, number],
        zoom: 5,
      })

      ;(L as unknown as LL)
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        })
        .addTo(map)

      const latlngs: [number, number][] = []

      for (const site of sites) {
        const [lng, lat] = site.location
        const latlng: [number, number] = [lat, lng]
        latlngs.push(latlng)
        const popup = `<strong style="font-size:13px">${site.name}</strong>${
          site.project ? `<br/><span style="font-size:11px;color:#666">${site.project}</span>` : ''
        }`
        ;(L as unknown as LL).marker(latlng).addTo(map).bindPopup(popup)
      }

      if (latlngs.length === 1) {
        map.setView(latlngs[0]!, 9)
      } else if (latlngs.length > 1) {
        const bounds = (L as unknown as LL).latLngBounds(latlngs)
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [32, 32] })
        }
      }

      mapRef.current = map
    }

    init()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (sites.length === 0) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--theme-text-muted, #6b7280)', margin: 0 }}>
        No study sites added yet. Create sites in the Study Sites collection.
      </p>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: '340px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--theme-border-color, #e5e7eb)',
      }}
      role="application"
      aria-label={`Map showing ${sites.length} active study site${sites.length !== 1 ? 's' : ''}`}
    />
  )
}
