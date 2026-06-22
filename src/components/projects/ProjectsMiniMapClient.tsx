'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { MapSite } from '@/app/(payload)/api/map-sites/route'
import 'leaflet/dist/leaflet.css'

interface Props {
  sites: MapSite[]
}

const TILES = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

function makeSvgIcon(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 20 25">
    <circle cx="10" cy="10" r="8" fill="${color}" fill-opacity="0.9" stroke="#fff" stroke-width="2"/>
    <polygon points="5,18 15,18 10,24" fill="${color}" fill-opacity="0.9"/>
  </svg>`
}

export function ProjectsMiniMapClient({ sites }: Props) {
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

      const map = L.map(containerRef.current!, {
        center: [30.3753, 69.3451],
        zoom: 5,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        attributionControl: false,
        keyboard: false,
      })

      L.tileLayer(isDark ? TILES.dark : TILES.light, { maxZoom: 18 }).addTo(map)

      // Load Pakistan boundaries
      try {
        const res = await fetch('/pakistan-boundaries.geojson')
        const geojson = await res.json()
        L.geoJSON(geojson, {
          style: {
            color: isDark ? '#4a9090' : '#0E6E6E',
            weight: 1,
            fillColor: isDark ? '#1a3a3a' : '#e8f5f5',
            fillOpacity: 0.3,
          },
        }).addTo(map)
      } catch {
        // non-fatal
      }

      const markerList: import('leaflet').Marker[] = []
      sites.forEach((site) => {
        const color = site.theme?.color ?? '#0E6E6E'
        const icon = L.divIcon({
          html: makeSvgIcon(color),
          className: '',
          iconSize: [20, 25],
          iconAnchor: [10, 25],
        })
        const m = L.marker([site.lat, site.lng], { icon, title: site.name })
        m.addTo(map)
        markerList.push(m)
      })

      if (markerList.length > 0) {
        const group = L.featureGroup(markerList)
        const bounds = group.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 9 })
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
  }, [sites])

  if (sites.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="border-border h-56 w-full overflow-hidden rounded-lg border"
      role="img"
      aria-label={`Map showing ${sites.length} study site${sites.length !== 1 ? 's' : ''}`}
    />
  )
}
