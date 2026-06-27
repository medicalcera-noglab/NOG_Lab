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
      {/* NOG Lab logo mark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" width="36" height="36" aria-hidden="true" />

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
