'use client'

import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { FieldDef } from '@/lib/admin-collections'

// ── Lexical helpers ─────────────────────────────────────────────

function lexicalToText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  const root = (content as Record<string, unknown>).root as Record<string, unknown> | undefined
  if (!root) return ''

  function extractNode(node: Record<string, unknown>): string {
    if (node.type === 'text') return String(node.text ?? '')
    if (Array.isArray(node.children)) {
      const joined = (node.children as Record<string, unknown>[]).map(extractNode).join('')
      if (node.type === 'paragraph' || node.type === 'heading') return joined + '\n'
      return joined
    }
    return ''
  }

  const children = root.children as Record<string, unknown>[] | undefined
  return (children ?? []).map(extractNode).join('').trim()
}

function textToLexical(text: string) {
  const lines = text.split('\n').filter((s) => s.trim())
  const paragraphs = lines.length
    ? lines.map((line) => ({
        type: 'paragraph',
        children: [
          { type: 'text', text: line, version: 1, format: 0, detail: 0, mode: 'normal', style: '' },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      }))
    : [
        {
          type: 'paragraph',
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ]
  return {
    root: {
      type: 'root',
      children: paragraphs,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ── Relationship helpers ─────────────────────────────────────────

function extractRelId(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'object' && 'id' in (val as Record<string, unknown>))
    return String((val as Record<string, unknown>).id)
  return String(val)
}

function extractRelIds(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.map(extractRelId).filter(Boolean)
}

// Payload PostgreSQL uses integer IDs. Convert "7" → 7 for API payloads;
// keep non-numeric IDs (e.g. hex sub-row ids) as strings.
function toPayloadId(v: string): number | string {
  const n = Number(v)
  return Number.isFinite(n) && v.trim() !== '' ? n : v
}

// ── Upload value type ────────────────────────────────────────────

type UploadValue = { id: string; url: string; alt: string } | null

function extractUploadValue(raw: unknown): UploadValue {
  if (!raw) return null
  if (typeof raw === 'object' && 'id' in (raw as Record<string, unknown>)) {
    const doc = raw as Record<string, unknown>
    return { id: String(doc.id), url: String(doc.url ?? ''), alt: String(doc.alt ?? '') }
  }
  return { id: String(raw), url: '', alt: '' }
}

// ── Init helpers ─────────────────────────────────────────────────

type FormState = Record<string, unknown>

function initState(data: FormState, fields: FieldDef[]): FormState {
  const state: FormState = {}
  for (const field of fields) {
    const raw = data[field.name]

    if (field.type === 'richtext') {
      state[field.name] = lexicalToText(raw)
    } else if (field.type === 'relationship') {
      state[field.name] = field.hasMany ? extractRelIds(raw) : extractRelId(raw)
    } else if (field.type === 'upload') {
      state[field.name] = extractUploadValue(raw)
    } else if (field.type === 'date' && raw) {
      state[field.name] = String(raw).substring(0, 10)
    } else if (field.type === 'array') {
      const rows = Array.isArray(raw) ? (raw as FormState[]) : []
      state[field.name] = field.fields?.length
        ? rows.map((row) => initState(row as FormState, field.fields!))
        : rows
    } else if (field.type === 'group') {
      const groupData = raw && typeof raw === 'object' ? (raw as FormState) : {}
      state[field.name] = initState(groupData, field.fields ?? [])
    } else if (field.type === 'checkbox') {
      state[field.name] = Boolean(raw)
    } else if (field.type === 'point') {
      state[field.name] = Array.isArray(raw) && raw.length === 2 ? raw : null
    } else {
      state[field.name] = raw ?? ''
    }
  }
  return state
}

function buildPayload(state: FormState, fields: FieldDef[]): FormState {
  const result: FormState = {}
  for (const field of fields) {
    const val = state[field.name]
    if (field.readOnly) continue

    if (field.type === 'richtext') {
      result[field.name] = typeof val === 'string' ? textToLexical(val as string) : val
    } else if (field.type === 'number') {
      result[field.name] = val === '' || val === null || val === undefined ? null : Number(val)
    } else if (field.type === 'date') {
      result[field.name] = val === '' || val === null || val === undefined ? null : val
    } else if (field.type === 'upload') {
      const uv = val as UploadValue
      result[field.name] = uv?.id ? toPayloadId(uv.id) : null
    } else if (field.type === 'relationship') {
      if (field.hasMany) {
        const ids = (Array.isArray(val) ? (val as string[]) : []).filter(Boolean)
        result[field.name] = ids.map(toPayloadId)
      } else {
        const id = typeof val === 'string' ? val.trim() : ''
        result[field.name] = id ? toPayloadId(id) : null
      }
    } else if (field.type === 'group') {
      result[field.name] = buildPayload((val as FormState) ?? {}, field.fields ?? [])
    } else if (field.type === 'point') {
      result[field.name] = Array.isArray(val) && val.length === 2 ? val : null
    } else if (field.type === 'array') {
      const rows = Array.isArray(val) ? (val as FormState[]) : []
      result[field.name] = field.fields?.length
        ? rows.map((row) => buildPayload(row as FormState, field.fields!))
        : rows
    } else if (field.type === 'password') {
      // Only send password if the user actually typed something
      if (typeof val === 'string' && val.trim() !== '') {
        result[field.name] = val
      }
    } else {
      result[field.name] = val
    }
  }
  return result
}

// ── Shared styles ────────────────────────────────────────────────

const S = {
  input: {
    display: 'block',
    width: '100%',
    padding: '0.55rem 0.75rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '7px',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.3rem',
  } as React.CSSProperties,
  hint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  } as React.CSSProperties,
}

// ── Sub-components ───────────────────────────────────────────────

import type React from 'react'

// ── Media upload field ───────────────────────────────────────────

function MediaUploadField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: UploadValue) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uv = (value as UploadValue) ?? null

  const isImage = uv?.url
    ? /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(uv.url) || uv.url.startsWith('data:image')
    : false

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))

      const res = await fetch('/api/media', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as Record<string, unknown>
        const errs = j.errors as { message: string }[] | undefined
        throw new Error(errs?.[0]?.message ?? `Upload failed (${res.status})`)
      }

      const j = (await res.json()) as { doc?: Record<string, unknown> }
      const doc = j.doc ?? {}
      onChange({
        id: String(doc.id),
        url: String(doc.url ?? ''),
        alt: String(doc.alt ?? file.name),
      })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      style={{
        border: '1.5px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.875rem',
        background: '#f8fafc',
      }}
    >
      {uv ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
          {isImage && (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                background: '#fff',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uv.url}
                alt={uv.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          {!isImage && uv.url && (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <polyline
                  points="13 2 13 9 20 9"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: '0 0 0.25rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#1e293b',
                wordBreak: 'break-all',
              }}
            >
              {uv.alt || 'Media file'}
            </p>
            {uv.url && (
              <a
                href={uv.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', color: '#0e6e6e', wordBreak: 'break-all' }}
              >
                View file ↗
              </a>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '0.3rem 0.75rem',
                  background: '#0e6e6e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? 'Uploading…' : 'Replace'}
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                style={{
                  padding: '0.3rem 0.75rem',
                  background: 'none',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem' }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ margin: '0 auto 0.625rem', display: 'block', opacity: 0.35 }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="#64748b" strokeWidth="1.5" />
            <path d="M21 15l-5-5L5 21" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#64748b' }}>
            No file selected
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '0.4rem 1rem',
              background: '#0e6e6e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={field.accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label={`Upload ${field.label}`}
      />

      {uploadError && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{uploadError}</p>
      )}
    </div>
  )
}

// ── Map Picker Field (PostGIS point coordinates) ─────────────────

interface _LL {
  map: (el: HTMLElement, opts?: object) => _LMap
  tileLayer: (url: string, opts?: object) => _LLayer
  marker: (latlng: [number, number], opts?: object) => _LMarker
}
interface _LMap {
  on: (event: string, handler: (e: _LClickEvent) => void) => _LMap
  setView: (latlng: [number, number], zoom: number) => void
  remove: () => void
}
interface _LLayer {
  addTo: (map: _LMap) => _LLayer
}
interface _LMarker {
  addTo: (map: _LMap) => _LMarker
  setLatLng: (latlng: [number, number]) => _LMarker
}
interface _LClickEvent {
  latlng: { lat: number; lng: number }
}

const PAKISTAN_CITIES = [
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

function MapPickerField({
  value,
  onChange,
}: {
  value: [number, number] | null
  onChange: (v: [number, number] | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<_LMap | null>(null)
  const markerRef = useRef<_LMarker | null>(null)

  const initialCoords =
    Array.isArray(value) && value.length === 2
      ? { lng: value[0] as number, lat: value[1] as number }
      : null

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords)
  const [latInput, setLatInput] = useState(initialCoords ? String(initialCoords.lat) : '')
  const [lngInput, setLngInput] = useState(initialCoords ? String(initialCoords.lng) : '')
  const [citySearch, setCitySearch] = useState('')

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    import('leaflet').then(({ default: L }) => {
      if (cancelled || !containerRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = (L as unknown as _LL).map(containerRef.current, {
        center: [30.3753, 69.3451] as [number, number],
        zoom: 5,
      })

      ;(L as unknown as _LL)
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        })
        .addTo(map)

      if (Array.isArray(value) && value.length === 2) {
        const [lng, lat] = value as [number, number]
        const m = (L as unknown as _LL).marker([lat, lng]).addTo(map)
        markerRef.current = m
        map.setView([lat, lng], 9)
      }

      map.on('click', (e: _LClickEvent) => {
        const { lat, lng } = e.latlng
        const rounded = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }

        if (markerRef.current) {
          markerRef.current.setLatLng([rounded.lat, rounded.lng])
        } else {
          const m = (L as unknown as _LL).marker([rounded.lat, rounded.lng]).addTo(map)
          markerRef.current = m
        }

        onChange([rounded.lng, rounded.lat])
        setCoords(rounded)
        setLatInput(String(rounded.lat))
        setLngInput(String(rounded.lng))
      })

      mapRef.current = map
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyCity(lat: number, lng: number) {
    const rounded = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
    onChange([rounded.lng, rounded.lat])
    setCoords(rounded)
    setLatInput(String(rounded.lat))
    setLngInput(String(rounded.lng))
    setCitySearch('')
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([rounded.lat, rounded.lng])
      }
      mapRef.current.setView([rounded.lat, rounded.lng], 11)
    }
  }

  function applyManualInput() {
    const lat = parseFloat(latInput)
    const lng = parseFloat(lngInput)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return
    const rounded = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
    onChange([rounded.lng, rounded.lat])
    setCoords(rounded)
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([rounded.lat, rounded.lng])
      }
      mapRef.current.setView([rounded.lat, rounded.lng], 9)
    }
  }

  const filteredCities = citySearch.trim()
    ? PAKISTAN_CITIES.filter((c) => c.label.toLowerCase().includes(citySearch.toLowerCase()))
    : PAKISTAN_CITIES

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* City quick-search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search city (e.g. Peshawar, Karachi)…"
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          style={{ ...S.input }}
        />
        {citySearch.trim() && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 9999,
              maxHeight: '180px',
              overflowY: 'auto',
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderTop: 'none',
              borderRadius: '0 0 7px 7px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            {filteredCities.length === 0 ? (
              <p
                style={{ padding: '8px 12px', fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}
              >
                No cities found
              </p>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.label}
                  type="button"
                  onClick={() => applyCity(city.lat, city.lng)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '7px 12px',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    color: '#0f172a',
                  }}
                >
                  {city.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Manual coordinate inputs */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label
          style={{
            fontSize: '0.8rem',
            color: '#374151',
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
            placeholder="e.g. 34.0151"
            style={{ ...S.input, width: '140px' }}
          />
        </label>
        <label
          style={{
            fontSize: '0.8rem',
            color: '#374151',
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
            placeholder="e.g. 71.5249"
            style={{ ...S.input, width: '140px' }}
          />
        </label>
        <button
          type="button"
          onClick={applyManualInput}
          style={{
            padding: '0.55rem 1rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: '1.5px solid #e2e8f0',
            borderRadius: '7px',
            background: '#f8fafc',
            color: '#374151',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>

      {/* Leaflet map */}
      <div
        ref={containerRef}
        style={{
          height: '300px',
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1.5px solid #e2e8f0',
        }}
        role="application"
        aria-label="Click on the map to set the study site location"
      />

      <p
        style={{
          fontSize: '0.75rem',
          margin: 0,
          color: coords ? '#64748b' : '#d97706',
          fontWeight: coords ? 400 : 500,
        }}
      >
        {coords
          ? `Selected: ${coords.lat.toFixed(6)}°N, ${coords.lng.toFixed(6)}°E`
          : 'No location set — click the map or search a city above'}
      </p>
    </div>
  )
}

// ── FieldInput ───────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  relOptions,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
  relOptions: Record<string, { id: string; label: string }[]>
}) {
  const disabled = field.readOnly

  const focusStyle = { borderColor: '#0e6e6e', boxShadow: '0 0 0 3px rgba(14,110,110,0.12)' }

  if (field.type === 'upload') {
    return (
      <MediaUploadField
        field={field}
        value={value}
        onChange={onChange as (v: UploadValue) => void}
      />
    )
  }

  if (field.type === 'point') {
    return (
      <MapPickerField
        value={value as [number, number] | null}
        onChange={onChange as (v: [number, number] | null) => void}
      />
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{ width: '16px', height: '16px', accentColor: '#0e6e6e' }}
        />
        <span style={{ fontSize: '0.875rem', color: '#374151' }}>{value ? 'Yes' : 'No'}</span>
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...S.input,
          appearance: 'auto',
          background: disabled ? '#f8fafc' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <option value="">— Select —</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'textarea' || field.type === 'richtext') {
    return (
      <textarea
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        readOnly={disabled}
        rows={field.type === 'richtext' ? 8 : 4}
        style={{
          ...S.input,
          resize: 'vertical',
          lineHeight: 1.6,
          background: disabled ? '#f8fafc' : '#fff',
        }}
        onFocus={(e) => {
          if (!disabled) Object.assign(e.currentTarget.style, focusStyle)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    )
  }

  if (field.type === 'relationship') {
    const opts = relOptions[field.relationTo ?? ''] ?? []

    if (field.hasMany) {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div
          style={{
            border: '1.5px solid #e2e8f0',
            borderRadius: '7px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: disabled ? '#f8fafc' : '#fff',
          }}
        >
          {opts.length === 0 && (
            <p
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}
            >
              Loading options…
            </p>
          )}
          {opts.map((opt) => (
            <label
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt.id]
                    : selected.filter((id) => id !== opt.id)
                  onChange(next)
                }}
                disabled={disabled}
                style={{ accentColor: '#0e6e6e' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      )
    }

    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ ...S.input, appearance: 'auto', background: disabled ? '#f8fafc' : '#fff' }}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <option value="">— None —</option>
        {opts.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  // text / email / number / date / password
  const inputType =
    field.type === 'email'
      ? 'email'
      : field.type === 'number'
        ? 'number'
        : field.type === 'date'
          ? 'date'
          : field.type === 'password'
            ? 'password'
            : 'text'

  return (
    <input
      type={inputType}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      readOnly={disabled}
      required={field.required}
      style={{
        ...S.input,
        background: disabled ? '#f8fafc' : '#fff',
        cursor: disabled ? 'not-allowed' : undefined,
      }}
      onFocus={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, focusStyle)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

// ── Array field ──────────────────────────────────────────────────

function ArrayField({
  field,
  value,
  onChange,
  relOptions,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
  relOptions: Record<string, { id: string; label: string }[]>
}) {
  const rows = Array.isArray(value) ? (value as FormState[]) : []
  const subFields = field.fields ?? []

  function addRow() {
    const empty: FormState = {}
    for (const f of subFields) {
      if (f.type === 'upload') empty[f.name] = null
      else if (f.type === 'checkbox') empty[f.name] = false
      else if (f.type === 'array') empty[f.name] = []
      else if (f.type === 'group') {
        const grp: FormState = {}
        for (const sf of f.fields ?? []) {
          if (sf.type === 'upload') grp[sf.name] = null
          else if (sf.type === 'checkbox') grp[sf.name] = false
          else grp[sf.name] = ''
        }
        empty[f.name] = grp
      } else empty[f.name] = ''
    }
    onChange([...rows, empty])
  }

  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i))
  }

  function updateRow(i: number, subName: string, val: unknown) {
    const updated = rows.map((row, idx) => (idx === i ? { ...row, [subName]: val } : row))
    onChange(updated)
  }

  return (
    <div>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '0.625rem',
            background: '#f8fafc',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => removeRow(i)}
            style={{
              position: 'absolute',
              top: '0.6rem',
              right: '0.6rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '1rem',
              lineHeight: 1,
              padding: '2px 6px',
            }}
            aria-label="Remove row"
          >
            ×
          </button>

          {subFields.map((sf) => (
            <div key={sf.name} style={{ marginBottom: subFields.length > 1 ? '0.5rem' : 0 }}>
              {subFields.length > 1 && <label style={S.label}>{sf.label}</label>}
              {sf.type === 'array' ? (
                <ArrayField
                  field={sf}
                  value={row[sf.name] ?? []}
                  onChange={(v) => updateRow(i, sf.name, v)}
                  relOptions={relOptions}
                />
              ) : sf.type === 'group' ? (
                <GroupField
                  field={sf}
                  value={row[sf.name]}
                  onChange={(v) => updateRow(i, sf.name, v)}
                  relOptions={relOptions}
                />
              ) : (
                <FieldInput
                  field={sf}
                  value={
                    row[sf.name] ??
                    (sf.type === 'upload' ? null : sf.type === 'checkbox' ? false : '')
                  }
                  onChange={(v) => updateRow(i, sf.name, v)}
                  relOptions={relOptions}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        style={{
          padding: '0.4rem 0.875rem',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '7px',
          background: 'none',
          color: '#64748b',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        + Add row
      </button>
    </div>
  )
}

// ── Group field ──────────────────────────────────────────────────

function GroupField({
  field,
  value,
  onChange,
  relOptions,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
  relOptions: Record<string, { id: string; label: string }[]>
}) {
  const groupData = (value && typeof value === 'object' ? value : {}) as FormState
  const subFields = field.fields ?? []

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        background: '#f8fafc',
      }}
    >
      {subFields.map((sf) => (
        <div key={sf.name} style={{ marginBottom: '0.75rem' }}>
          <label style={S.label}>{sf.label}</label>
          <FieldInput
            field={sf}
            value={
              groupData[sf.name] ??
              (sf.type === 'upload' ? null : sf.type === 'checkbox' ? false : '')
            }
            onChange={(v) => onChange({ ...groupData, [sf.name]: v })}
            relOptions={relOptions}
          />
        </div>
      ))}
    </div>
  )
}

// ── Main form component ──────────────────────────────────────────

type Props = {
  apiSlug: string
  docId?: string
  initialData?: FormState
  fields: FieldDef[]
  returnPath: string
  collectionLabel: string
  isGlobal?: boolean
}

export function DocForm({
  apiSlug,
  docId,
  initialData = {},
  fields,
  returnPath,
  collectionLabel,
  isGlobal = false,
}: Props) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(() => initState(initialData, fields))
  // Always-current reference so handleSave never closes over stale state.
  // Synced in an effect (not during render) to satisfy react-hooks/refs.
  const stateRef = useRef<FormState>(state)
  useEffect(() => {
    stateRef.current = state
  })
  const [relOptions, setRelOptions] = useState<Record<string, { id: string; label: string }[]>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  // Fetch options for all relationship fields
  useEffect(() => {
    const scan = (fs: FieldDef[]): FieldDef[] =>
      fs.flatMap((f) => {
        const nested = scan(f.fields ?? [])
        return f.type === 'relationship' && f.relationTo ? [f, ...nested] : nested
      })
    const allRelFields = scan(fields)
    const slugs = [...new Set(allRelFields.map((f) => f.relationTo!))]
    if (!slugs.length) return

    Promise.all(
      slugs.map((slug) =>
        fetch(`/api/${slug}?limit=200&depth=0`, { credentials: 'include' })
          .then((r) => r.json())
          .then((data) => {
            const docs = (data.docs ?? []) as Record<string, unknown>[]
            const opts = docs.map((d) => ({
              id: String(d.id),
              label: String(d.name ?? d.title ?? d.email ?? d.id ?? '?'),
            }))
            return [slug, opts] as [string, typeof opts]
          })
          .catch(() => [slug, []] as [string, never[]]),
      ),
    ).then((results) => {
      setRelOptions(Object.fromEntries(results))
    })
  }, [fields])

  const updateField = useCallback((name: string, val: unknown) => {
    setState((prev) => ({ ...prev, [name]: val }))
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    // Use the ref so we always serialize the latest state, even if a re-render
    // (e.g. from setRelOptions or a file upload onChange) fired just before the click.
    const body = buildPayload(stateRef.current, fields)
    if (isGlobal) {
      // Globals with drafts enabled save as draft by default; force publish.
      body._status = 'published'
    }

    try {
      let url: string
      let method: string

      if (isGlobal) {
        url = `/api/globals/${apiSlug}`
        method = 'PUT'
      } else {
        url = docId ? `/api/${apiSlug}/${docId}` : `/api/${apiSlug}`
        method = docId ? 'PATCH' : 'POST'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      })

      const json = await res.json().catch(() => ({}))

      if (res.ok) {
        if (!isGlobal && !docId) {
          const newId = (json as Record<string, unknown>).doc
            ? ((json as Record<string, unknown>).doc as Record<string, unknown>).id
            : (json as Record<string, unknown>).id
          router.push(`/admin/collections/${apiSlug}/${newId}`)
        } else {
          setFeedback({ type: 'ok', msg: 'Saved successfully.' })
          setTimeout(() => setFeedback(null), 3000)
        }
      } else {
        const errs = (json as Record<string, unknown>).errors as { message: string }[] | undefined
        setFeedback({ type: 'err', msg: errs?.[0]?.message ?? 'Save failed.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Network error — please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!docId || isGlobal) return
    setDeleting(true)
    setConfirmDelete(false)

    try {
      const res = await fetch(`/api/${apiSlug}/${docId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        router.push(returnPath)
      } else {
        setFeedback({ type: 'err', msg: 'Delete failed.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Network error.' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} noValidate>
      <style>{`@keyframes nog-spin{to{transform:rotate(360deg)}}`}</style>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.75rem',
          marginBottom: '1.25rem',
        }}
      >
        {fields.map((field) => {
          if (field.type === 'array') {
            return (
              <div key={field.name} style={{ marginBottom: '1.375rem' }}>
                <label
                  style={{ ...S.label, fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}
                >
                  {field.label}
                  {field.required && <span style={{ color: '#e2725b' }}> *</span>}
                </label>
                {field.hint && <p style={S.hint}>{field.hint}</p>}
                <ArrayField
                  field={field}
                  value={state[field.name]}
                  onChange={(v) => updateField(field.name, v)}
                  relOptions={relOptions}
                />
              </div>
            )
          }

          if (field.type === 'group') {
            return (
              <div key={field.name} style={{ marginBottom: '1.375rem' }}>
                <label
                  style={{
                    ...S.label,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '0.5rem',
                  }}
                >
                  {field.label}
                </label>
                {field.hint && <p style={S.hint}>{field.hint}</p>}
                <GroupField
                  field={field}
                  value={state[field.name]}
                  onChange={(v) => updateField(field.name, v)}
                  relOptions={relOptions}
                />
              </div>
            )
          }

          return (
            <div key={field.name} style={{ marginBottom: '1.25rem' }}>
              <label style={S.label}>
                {field.label}
                {field.required && <span style={{ color: '#e2725b' }}> *</span>}
                {field.readOnly && (
                  <span
                    style={{
                      marginLeft: '0.375rem',
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      fontWeight: 400,
                    }}
                  >
                    (read only)
                  </span>
                )}
              </label>
              <FieldInput
                field={field}
                value={state[field.name]}
                onChange={(v) => updateField(field.name, v)}
                relOptions={relOptions}
              />
              {field.hint && <p style={S.hint}>{field.hint}</p>}
            </div>
          )
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.6875rem 0.875rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: feedback.type === 'ok' ? '#f0fdf4' : '#fff5f4',
            border: `1px solid ${feedback.type === 'ok' ? '#bbf7d0' : '#fccaca'}`,
            color: feedback.type === 'ok' ? '#166534' : '#c0392b',
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          {docId &&
            !isGlobal &&
            (confirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Delete this {collectionLabel}?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '0.45rem 0.875rem',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  style={{
                    padding: '0.45rem 0.875rem',
                    background: 'none',
                    color: '#64748b',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '7px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={deleting || saving}
                style={{
                  padding: '0.6rem 1.125rem',
                  background: 'none',
                  color: deleting ? '#94a3b8' : '#dc2626',
                  border: '1.5px solid',
                  borderColor: deleting ? '#e2e8f0' : '#fca5a5',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            ))}
        </div>

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <a
            href={returnPath}
            style={{
              padding: '0.6rem 1.125rem',
              background: 'none',
              color: '#64748b',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.6rem 1.5rem',
              background: saving ? '#4a9090' : '#0e6e6e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background 0.15s',
            }}
          >
            {saving && (
              <span
                aria-hidden="true"
                style={{
                  width: '13px',
                  height: '13px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'nog-spin 0.65s linear infinite',
                  display: 'inline-block',
                }}
              />
            )}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}
