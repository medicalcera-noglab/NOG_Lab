'use client'

export function NavBackToSite() {
  return (
    <div
      style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--theme-border-color, rgba(255,255,255,0.1))',
      }}
    >
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 10px',
          borderRadius: '6px',
          border: '1px solid var(--theme-border-color, rgba(255,255,255,0.15))',
          background: 'transparent',
          color: 'var(--theme-elevation-400, #999)',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: 500,
          transition: 'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--theme-text, inherit)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor =
            'var(--theme-elevation-400, #999)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--theme-elevation-400, #999)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor =
            'var(--theme-border-color, rgba(255,255,255,0.15))'
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M2 8H14M14 8L9 3M14 8L9 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        View Live Site
      </a>
    </div>
  )
}
