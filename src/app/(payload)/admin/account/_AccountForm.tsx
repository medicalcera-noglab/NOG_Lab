'use client'

import { useState } from 'react'

interface Props {
  userId: number
  initialEmail: string
  initialName: string
}

export function AccountForm({ userId, initialEmail, initialName }: Props) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback(null)

    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({ type: 'error', msg: 'New passwords do not match.' })
      return
    }
    if (newPassword && newPassword.length < 8) {
      setFeedback({ type: 'error', msg: 'New password must be at least 8 characters.' })
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = { name, email }
      if (newPassword) {
        body.password = newPassword
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { errors?: { message: string }[] }
        setFeedback({
          type: 'error',
          msg: j.errors?.[0]?.message ?? 'Save failed — please try again.',
        })
        return
      }

      setFeedback({ type: 'success', msg: 'Account updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setFeedback({ type: 'error', msg: 'Network error — please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const avatarLetter = initialEmail ? initialEmail[0]!.toUpperCase() : '?'

  return (
    <>
      <style>{`
        @keyframes ac-spin { to { transform: rotate(360deg); } }
        .ac-input {
          display: block; width: 100%;
          padding: 0.6875rem 0.875rem;
          border: 1.5px solid #dde4ed; border-radius: 10px;
          font-size: 0.9375rem; color: #0f172a; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: var(--admin-font-body, system-ui);
          background: #fff;
        }
        .ac-input::placeholder { color: #a8b4c4; }
        .ac-input:focus { border-color: #0e6e6e; box-shadow: 0 0 0 3px rgba(14,110,110,0.12); }
        .ac-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
        .ac-label {
          display: block; font-size: 0.8125rem; font-weight: 600;
          color: #374151; margin-bottom: 0.375rem;
        }
        .ac-section {
          background: #fff; border-radius: 16px; padding: 1.75rem;
          border: 1px solid #e8edf4;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          margin-bottom: 1.25rem;
        }
        .ac-section-title {
          font-size: 0.9375rem; font-weight: 700; color: #0f172a;
          letter-spacing: -0.02em; margin: 0 0 0.375rem;
          font-family: var(--admin-font-heading, system-ui);
        }
        .ac-section-desc {
          font-size: 0.8125rem; color: #94a3b8; margin: 0 0 1.5rem;
        }
        .ac-field { margin-bottom: 1rem; }
        .ac-field:last-of-type { margin-bottom: 0; }
        .ac-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.6875rem 1.5rem;
          background: linear-gradient(135deg, #0e6e6e 0%, #0a9090 100%);
          color: #fff; border: none; border-radius: 10px;
          font-size: 0.9375rem; font-weight: 600; cursor: pointer;
          font-family: var(--admin-font-heading, system-ui);
          letter-spacing: -0.01em;
          transition: opacity 0.15s, box-shadow 0.15s, transform 0.1s;
          box-shadow: 0 4px 14px rgba(14,110,110,0.28);
        }
        .ac-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(14,110,110,0.36); }
        .ac-btn:active:not(:disabled) { transform: scale(0.988); }
        .ac-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <form onSubmit={handleSave} noValidate>
        {/* Avatar / Profile header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #0e6e6e 0%, #0a9090 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.375rem',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(14,110,110,0.32)',
            }}
          >
            {avatarLetter}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '1.0625rem',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--admin-font-heading, system-ui)',
              }}
            >
              {initialName || initialEmail}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.125rem' }}>
              Administrator
            </div>
          </div>
        </div>

        {/* Profile section */}
        <div className="ac-section">
          <h2 className="ac-section-title">Profile</h2>
          <p className="ac-section-desc">Update your display name and email address.</p>

          <div className="ac-field">
            <label htmlFor="ac-name" className="ac-label">
              Display name
            </label>
            <input
              id="ac-name"
              className="ac-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={saving}
            />
          </div>

          <div className="ac-field">
            <label htmlFor="ac-email" className="ac-label">
              Email address
            </label>
            <input
              id="ac-email"
              className="ac-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              disabled={saving}
            />
          </div>
        </div>

        {/* Password section */}
        <div className="ac-section">
          <h2 className="ac-section-title">Change password</h2>
          <p className="ac-section-desc">
            Leave blank to keep your current password. Must be at least 8 characters.
          </p>

          <div className="ac-field">
            <label htmlFor="ac-new-pw" className="ac-label">
              New password
            </label>
            <input
              id="ac-new-pw"
              className="ac-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={saving}
            />
          </div>

          <div className="ac-field">
            <label htmlFor="ac-confirm-pw" className="ac-label">
              Confirm new password
            </label>
            <input
              id="ac-confirm-pw"
              className="ac-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={saving}
            />
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            role="alert"
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              lineHeight: 1.55,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              background: feedback.type === 'success' ? '#f0fdf4' : '#fff5f4',
              border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fccaca'}`,
              color: feedback.type === 'success' ? '#15803d' : '#c0392b',
            }}
          >
            {feedback.type === 'success' ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ flexShrink: 0, marginTop: '1px' }}
              >
                <circle cx="8" cy="8" r="6.5" stroke="#15803d" strokeWidth="1.3" />
                <path
                  d="M5 8l2 2 4-4"
                  stroke="#15803d"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ flexShrink: 0, marginTop: '1px' }}
              >
                <circle cx="8" cy="8" r="6.5" stroke="#c0392b" strokeWidth="1.3" />
                <path
                  d="M8 5v3.5M8 11h.01"
                  stroke="#c0392b"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {feedback.msg}
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="ac-btn" disabled={saving}>
          {saving && (
            <span
              aria-hidden="true"
              style={{
                width: '15px',
                height: '15px',
                border: '2.25px solid rgba(255,255,255,0.28)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'ac-spin 0.65s linear infinite',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
          )}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </>
  )
}
