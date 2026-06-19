import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F7F5',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background teal accent blob */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'rgba(14,110,110,0.08)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(226,114,91,0.06)',
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: '#0E6E6E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: 32,
        }}
      >
        {/* Membrane ring */}
        <div
          style={{
            position: 'absolute',
            width: 82,
            height: 82,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.28)',
          }}
        />
        {/* Satellites */}
        <div
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)',
            top: 14,
            left: 50,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)',
            bottom: 12,
            right: 12,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)',
            bottom: 12,
            left: 12,
          }}
        />
        {/* Nucleus */}
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#E2725B',
          }}
        />
      </div>

      {/* Lab name */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: '#0E6E6E',
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: 16,
        }}
      >
        NOG Lab
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 20,
          color: '#6B6B68',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}
      >
        Nutrition · Oral · Gut Microbiome
      </div>
    </div>,
    { ...size },
  )
}
