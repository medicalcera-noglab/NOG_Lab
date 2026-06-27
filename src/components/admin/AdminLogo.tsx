export function AdminLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-stacked.svg" alt="NOG Lab" width="148" style={{ display: 'block' }} />
      <span
        style={{
          fontSize: '10px',
          fontWeight: 500,
          color: 'var(--theme-elevation-500, #888)',
          letterSpacing: '0.7px',
          textTransform: 'uppercase',
          paddingLeft: '2px',
        }}
      >
        Admin Portal
      </span>
    </div>
  )
}
