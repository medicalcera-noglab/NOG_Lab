'use client'

export default function AdminPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '36rem', width: '100%' }}>
        <p
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0 0 0.5rem',
            fontFamily: 'monospace',
            color: '#e2725b',
          }}
        >
          Admin Page Error
        </p>
        <h1 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem', color: '#1a1a1a' }}>
          The admin page failed to load. This error is caught at the page boundary.
        </h1>
        {error?.message && (
          <pre
            style={{
              background: '#f7f7f5',
              border: '1px solid #d4d2cb',
              borderRadius: '0.5rem',
              padding: '0.875rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#1a1a1a',
            }}
          >
            {error.message}
            {error.digest ? `\n\nDigest: ${error.digest}` : ''}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              background: '#0e6e6e',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Try again
          </button>
          <button
            onClick={() => window.open('/api/health', '_blank')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: '#0e6e6e',
              border: '1px solid #0e6e6e',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Check DB health
          </button>
        </div>
      </div>
    </div>
  )
}
