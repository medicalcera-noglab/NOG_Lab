'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.errors?.[0]?.message ?? 'Invalid email or password')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #050b17; }

        @keyframes nog-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nog-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nog-input {
          display: block;
          width: 100%;
          padding: 0.65rem 0.8125rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: 0.9375rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: var(--admin-font-body, system-ui);
          background: #fff;
        }
        .nog-input::placeholder { color: #a0aec0; }
        .nog-input:focus {
          border-color: #0e6e6e;
          box-shadow: 0 0 0 3px rgba(14, 110, 110, 0.14);
        }
        .nog-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }

        .nog-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.71875rem 1rem;
          background: #0e6e6e;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: var(--admin-font-heading, system-ui);
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
          letter-spacing: -0.01em;
        }
        .nog-btn:hover:not(:disabled) {
          background: #0b5c5c;
          box-shadow: 0 4px 14px rgba(14, 110, 110, 0.35);
        }
        .nog-btn:active:not(:disabled) { transform: scale(0.985); }
        .nog-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background:
            'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(14,110,110,0.18) 0%, transparent 70%), #050b17',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            animation: 'nog-up 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Brand header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '54px',
                height: '54px',
                borderRadius: '15px',
                background: 'linear-gradient(145deg, #0e6e6e 0%, #20a0a0 100%)',
                boxShadow:
                  '0 0 0 1px rgba(14,110,110,0.25), inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 28px rgba(14,110,110,0.3)',
                marginBottom: '1.125rem',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M7 21V7l14 14V7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1
              style={{
                color: '#f0f6ff',
                fontSize: '1.4375rem',
                fontWeight: 700,
                margin: '0 0 0.3rem',
                letterSpacing: '-0.03em',
                fontFamily: "var(--admin-font-heading, 'Plus Jakarta Sans', system-ui)",
              }}
            >
              NOG Lab Admin
            </h1>
            <p style={{ color: '#5a7080', fontSize: '0.8125rem', margin: 0 }}>
              Content management portal
            </p>
          </div>

          {/* Login card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '2rem 2rem 2.125rem',
              boxShadow:
                '0 0 0 1px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.28)',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#94a3b8',
                margin: '0 0 1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Administrator sign in
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="nog-email"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#334155',
                    marginBottom: '0.4rem',
                  }}
                >
                  Email address
                </label>
                <input
                  id="nog-email"
                  className="nog-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '1.625rem' }}>
                <label
                  htmlFor="nog-password"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#334155',
                    marginBottom: '0.4rem',
                  }}
                >
                  Password
                </label>
                <input
                  id="nog-password"
                  className="nog-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {error && (
                <div
                  role="alert"
                  style={{
                    marginBottom: '1.25rem',
                    padding: '0.6875rem 0.875rem',
                    background: '#fff5f4',
                    border: '1px solid #fccaca',
                    borderRadius: '8px',
                    color: '#c0392b',
                    fontSize: '0.8125rem',
                    lineHeight: 1.55,
                  }}
                >
                  {error}
                </div>
              )}

              <button type="submit" className="nog-btn" disabled={loading}>
                {loading && (
                  <span
                    aria-hidden="true"
                    style={{
                      width: '15px',
                      height: '15px',
                      border: '2.25px solid rgba(255,255,255,0.28)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'nog-spin 0.65s linear infinite',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                )}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p
            style={{
              textAlign: 'center',
              color: '#3a4a5a',
              fontSize: '0.6875rem',
              margin: '1.5rem 0 0',
              letterSpacing: '0.02em',
            }}
          >
            Neurological Outcomes Group Lab &mdash; Internal use only
          </p>
        </div>
      </div>
    </>
  )
}
