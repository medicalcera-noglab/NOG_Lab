'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import type { PointFieldClientComponent } from 'payload'

// Major Pakistan cities with GPS coordinates [lat, lng]
const PAKISTAN_CITIES: { label: string; lat: number; lng: number }[] = [
  { label: 'Peshawar, KPK', lat: 34.0151, lng: 71.5249 },
  { label: 'Mardan, KPK', lat: 34.1986, lng: 72.0404 },
  { label: 'Abbottabad, KPK', lat: 34.1463, lng: 73.2117 },
  { label: 'Mingora (Swat), KPK', lat: 34.7717, lng: 72.36 },
  { label: 'Bannu, KPK', lat: 32.9857, lng: 70.5986 },
  { label: 'D.I. Khan, KPK', lat: 31.8311, lng: 70.9014 },
  { label: 'Islamabad, ICT', lat: 33.7294, lng: 73.0931 },
  { label: 'Rawalpindi, Punjab', lat: 33.5651, lng: 73.0169 },
  { label: 'Lahore, Punjab', lat: 31.5204, lng: 74.3587 },
  { label: 'Faisalabad, Punjab', lat: 31.418, lng: 73.079 },
  { label: 'Multan, Punjab', lat: 30.1575, lng: 71.5249 },
  { label: 'Gujranwala, Punjab', lat: 32.1877, lng: 74.1945 },
  { label: 'Sialkot, Punjab', lat: 32.4945, lng: 74.5229 },
  { label: 'Sargodha, Punjab', lat: 32.0836, lng: 72.6711 },
  { label: 'Bahawalpur, Punjab', lat: 29.3956, lng: 71.6836 },
  { label: 'Karachi, Sindh', lat: 24.8607, lng: 67.0011 },
  { label: 'Hyderabad, Sindh', lat: 25.396, lng: 68.3578 },
  { label: 'Sukkur, Sindh', lat: 27.7052, lng: 68.8676 },
  { label: 'Larkana, Sindh', lat: 27.56, lng: 68.2126 },
  { label: 'Quetta, Balochistan', lat: 30.1798, lng: 66.975 },
  { label: 'Turbat, Balochistan', lat: 26.0025, lng: 63.0438 },
  { label: 'Khuzdar, Balochistan', lat: 27.8, lng: 66.6167 },
  { label: 'Gilgit, GB', lat: 35.9218, lng: 74.3081 },
  { label: 'Skardu, GB', lat: 35.2971, lng: 75.634 },
  { label: 'Muzaffarabad, AJK', lat: 34.3702, lng: 73.4711 },
]

// Minimal Leaflet types used here to avoid importing the full lib at module scope
interface LL {
  map: (el: HTMLElement, opts?: object) => LMap
  tileLayer: (url: string, opts?: object) => LLayer
  marker: (latlng: [number, number], opts?: object) => LMarker
  divIcon: (opts: object) => object
}
interface LMap {
  on: (event: string, handler: (e: LClickEvent) => void) => LMap
  addLayer: (layer: LLayer | LMarker) => void
  removeLayer: (layer: LLayer | LMarker) => void
  setView: (latlng: [number, number], zoom: number) => void
  remove: () => void
}
interface LLayer {
  addTo: (map: LMap) => LLayer
}
interface LMarker {
  addTo: (map: LMap) => LMarker
  setLatLng: (latlng: [number, number]) => LMarker
  getLatLng: () => { lat: number; lng: number }
}
interface LClickEvent {
  latlng: { lat: number; lng: number }
}

export const MapPicker: PointFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<[number, number] | null>({ path })

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LMap | null>(null)
  const markerRef = useRef<LMarker | null>(null)

  // Derive initial state from Payload value (runs once on mount)
  const initialCoords =
    Array.isArray(value) && value.length === 2
      ? { lng: value[0] as number, lat: value[1] as number }
      : null
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords)
  const [latInput, setLatInput] = useState(initialCoords ? String(initialCoords.lat) : '')
  const [lngInput, setLngInput] = useState(initialCoords ? String(initialCoords.lng) : '')
  const [citySearch, setCitySearch] = useState('')

  // Init Leaflet
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
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
        keyboard: true,
      })

      ;(L as unknown as LL)
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        })
        .addTo(map)

      // If there is an existing value, place the marker
      if (Array.isArray(value) && value.length === 2) {
        const [lng, lat] = value
        const m = (L as unknown as LL).marker([lat, lng] as [number, number]).addTo(map)
        markerRef.current = m
        map.setView([lat, lng], 9)
      }

      map.on('click', (e: LClickEvent) => {
        const { lat, lng } = e.latlng
        const rounded = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }

        if (markerRef.current) {
          markerRef.current.setLatLng([rounded.lat, rounded.lng])
        } else {
          const m = (L as unknown as LL).marker([rounded.lat, rounded.lng]).addTo(map)
          markerRef.current = m
        }

        // Payload `point` field: [longitude, latitude]
        setValue([rounded.lng, rounded.lat])
        setCoords(rounded)
        setLatInput(String(rounded.lat))
        setLngInput(String(rounded.lng))
      })

      mapRef.current = map
    }

    init()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyManualInput() {
    const lat = parseFloat(latInput)
    const lng = parseFloat(lngInput)
    if (isNaN(lat) || isNaN(lng)) return
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return

    const rounded = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
    setValue([rounded.lng, rounded.lat])
    setCoords(rounded)

    if (mapRef.current) {
      const L = (window as unknown as { L: LL }).L
      if (markerRef.current) {
        markerRef.current.setLatLng([rounded.lat, rounded.lng])
      } else if (L) {
        const m = L.marker([rounded.lat, rounded.lng]).addTo(mapRef.current)
        markerRef.current = m
      }
      mapRef.current.setView([rounded.lat, rounded.lng], 9)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '13px',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    background: 'var(--theme-elevation-0)',
    color: 'var(--theme-text)',
    width: '120px',
  }

  function applyCity(lat: number, lng: number) {
    const rounded = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
    setValue([rounded.lng, rounded.lat])
    setCoords(rounded)
    setLatInput(String(rounded.lat))
    setLngInput(String(rounded.lng))
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([rounded.lat, rounded.lng])
      }
      mapRef.current.setView([rounded.lat, rounded.lng], 11)
    }
  }

  const filteredCities = citySearch.trim()
    ? PAKISTAN_CITIES.filter((c) => c.label.toLowerCase().includes(citySearch.toLowerCase()))
    : PAKISTAN_CITIES

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
      {/* Quick city search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--theme-text)',
          }}
        >
          Quick city select
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            placeholder="Search city (e.g. Peshawar)"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            style={{
              flex: 1,
              padding: '5px 10px',
              fontSize: '13px',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '4px',
              background: 'var(--theme-elevation-0)',
              color: 'var(--theme-text)',
            }}
          />
        </div>
        {citySearch.trim() && (
          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '4px',
              background: 'var(--theme-elevation-0)',
            }}
          >
            {filteredCities.length === 0 ? (
              <p
                style={{
                  padding: '8px 10px',
                  fontSize: '12px',
                  color: 'var(--theme-elevation-500)',
                }}
              >
                No cities found
              </p>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.label}
                  type="button"
                  onClick={() => {
                    applyCity(city.lat, city.lng)
                    setCitySearch('')
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '7px 10px',
                    textAlign: 'left',
                    fontSize: '13px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    cursor: 'pointer',
                    color: 'var(--theme-text)',
                  }}
                >
                  {city.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Coordinate inputs for keyboard / precise entry */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label
          style={{
            fontSize: '12px',
            color: 'var(--theme-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          Latitude
          <input
            type="number"
            step="0.000001"
            min={-90}
            max={90}
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label
          style={{
            fontSize: '12px',
            color: 'var(--theme-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          Longitude
          <input
            type="number"
            step="0.000001"
            min={-180}
            max={180}
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            style={inputStyle}
          />
        </label>
        <button
          type="button"
          onClick={applyManualInput}
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 600,
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-text)',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        style={{
          height: '280px',
          width: '100%',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid var(--theme-elevation-150)',
        }}
        role="application"
        aria-label="Click on the map to set the study site location"
      />

      {coords && (
        <p style={{ fontSize: '11px', color: 'var(--theme-elevation-500)', margin: 0 }}>
          Selected: {coords.lat.toFixed(6)}°N, {coords.lng.toFixed(6)}°E
        </p>
      )}
    </div>
  )
}
