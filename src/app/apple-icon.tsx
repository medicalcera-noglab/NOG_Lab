import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        background: '#0E6E6E',
      }}
    >
      {/* Membrane ring */}
      <div
        style={{
          position: 'absolute',
          width: 124,
          height: 124,
          borderRadius: '50%',
          border: '5px solid rgba(255,255,255,0.25)',
        }}
      />
      {/* Satellites */}
      {/* top */}
      <div
        style={{
          position: 'absolute',
          width: 31,
          height: 31,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.88)',
          top: 21,
          left: 75,
        }}
      />
      {/* bottom-right */}
      <div
        style={{
          position: 'absolute',
          width: 31,
          height: 31,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.88)',
          bottom: 18,
          right: 19,
        }}
      />
      {/* bottom-left */}
      <div
        style={{
          position: 'absolute',
          width: 31,
          height: 31,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.88)',
          bottom: 18,
          left: 19,
        }}
      />
      {/* Coral nucleus */}
      <div
        style={{
          width: 39,
          height: 39,
          borderRadius: '50%',
          background: '#E2725B',
        }}
      />
    </div>,
    { ...size },
  )
}
