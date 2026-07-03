'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { FieldDef } from '@/lib/admin-collections'

// ── Lexical helpers ─────────────────────────────────────────────

function lexicalToText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  const root = (content as Record<string, unknown>).root as Record<string, unknown> | undefined
  if (!root) return ''

  function extractNode(node: Record<string, unknown>): string {
    if (node.type === 'text') return String(node.text ?? '')
    if (Array.isArray(node.children)) {
      const joined = (node.children as Record<string, unknown>[]).map(extractNode).join('')
      if (node.type === 'paragraph' || node.type === 'heading') return joined + '\n'
      return joined
    }
    return ''
  }

  const children = root.children as Record<string, unknown>[] | undefined
  return (children ?? []).map(extractNode).join('').trim()
}

function textToLexical(text: string) {
  const lines = text.split('\n').filter((s) => s.trim())
  const paragraphs = lines.length
    ? lines.map((line) => ({
        type: 'paragraph',
        children: [
          { type: 'text', text: line, version: 1, format: 0, detail: 0, mode: 'normal', style: '' },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      }))
    : [
        {
          type: 'paragraph',
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ]
  return {
    root: {
      type: 'root',
      children: paragraphs,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ── Relationship helpers ─────────────────────────────────────────

function extractRelId(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'object' && 'id' in (val as Record<string, unknown>))
    return String((val as Record<string, string>).id)
  return String(val)
}

function extractRelIds(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.map(extractRelId)
}

// ── Upload value type ────────────────────────────────────────────

type UploadValue = { id: string; url: string; alt: string } | null

function extractUploadValue(raw: unknown): UploadValue {
  if (!raw) return null
  if (typeof raw === 'object' && 'id' in (raw as Record<string, unknown>)) {
    const doc = raw as Record<string, unknown>
    return { id: String(doc.id), url: String(doc.url ?? ''), alt: String(doc.alt ?? '') }
  }
  return { id: String(raw), url: '', alt: '' }
}

// ── Init helpers ─────────────────────────────────────────────────

type FormState = Record<string, unknown>

function initState(data: FormState, fields: FieldDef[]): FormState {
  const state: FormState = {}
  for (const field of fields) {
    const raw = data[field.name]

    if (field.type === 'richtext') {
      state[field.name] = lexicalToText(raw)
    } else if (field.type === 'relationship') {
      state[field.name] = field.hasMany ? extractRelIds(raw) : extractRelId(raw)
    } else if (field.type === 'upload') {
      state[field.name] = extractUploadValue(raw)
    } else if (field.type === 'date' && raw) {
      state[field.name] = String(raw).substring(0, 10)
    } else if (field.type === 'array') {
      state[field.name] = Array.isArray(raw) ? raw : []
    } else if (field.type === 'group') {
      const groupData = raw && typeof raw === 'object' ? (raw as FormState) : {}
      state[field.name] = initState(groupData, field.fields ?? [])
    } else if (field.type === 'checkbox') {
      state[field.name] = Boolean(raw)
    } else {
      state[field.name] = raw ?? ''
    }
  }
  return state
}

function buildPayload(state: FormState, fields: FieldDef[]): FormState {
  const result: FormState = {}
  for (const field of fields) {
    const val = state[field.name]
    if (field.readOnly) continue

    if (field.type === 'richtext') {
      result[field.name] = typeof val === 'string' ? textToLexical(val as string) : val
    } else if (field.type === 'number') {
      result[field.name] = val === '' || val === null || val === undefined ? null : Number(val)
    } else if (field.type === 'upload') {
      const uv = val as UploadValue
      result[field.name] = uv?.id ?? null
    } else if (field.type === 'group') {
      result[field.name] = buildPayload((val as FormState) ?? {}, field.fields ?? [])
    } else {
      result[field.name] = val
    }
  }
  return result
}

// ── Shared styles ────────────────────────────────────────────────

const S = {
  input: {
    display: 'block',
    width: '100%',
    padding: '0.55rem 0.75rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '7px',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.3rem',
  } as React.CSSProperties,
  hint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  } as React.CSSProperties,
}

// ── Sub-components ───────────────────────────────────────────────

import type React from 'react'

// ── Media upload field ───────────────────────────────────────────

function MediaUploadField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: UploadValue) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uv = (value as UploadValue) ?? null

  const isImage = uv?.url
    ? /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(uv.url) || uv.url.startsWith('data:image')
    : false

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))

      const res = await fetch('/api/media', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as Record<string, unknown>
        const errs = j.errors as { message: string }[] | undefined
        throw new Error(errs?.[0]?.message ?? `Upload failed (${res.status})`)
      }

      const j = (await res.json()) as { doc?: Record<string, unknown> }
      const doc = j.doc ?? {}
      onChange({
        id: String(doc.id),
        url: String(doc.url ?? ''),
        alt: String(doc.alt ?? file.name),
      })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      style={{
        border: '1.5px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.875rem',
        background: '#f8fafc',
      }}
    >
      {uv ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
          {isImage && (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                background: '#fff',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uv.url}
                alt={uv.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          {!isImage && uv.url && (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <polyline
                  points="13 2 13 9 20 9"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: '0 0 0.25rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#1e293b',
                wordBreak: 'break-all',
              }}
            >
              {uv.alt || 'Media file'}
            </p>
            {uv.url && (
              <a
                href={uv.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', color: '#0e6e6e', wordBreak: 'break-all' }}
              >
                View file ↗
              </a>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '0.3rem 0.75rem',
                  background: '#0e6e6e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? 'Uploading…' : 'Replace'}
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                style={{
                  padding: '0.3rem 0.75rem',
                  background: 'none',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem' }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ margin: '0 auto 0.625rem', display: 'block', opacity: 0.35 }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="#64748b" strokeWidth="1.5" />
            <path d="M21 15l-5-5L5 21" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#64748b' }}>
            No file selected
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '0.4rem 1rem',
              background: '#0e6e6e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={field.accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label={`Upload ${field.label}`}
      />

      {uploadError && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{uploadError}</p>
      )}
    </div>
  )
}

// ── FieldInput ───────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  relOptions,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
  relOptions: Record<string, { id: string; label: string }[]>
}) {
  const disabled = field.readOnly

  const focusStyle = { borderColor: '#0e6e6e', boxShadow: '0 0 0 3px rgba(14,110,110,0.12)' }

  if (field.type === 'upload') {
    return (
      <MediaUploadField
        field={field}
        value={value}
        onChange={onChange as (v: UploadValue) => void}
      />
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{ width: '16px', height: '16px', accentColor: '#0e6e6e' }}
        />
        <span style={{ fontSize: '0.875rem', color: '#374151' }}>{value ? 'Yes' : 'No'}</span>
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...S.input,
          appearance: 'auto',
          background: disabled ? '#f8fafc' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <option value="">— Select —</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'textarea' || field.type === 'richtext') {
    return (
      <textarea
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        readOnly={disabled}
        rows={field.type === 'richtext' ? 8 : 4}
        style={{
          ...S.input,
          resize: 'vertical',
          lineHeight: 1.6,
          background: disabled ? '#f8fafc' : '#fff',
        }}
        onFocus={(e) => {
          if (!disabled) Object.assign(e.currentTarget.style, focusStyle)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    )
  }

  if (field.type === 'relationship') {
    const opts = relOptions[field.relationTo ?? ''] ?? []

    if (field.hasMany) {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div
          style={{
            border: '1.5px solid #e2e8f0',
            borderRadius: '7px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: disabled ? '#f8fafc' : '#fff',
          }}
        >
          {opts.length === 0 && (
            <p
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}
            >
              Loading options…
            </p>
          )}
          {opts.map((opt) => (
            <label
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt.id]
                    : selected.filter((id) => id !== opt.id)
                  onChange(next)
                }}
                disabled={disabled}
                style={{ accentColor: '#0e6e6e' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      )
    }

    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ ...S.input, appearance: 'auto', background: disabled ? '#f8fafc' : '#fff' }}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <option value="">— None —</option>
        {opts.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  // text / email / number / date
  const inputType =
    field.type === 'email'
      ? 'email'
      : field.type === 'number'
        ? 'number'
        : field.type === 'date'
          ? 'date'
          : 'text'

  return (
    <input
      type={inputType}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      readOnly={disabled}
      required={field.required}
      style={{
        ...S.input,
        background: disabled ? '#f8fafc' : '#fff',
        cursor: disabled ? 'not-allowed' : undefined,
      }}
      onFocus={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, focusStyle)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

// ── Array field ──────────────────────────────────────────────────

function ArrayField({
  field,
  value,
  onChange,
  relOptions,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
  relOptions: Record<string, { id: string; label: string }[]>
}) {
  const rows = Array.isArray(value) ? (value as FormState[]) : []
  const subFields = field.fields ?? []

  function addRow() {
    const empty: FormState = {}
    for (const f of subFields) {
      if (f.type === 'upload') empty[f.name] = null
      else if (f.type === 'checkbox') empty[f.name] = false
      else empty[f.name] = ''
    }
    onChange([...rows, empty])
  }

  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i))
  }

  function updateRow(i: number, subName: string, val: unknown) {
    const updated = rows.map((row, idx) => (idx === i ? { ...row, [subName]: val } : row))
    onChange(updated)
  }

  return (
    <div>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '0.625rem',
            background: '#f8fafc',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => removeRow(i)}
            style={{
              position: 'absolute',
              top: '0.6rem',
              right: '0.6rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '1rem',
              lineHeight: 1,
              padding: '2px 6px',
            }}
            aria-label="Remove row"
          >
            ×
          </button>

          {subFields.length === 1 ? (
            <FieldInput
              field={subFields[0]}
              value={row[subFields[0].name] ?? ''}
              onChange={(v) => updateRow(i, subFields[0].name, v)}
              relOptions={relOptions}
            />
          ) : (
            subFields.map((sf) => (
              <div key={sf.name} style={{ marginBottom: '0.5rem' }}>
                <label style={S.label}>{sf.label}</label>
                <FieldInput
                  field={sf}
                  value={row[sf.name] ?? ''}
                  onChange={(v) => updateRow(i, sf.name, v)}
                  relOptions={relOptions}
                />
              </div>
            ))
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        style={{
          padding: '0.4rem 0.875rem',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '7px',
          background: 'none',
          color: '#64748b',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        + Add row
      </button>
    </div>
  )
}

// ── Group field ──────────────────────────────────────────────────

function GroupField({
  field,
  value,
  onChange,
  relOptions,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
  relOptions: Record<string, { id: string; label: string }[]>
}) {
  const groupData = (value && typeof value === 'object' ? value : {}) as FormState
  const subFields = field.fields ?? []

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        background: '#f8fafc',
      }}
    >
      {subFields.map((sf) => (
        <div key={sf.name} style={{ marginBottom: '0.75rem' }}>
          <label style={S.label}>{sf.label}</label>
          <FieldInput
            field={sf}
            value={groupData[sf.name] ?? ''}
            onChange={(v) => onChange({ ...groupData, [sf.name]: v })}
            relOptions={relOptions}
          />
        </div>
      ))}
    </div>
  )
}

// ── Main form component ──────────────────────────────────────────

type Props = {
  apiSlug: string
  docId?: string
  initialData?: FormState
  fields: FieldDef[]
  returnPath: string
  collectionLabel: string
  isGlobal?: boolean
}

export function DocForm({
  apiSlug,
  docId,
  initialData = {},
  fields,
  returnPath,
  collectionLabel,
  isGlobal = false,
}: Props) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(() => initState(initialData, fields))
  const [relOptions, setRelOptions] = useState<Record<string, { id: string; label: string }[]>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  // Fetch options for all relationship fields
  useEffect(() => {
    const scan = (fs: FieldDef[]): FieldDef[] =>
      fs.flatMap((f) => {
        const nested = scan(f.fields ?? [])
        return f.type === 'relationship' && f.relationTo ? [f, ...nested] : nested
      })
    const allRelFields = scan(fields)
    const slugs = [...new Set(allRelFields.map((f) => f.relationTo!))]
    if (!slugs.length) return

    Promise.all(
      slugs.map((slug) =>
        fetch(`/api/${slug}?limit=200&depth=0`, { credentials: 'include' })
          .then((r) => r.json())
          .then((data) => {
            const docs = (data.docs ?? []) as Record<string, unknown>[]
            const opts = docs.map((d) => ({
              id: String(d.id),
              label: String(d.name ?? d.title ?? d.email ?? d.id ?? '?'),
            }))
            return [slug, opts] as [string, typeof opts]
          })
          .catch(() => [slug, []] as [string, never[]]),
      ),
    ).then((results) => {
      setRelOptions(Object.fromEntries(results))
    })
  }, [fields])

  const updateField = useCallback((name: string, val: unknown) => {
    setState((prev) => ({ ...prev, [name]: val }))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const body = buildPayload(state, fields)

    try {
      let url: string
      let method: string

      if (isGlobal) {
        url = `/api/globals/${apiSlug}`
        method = 'PUT'
      } else {
        url = docId ? `/api/${apiSlug}/${docId}` : `/api/${apiSlug}`
        method = docId ? 'PATCH' : 'POST'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      })

      const json = await res.json().catch(() => ({}))

      if (res.ok) {
        if (!isGlobal && !docId) {
          const newId = (json as Record<string, unknown>).doc
            ? ((json as Record<string, unknown>).doc as Record<string, unknown>).id
            : (json as Record<string, unknown>).id
          router.push(`/admin/collections/${apiSlug}/${newId}`)
        } else {
          setFeedback({ type: 'ok', msg: 'Saved successfully.' })
          setTimeout(() => setFeedback(null), 3000)
        }
      } else {
        const errs = (json as Record<string, unknown>).errors as { message: string }[] | undefined
        setFeedback({ type: 'err', msg: errs?.[0]?.message ?? 'Save failed.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Network error — please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!docId || isGlobal) return
    if (!confirm(`Delete this ${collectionLabel} document? This cannot be undone.`)) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/${apiSlug}/${docId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        router.push(returnPath)
      } else {
        setFeedback({ type: 'err', msg: 'Delete failed.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Network error.' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} noValidate>
      <style>{`@keyframes nog-spin{to{transform:rotate(360deg)}}`}</style>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.75rem',
          marginBottom: '1.25rem',
        }}
      >
        {fields.map((field) => {
          if (field.type === 'array') {
            return (
              <div key={field.name} style={{ marginBottom: '1.375rem' }}>
                <label
                  style={{ ...S.label, fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}
                >
                  {field.label}
                  {field.required && <span style={{ color: '#e2725b' }}> *</span>}
                </label>
                {field.hint && <p style={S.hint}>{field.hint}</p>}
                <ArrayField
                  field={field}
                  value={state[field.name]}
                  onChange={(v) => updateField(field.name, v)}
                  relOptions={relOptions}
                />
              </div>
            )
          }

          if (field.type === 'group') {
            return (
              <div key={field.name} style={{ marginBottom: '1.375rem' }}>
                <label
                  style={{
                    ...S.label,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '0.5rem',
                  }}
                >
                  {field.label}
                </label>
                {field.hint && <p style={S.hint}>{field.hint}</p>}
                <GroupField
                  field={field}
                  value={state[field.name]}
                  onChange={(v) => updateField(field.name, v)}
                  relOptions={relOptions}
                />
              </div>
            )
          }

          return (
            <div key={field.name} style={{ marginBottom: '1.25rem' }}>
              <label style={S.label}>
                {field.label}
                {field.required && <span style={{ color: '#e2725b' }}> *</span>}
                {field.readOnly && (
                  <span
                    style={{
                      marginLeft: '0.375rem',
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      fontWeight: 400,
                    }}
                  >
                    (read only)
                  </span>
                )}
              </label>
              <FieldInput
                field={field}
                value={state[field.name]}
                onChange={(v) => updateField(field.name, v)}
                relOptions={relOptions}
              />
              {field.hint && <p style={S.hint}>{field.hint}</p>}
            </div>
          )
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.6875rem 0.875rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: feedback.type === 'ok' ? '#f0fdf4' : '#fff5f4',
            border: `1px solid ${feedback.type === 'ok' ? '#bbf7d0' : '#fccaca'}`,
            color: feedback.type === 'ok' ? '#166534' : '#c0392b',
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          {docId && !isGlobal && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{
                padding: '0.6rem 1.125rem',
                background: 'none',
                color: deleting ? '#94a3b8' : '#dc2626',
                border: '1.5px solid',
                borderColor: deleting ? '#e2e8f0' : '#fca5a5',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: deleting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <a
            href={returnPath}
            style={{
              padding: '0.6rem 1.125rem',
              background: 'none',
              color: '#64748b',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.6rem 1.5rem',
              background: saving ? '#4a9090' : '#0e6e6e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background 0.15s',
            }}
          >
            {saving && (
              <span
                aria-hidden="true"
                style={{
                  width: '13px',
                  height: '13px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'nog-spin 0.65s linear infinite',
                  display: 'inline-block',
                }}
              />
            )}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}
