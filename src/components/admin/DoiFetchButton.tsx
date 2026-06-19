'use client'

import React, { useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import type { FormState } from 'payload'

interface FetchedFields {
  title: string
  journal: string
  type: string
  year: number
  authors: { author: string }[]
  crossrefRaw: unknown
}

interface ApiResponse {
  ok: boolean
  fields: FetchedFields
  abstractPreview: string | null
  error?: string
}

export function DoiFetchButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [abstractPreview, setAbstractPreview] = useState<string | null>(null)

  const { value: doi } = useField<string>({ path: 'doi' })

  // Read the current number of author rows so we can clear them before re-populating.
  const [existingAuthorCount, dispatch] = useFormFields(
    ([fields, d]) =>
      [Object.keys(fields).filter((k) => /^authors\.\d+\.author$/.test(k)).length, d] as const,
  )

  async function handleFetch() {
    if (!doi?.trim()) {
      setMsg('Enter a DOI in the field above first.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setMsg('')
    setAbstractPreview(null)

    let data: ApiResponse
    try {
      const res = await fetch('/api/doi-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doi }),
        credentials: 'include',
      })
      data = (await res.json()) as ApiResponse
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? 'Unknown error from server.')
        setStatus('error')
        return
      }
    } catch {
      setMsg('Network error — could not reach the server.')
      setStatus('error')
      return
    }

    const f = data.fields

    // ── Update scalar / JSON fields ──────────────────────────────────────────
    dispatch({ type: 'UPDATE', path: 'title', value: f.title })
    dispatch({ type: 'UPDATE', path: 'journal', value: f.journal })
    dispatch({ type: 'UPDATE', path: 'year', value: f.year })
    dispatch({ type: 'UPDATE', path: 'type', value: f.type })
    dispatch({ type: 'UPDATE', path: 'crossrefRaw', value: f.crossrefRaw })

    // ── Rebuild the authors array ────────────────────────────────────────────
    // Remove existing rows from last to first to avoid index shift.
    for (let i = existingAuthorCount - 1; i >= 0; i--) {
      dispatch({ type: 'REMOVE_ROW', path: 'authors', rowIndex: i })
    }
    // Add new rows with pre-populated subFieldState.
    for (const [i, { author }] of f.authors.entries()) {
      const subFieldState: FormState = {
        author: { value: author, initialValue: author, valid: true },
      }
      dispatch({ type: 'ADD_ROW', path: 'authors', rowIndex: i, subFieldState })
    }

    if (data.abstractPreview) setAbstractPreview(data.abstractPreview)

    setStatus('success')
    setMsg(
      `Populated from Crossref. Review all fields below and save.${data.abstractPreview ? ' Abstract preview shown below — paste into the Abstract field.' : ''}`,
    )
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        onClick={handleFetch}
        disabled={status === 'loading'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: status === 'loading' ? 'wait' : 'pointer',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
      >
        {status === 'loading' ? '⟳ Fetching from Crossref…' : '⟿ Fetch metadata from DOI'}
      </button>

      {(status === 'error' || status === 'success') && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          style={{
            marginTop: '6px',
            fontSize: '12px',
            lineHeight: 1.5,
            color:
              status === 'error'
                ? 'var(--theme-error-500, #dc2626)'
                : 'var(--theme-success-500, #16a34a)',
          }}
        >
          {msg}
        </p>
      )}

      {abstractPreview && (
        <details
          style={{
            marginTop: '8px',
            fontSize: '12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            padding: '8px',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--theme-text)',
              marginBottom: '4px',
            }}
          >
            Abstract preview (copy into Abstract field below)
          </summary>
          <p
            style={{
              color: 'var(--theme-text)',
              lineHeight: 1.6,
              marginTop: '6px',
              userSelect: 'text',
            }}
          >
            {abstractPreview}
          </p>
        </details>
      )}
    </div>
  )
}
