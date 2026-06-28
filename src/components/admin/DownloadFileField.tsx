'use client'

import { useField } from '@payloadcms/ui'
import { Download } from 'lucide-react'

export function DownloadFileField() {
  const { value } = useField<string>({})

  if (!value) {
    return (
      <p style={{ color: 'var(--theme-elevation-400)', fontSize: '13px', margin: '4px 0 0' }}>
        No file stored — applicant did not upload, or Vercel Blob was not configured at submission
        time.
      </p>
    )
  }

  const filename = value.split('/').pop() ?? 'Download file'

  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '4px',
        padding: '6px 14px',
        borderRadius: '6px',
        background: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-elevation-200)',
        color: 'var(--theme-text)',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <Download size={13} />
      {filename}
    </a>
  )
}
