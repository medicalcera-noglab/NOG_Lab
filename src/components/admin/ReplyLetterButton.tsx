'use client'

import { useDocumentInfo } from '@payloadcms/ui'

export function ReplyLetterButton() {
  const { id } = useDocumentInfo()

  if (!id) return null

  return (
    <div
      style={{
        marginTop: '8px',
        padding: '16px',
        background: 'color-mix(in oklch, var(--theme-elevation-100) 60%, transparent)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '8px',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          color: 'var(--theme-elevation-500)',
          marginBottom: '10px',
          lineHeight: 1.5,
        }}
      >
        Save the record first, then generate the A4 reply letter. Opens in a new tab — use Ctrl+P /
        Cmd+P and choose &quot;Save as PDF&quot;.
      </p>
      <a
        href={`/api/reply-letter/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 18px',
          background: 'var(--theme-success-500, #0E6E6E)',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        📄 Generate Reply Letter (A4)
      </a>
    </div>
  )
}
