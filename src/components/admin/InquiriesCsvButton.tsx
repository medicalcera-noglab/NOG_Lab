'use client'

import { useState } from 'react'

export function InquiriesCsvButton() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/export/inquiries')
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSV export failed', err)
      alert('Export failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: '1px solid var(--theme-border-color, #e5e7eb)',
        background: 'var(--theme-elevation-0, #fff)',
        cursor: loading ? 'wait' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Exporting…' : 'Export CSV'}
    </button>
  )
}
