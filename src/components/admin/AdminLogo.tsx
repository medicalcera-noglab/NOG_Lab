export function AdminLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        userSelect: 'none',
      }}
    >
      {/* Hexagon mark */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon points="18,2 33,10 33,26 18,34 3,26 3,10" fill="#0E6E6E" />
        <text
          x="18"
          y="23"
          textAnchor="middle"
          fill="white"
          fontSize="13"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          letterSpacing="-0.5"
        >
          NOG
        </text>
      </svg>

      {/* Wordmark */}
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--theme-text, #1a1a1a)',
            letterSpacing: '-0.3px',
          }}
        >
          NOG Lab
        </div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 500,
            color: 'var(--theme-elevation-500, #888)',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginTop: '1px',
          }}
        >
          Admin Portal
        </div>
      </div>
    </div>
  )
}
