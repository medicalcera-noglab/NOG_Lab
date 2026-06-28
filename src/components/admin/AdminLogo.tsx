export function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/NOG_LAB.png"
        alt="NOG Lab"
        style={{ height: '40px', width: 'auto', objectFit: 'contain', display: 'block' }}
      />
      <span
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--theme-text, #fff)',
          letterSpacing: '0.3px',
        }}
      >
        NOG Lab
        <span
          style={{
            display: 'block',
            fontSize: '9px',
            fontWeight: 500,
            color: 'var(--theme-elevation-500, #888)',
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
          }}
        >
          Admin Portal
        </span>
      </span>
    </div>
  )
}
