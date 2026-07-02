'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f7f7f5',
          color: '#1a1a1a',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              margin: '0 0 0.5rem',
              fontFamily: 'monospace',
            }}
          >
            500
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
            Something went wrong
          </h1>
          {error?.message && (
            <pre
              style={{
                background: '#fff',
                border: '1px solid #d4d2cb',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.8125rem',
                textAlign: 'left',
                overflow: 'auto',
                marginBottom: '1.5rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {error.message}
              {error.digest ? `\n\nDigest: ${error.digest}` : ''}
            </pre>
          )}
          <button
            onClick={reset}
            style={{
              display: 'inline-block',
              padding: '0.625rem 1.5rem',
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
        </div>
      </body>
    </html>
  )
}
