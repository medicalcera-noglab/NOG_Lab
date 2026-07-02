import Link from 'next/link'

/**
 * Root-level 404 fallback — applies to ALL routes including the Payload admin.
 * Must NOT reference frontend-only CSS variables (--bg, --fg, etc.) because
 * globals.css is only loaded in the (frontend) route group.
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <p
        style={{ fontSize: '4rem', fontWeight: 700, margin: '0 0 0.5rem', fontFamily: 'monospace' }}
      >
        404
      </p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1rem' }}>Page not found</h1>
      <p style={{ margin: '0 0 2rem', maxWidth: '24rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '0.625rem 1.25rem',
          borderRadius: '0.5rem',
          background: '#0e6e6e',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        Go home
      </Link>
    </div>
  )
}
