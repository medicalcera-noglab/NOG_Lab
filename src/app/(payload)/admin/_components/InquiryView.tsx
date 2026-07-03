'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type InquiryDoc = {
  id: string
  name?: string
  email?: string
  formType?: 'contact' | 'join'
  message?: string
  positionTitle?: string
  cvUrl?: string
  cvFilename?: string
  sopUrl?: string
  sopFilename?: string
  replyText?: string
  isRead?: boolean
  repliedAt?: string
  createdAt?: string
}

export function InquiryView({ doc, returnPath }: { doc: InquiryDoc; returnPath: string }) {
  const router = useRouter()
  const [replyText, setReplyText] = useState(doc.replyText ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const createdDate = doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  async function handleSaveReply() {
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch(`/api/inquiries/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          replyText,
          isRead: true,
          repliedAt: replyText ? new Date().toISOString() : null,
        }),
      })
      if (res.ok) {
        setFeedback({ type: 'ok', msg: 'Reply saved. Marked as replied.' })
        setTimeout(() => setFeedback(null), 3000)
        router.refresh()
      } else {
        setFeedback({ type: 'err', msg: 'Save failed.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Network error.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkRead() {
    await fetch(`/api/inquiries/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isRead: true }),
    })
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this inquiry? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/inquiries/${doc.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) router.push(returnPath)
    else {
      setFeedback({ type: 'err', msg: 'Delete failed.' })
      setDeleting(false)
    }
  }

  function handlePrintLetter() {
    const w = window.open('', '_blank', 'width=800,height=900')
    if (!w) return

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Reply Letter — ${doc.name ?? 'Applicant'}</title>
<style>
  @page { margin: 2cm 2.5cm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #1a1a1a; line-height: 1.7; }
  .header { border-bottom: 2px solid #0e6e6e; padding-bottom: 1rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; }
  .lab-name { font-size: 18pt; font-weight: bold; color: #0e6e6e; margin: 0; }
  .lab-sub { font-size: 10pt; color: #555; margin: 0; }
  .date { text-align: right; margin-bottom: 2rem; }
  .salutation { margin-bottom: 1.5rem; }
  .body { white-space: pre-wrap; margin-bottom: 2rem; }
  .closing { margin-top: 2rem; }
  .sig-line { margin-top: 2.5rem; border-top: 1px solid #999; padding-top: 0.5rem; display: inline-block; min-width: 200px; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <p class="lab-name">NOG Lab — KMU</p>
    <p class="lab-sub">Neglected & Orphan Disease Research Group · Khyber Medical University</p>
  </div>
</div>
<div class="date">${today}</div>
<div class="salutation">Dear ${doc.name ?? 'Applicant'},</div>
<div class="body">${(replyText || '(No reply text entered yet.)').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
<div class="closing">
  <p>Sincerely,</p>
  <div class="sig-line">PI / Lab Director<br />NOG Lab, KMU</div>
</div>
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`)
    w.document.close()
  }

  return (
    <>
      <style>{`
        .inq-dl-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.375rem 0.875rem; background: #f0fafa; border: 1px solid #b0dada; border-radius: 6px; color: #0e6e6e; font-size: 0.8125rem; font-weight: 500; text-decoration: none; transition: background 0.13s; }
        .inq-dl-btn:hover { background: #dcf4f4; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div style={{ maxWidth: '760px' }}>
        {/* Message card */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          }}
        >
          {/* Message header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!doc.isRead && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#e2725b',
                        flexShrink: 0,
                      }}
                      aria-label="Unread"
                    />
                  )}
                  <span
                    style={{
                      fontSize: '1.0625rem',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {doc.name ?? '(Unknown)'}
                  </span>
                </div>
                <a
                  href={`mailto:${doc.email ?? ''}`}
                  style={{ fontSize: '0.8125rem', color: '#0e6e6e', textDecoration: 'none' }}
                >
                  {doc.email}
                </a>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background:
                      doc.formType === 'join' ? 'rgba(14,110,110,0.10)' : 'rgba(226,114,91,0.10)',
                    color: doc.formType === 'join' ? '#0e6e6e' : '#e2725b',
                    marginBottom: '0.375rem',
                  }}
                >
                  {doc.formType === 'join' ? 'Join Application' : 'Contact Inquiry'}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                  }}
                >
                  {createdDate}
                </p>
              </div>
            </div>

            {doc.positionTitle && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(14,110,110,0.06)',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#374151',
                }}
              >
                <strong>Position:</strong> {doc.positionTitle}
              </div>
            )}
          </div>

          {/* Message body */}
          <div style={{ padding: '1.5rem' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                color: '#1e293b',
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}
            >
              {doc.message ?? '(No message content)'}
            </p>
          </div>

          {/* File attachments */}
          {(doc.cvUrl || doc.sopUrl) && (
            <div
              style={{
                padding: '0.875rem 1.5rem',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                gap: '0.625rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Attachments
              </span>
              {doc.cvUrl && (
                <a
                  href={doc.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inq-dl-btn"
                  download={doc.cvFilename ?? true}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 2v8M5 7l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 13h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {doc.cvFilename ?? 'Download CV'}
                </a>
              )}
              {doc.sopUrl && (
                <a
                  href={doc.sopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inq-dl-btn"
                  download={doc.sopFilename ?? true}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 2v8M5 7l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 13h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {doc.sopFilename ?? 'Download SOP'}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Reply section */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.25rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <h2
            style={{
              margin: '0 0 1rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Reply / Response
          </h2>

          {doc.repliedAt && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
              Replied on{' '}
              {new Date(doc.repliedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={8}
            placeholder="Write your reply here…"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              color: '#0f172a',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0e6e6e'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,110,110,0.12)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

          {feedback && (
            <div
              role="alert"
              style={{
                marginTop: '0.75rem',
                padding: '0.6rem 0.875rem',
                borderRadius: '7px',
                fontSize: '0.875rem',
                background: feedback.type === 'ok' ? '#f0fdf4' : '#fff5f4',
                border: `1px solid ${feedback.type === 'ok' ? '#bbf7d0' : '#fccaca'}`,
                color: feedback.type === 'ok' ? '#166534' : '#c0392b',
              }}
            >
              {feedback.msg}
            </div>
          )}

          <div
            style={{
              marginTop: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleSaveReply}
              disabled={saving}
              style={{
                padding: '0.5rem 1.25rem',
                background: saving ? '#4a9090' : '#0e6e6e',
                color: '#fff',
                border: 'none',
                borderRadius: '7px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save Reply'}
            </button>

            {replyText && (
              <button
                type="button"
                onClick={handlePrintLetter}
                style={{
                  padding: '0.5rem 1.125rem',
                  background: 'none',
                  color: '#64748b',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '7px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 5V2h8v3"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="2"
                    y="5"
                    width="12"
                    height="7"
                    rx="1.25"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M4 10h8v4H4z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
                Print Reply Letter
              </button>
            )}

            {!doc.isRead && (
              <button
                type="button"
                onClick={handleMarkRead}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'none',
                  color: '#64748b',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '7px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Mark as Read
              </button>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a
            href={returnPath}
            style={{
              padding: '0.5rem 1rem',
              color: '#64748b',
              border: '1.5px solid #e2e8f0',
              borderRadius: '7px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            ← Back to Inquiries
          </a>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              color: deleting ? '#94a3b8' : '#dc2626',
              border: '1.5px solid',
              borderColor: deleting ? '#e2e8f0' : '#fca5a5',
              borderRadius: '7px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            {deleting ? 'Deleting…' : 'Delete Inquiry'}
          </button>
        </div>
      </div>
    </>
  )
}
