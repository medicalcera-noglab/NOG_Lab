'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Map as LeafletMap, DivIcon, Marker } from 'leaflet'
import type { MapSite } from '@/app/(payload)/api/map-sites/route'
import { X, Layers, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Leaflet CSS — loaded dynamically to avoid SSR
// (this component is only ever rendered via dynamic(..., { ssr: false }))
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

interface Props {
  sites: MapSite[]
  /** Mini mode: smaller, no fullscreen, no heatmap */
  mini?: boolean
}

// Two light/dark tile-layer pairs (free, no API key needed).
const TILES = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

// Pakistan center / default zoom
const PAK_CENTER: [number, number] = [30.3753, 69.3451]
const DEFAULT_ZOOM = 5
const MINI_ZOOM = 5

function makeSvgIcon(color: string, size = 28): string {
  const r = size / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 6}" viewBox="0 0 ${size} ${size + 6}">
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="${color}" fill-opacity="0.9" stroke="#fff" stroke-width="2"/>
    <polygon points="${r - 5},${size - 1} ${r + 5},${size - 1} ${r},${size + 5}" fill="${color}" fill-opacity="0.9"/>
  </svg>`
}

export function ProjectsMapClient({ sites, mini = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<number, Marker>>(new Map())
  const clusterRef = useRef<import('leaflet').MarkerClusterGroup | null>(null)
  const heatRef = useRef<unknown>(null)

  const [selectedSite, setSelectedSite] = useState<MapSite | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [heatmapOn, setHeatmapOn] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [tilesFailed, setTilesFailed] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  // Detect theme changes via data-theme on <html>
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  // Initialise Leaflet map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    async function init() {
      const L = (await import('leaflet')).default
      // Side-effect import: augments L with MarkerClusterGroup
      await import('leaflet.markercluster')

      if (cancelled || !containerRef.current) return

      // Fix default icon path (broken by webpack)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const darkNow = document.documentElement.getAttribute('data-theme') === 'dark'
      const tile = darkNow ? TILES.dark : TILES.light

      const map = L.map(containerRef.current!, {
        center: PAK_CENTER,
        zoom: mini ? MINI_ZOOM : DEFAULT_ZOOM,
        zoomControl: !mini,
        scrollWheelZoom: !mini,
        dragging: !mini,
        touchZoom: !mini,
        doubleClickZoom: !mini,
        keyboard: true,
      })

      const tileLayer = L.tileLayer(tile.url, {
        attribution: tile.attribution,
        maxZoom: 18,
      }).addTo(map)

      // Show a non-blocking banner if tile loading fails consistently
      let tileErrorCount = 0
      tileLayer.on('tileerror', () => {
        tileErrorCount++
        if (tileErrorCount >= 3) setTilesFailed(true)
      })

      // Load Pakistan boundaries GeoJSON
      try {
        const res = await fetch('/pakistan-boundaries.geojson')
        const geojson = await res.json()
        L.geoJSON(geojson, {
          style: {
            color: darkNow ? '#4a9090' : '#0E6E6E',
            weight: 1.5,
            fillColor: darkNow ? '#1a3a3a' : '#e8f5f5',
            fillOpacity: 0.3,
          },
        }).addTo(map)
      } catch {
        // GeoJSON load failure is non-fatal
      }

      // Marker cluster group (MarkerClusterGroup is augmented onto L by the import above)
      const cluster = new L.MarkerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
      })

      // Add markers
      const L_local = L
      sites.forEach((site) => {
        const color = site.theme?.color ?? '#0E6E6E'
        const svgHtml = makeSvgIcon(color)
        const icon: DivIcon = L_local.divIcon({
          html: svgHtml,
          className: '',
          iconSize: [28, 34],
          iconAnchor: [14, 34],
          popupAnchor: [0, -34],
        })

        const marker = L_local.marker([site.lat, site.lng], { icon, title: site.name })
        marker.on('click', () => {
          setSelectedSite(site)
        })
        marker.on('keypress', (e: { originalEvent: KeyboardEvent }) => {
          if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') {
            setSelectedSite(site)
          }
        })
        cluster.addLayer(marker)
        markersRef.current.set(site.id, marker)
      })

      map.addLayer(cluster)
      clusterRef.current = cluster
      mapRef.current = map

      // Fit bounds to Pakistan
      if (sites.length > 0) {
        const bounds = cluster.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 })
        }
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [mini, sites])

  // Swap tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(({ default: L }) => {
      const map = mapRef.current!
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer)
      })
      const tile = isDark ? TILES.dark : TILES.light
      L.tileLayer(tile.url, {
        attribution: tile.attribution,
        maxZoom: 18,
      }).addTo(map)
    })
  }, [isDark])

  // Heatmap toggle (leaflet.heat is optional)
  const toggleHeatmap = useCallback(async () => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (heatmapOn && heatRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.removeLayer(heatRef.current as any)
      heatRef.current = null
      setHeatmapOn(false)
      return
    }
    try {
      // leaflet.heat is optional; if absent, fail silently
      const { default: L } = await import('leaflet')
      const points = sites.map((s) => [s.lat, s.lng, 1] as [number, number, number])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heat = (L as any).heatLayer(points, { radius: 25 }).addTo(map)
      heatRef.current = heat
      setHeatmapOn(true)
    } catch {
      // leaflet.heat not installed — ignore
    }
  }, [heatmapOn, sites])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f)
    setTimeout(() => mapRef.current?.invalidateSize(), 50)
  }, [])

  // Side panel focus trap
  useEffect(() => {
    if (selectedSite) {
      prevFocusRef.current = document.activeElement as HTMLElement
      requestAnimationFrame(() => closeBtnRef.current?.focus())
    } else {
      prevFocusRef.current?.focus()
    }
  }, [selectedSite])

  // Keyboard: Esc closes panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSite) setSelectedSite(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedSite])

  // Focus trap inside panel
  const onPanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }, [])

  // Keyboard marker navigation (arrow keys move to next/prev site)
  useEffect(() => {
    if (!mapRef.current) return
    let currentIdx = -1

    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      if (!document.activeElement?.closest('.leaflet-container')) return
      e.preventDefault()
      const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
      currentIdx = (currentIdx + delta + sites.length) % sites.length
      const site = sites[currentIdx]
      if (!site) return
      mapRef.current?.panTo([site.lat, site.lng])
      setSelectedSite(site)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sites])

  const height = mini
    ? 'h-56'
    : isFullscreen
      ? 'fixed inset-0 z-[1000] h-screen'
      : 'h-[340px] sm:h-[520px]'

  return (
    <div className={cn('relative w-full', height)}>
      {/* Map container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden rounded-xl"
        role="application"
        aria-label="Interactive Pakistan project map. Use arrow keys to navigate between study sites."
        tabIndex={0}
      />

      {/* Tile failure banner */}
      {tilesFailed && (
        <div
          role="alert"
          className="absolute bottom-8 left-1/2 z-[500] -translate-x-1/2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 shadow dark:bg-amber-900/60 dark:text-amber-200"
        >
          Map tiles unavailable — study site markers are still active.
        </div>
      )}

      {/* Controls (hidden in mini mode) */}
      {!mini && (
        <div className="absolute top-2 right-2 z-[400] flex flex-col gap-1">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md shadow',
              'bg-bg border-border text-fg border',
              'hover:bg-surface-raised transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={toggleHeatmap}
            aria-pressed={heatmapOn}
            aria-label="Toggle density heatmap"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md shadow',
              'border transition-colors',
              heatmapOn
                ? 'bg-accent/20 border-accent text-accent'
                : 'bg-bg border-border text-fg hover:bg-surface-raised',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            <Layers size={14} />
          </button>
        </div>
      )}

      {/* Accessible site list toggle */}
      {!mini && (
        <div className="absolute bottom-2 left-2 z-[400]">
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            aria-expanded={listOpen}
            aria-controls="accessible-site-list"
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold shadow',
              'bg-bg border-border text-fg border',
              'hover:bg-surface-raised transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            {listOpen ? 'Hide' : 'Show'} site list ({sites.length})
          </button>
        </div>
      )}

      {/* Accessible site list */}
      {!mini && listOpen && (
        <div
          id="accessible-site-list"
          className={cn(
            'absolute bottom-10 left-2 z-[400] max-h-48 w-[min(18rem,calc(100%-1rem))] overflow-y-auto',
            'bg-bg border-border rounded-lg border p-2 shadow-lg',
          )}
        >
          <ul role="list" className="flex flex-col gap-1">
            {sites.map((site) => (
              <li key={site.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSite(site)
                    mapRef.current?.panTo([site.lat, site.lng], { animate: true })
                    setListOpen(false)
                  }}
                  className={cn(
                    'w-full rounded px-2 py-1 text-left text-xs',
                    'text-fg hover:bg-surface-raised transition-colors',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                  )}
                >
                  <span className="font-semibold">{site.name}</span>
                  <span className="text-muted ml-1">— {site.province}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Side panel — bottom sheet on mobile, side panel on sm+ */}
      {selectedSite && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${selectedSite.name}`}
          onKeyDown={onPanelKeyDown}
          className={cn(
            // Mobile: bottom sheet sliding up from bottom
            'absolute inset-x-0 bottom-0 z-[500] max-h-[50%] rounded-t-xl',
            'border-border border-t shadow-xl',
            // sm+: traditional side panel on the right
            'sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-auto sm:h-full sm:max-h-none sm:w-72 sm:rounded-none sm:border-t-0 sm:border-l',
            'bg-bg overflow-y-auto p-4',
          )}
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setSelectedSite(null)}
            aria-label="Close site details"
            className={cn(
              'absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full',
              'text-muted hover:text-fg hover:bg-surface-raised transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            <X size={16} />
          </button>

          <div className="mt-8">
            {selectedSite.theme && (
              <span
                className="mb-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  background: `${selectedSite.theme.color}22`,
                  color: selectedSite.theme.color,
                  border: `1px solid ${selectedSite.theme.color}44`,
                }}
              >
                {selectedSite.theme.name}
              </span>
            )}

            <h2 className="text-fg mt-1 text-base leading-snug font-bold">{selectedSite.name}</h2>
            <p className="text-muted mt-1 text-xs">
              {selectedSite.district}, {selectedSite.province}
            </p>
            <p className="text-muted mt-0.5 text-xs">
              {selectedSite.lat.toFixed(4)}°N, {selectedSite.lng.toFixed(4)}°E
            </p>

            <div className="border-border mt-4 border-t pt-4">
              <p className="text-muted mb-1 text-[11px] font-semibold tracking-wide uppercase">
                Project
              </p>
              <a
                href={`/projects/${selectedSite.project.slug}`}
                className={cn(
                  'text-primary text-sm font-semibold underline underline-offset-2',
                  'hover:text-accent focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                )}
              >
                {selectedSite.project.title}
              </a>
              <p className="text-muted mt-1 text-xs capitalize">
                Status: {selectedSite.project.status}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
