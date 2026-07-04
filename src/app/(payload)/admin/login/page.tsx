'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'credentials' | 'totp'

export default function AdminLogin() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
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
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!res.ok) {
        const errs = json.errors as { message: string }[] | undefined
        setError(errs?.[0]?.message ?? 'Invalid email or password')
        return
      }
      const requiresTOTP =
        (json.user as Record<string, unknown> | undefined)?.requiresTOTP === true ||
        res.headers.get('X-Requires-TOTP') === '1'
      if (requiresTOTP) {
        setStep('totp')
        return
      }
      router.push('/admin/dashboard')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/totp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode.replace(/\s/g, '') }),
        credentials: 'include',
      })
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!res.ok) {
        setError(String(json.error ?? 'Invalid code — please try again'))
        return
      }
      router.push('/admin/dashboard')
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
        body { margin: 0; }

        @keyframes l-spin { to { transform: rotate(360deg); } }
        @keyframes l-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes l-float-1 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(8px,-14px); }
        }
        @keyframes l-float-2 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-10px,10px); }
        }
        @keyframes l-float-3 {
          0%,100% { transform: translate(0,0); }
          33%      { transform: translate(6px,-8px); }
          66%      { transform: translate(-4px,6px); }
        }
        @keyframes l-pulse-ring {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        .l-input {
          display: block; width: 100%;
          padding: 0.6875rem 0.875rem;
          border: 1.5px solid #dde4ed;
          border-radius: 10px;
          font-size: 0.9375rem; color: #0f172a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: var(--admin-font-body, system-ui);
          background: #fff;
        }
        .l-input::placeholder { color: #a8b4c4; }
        .l-input:focus {
          border-color: #0e6e6e;
          box-shadow: 0 0 0 3px rgba(14,110,110,0.13);
        }
        .l-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }

        .l-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #0e6e6e 0%, #0a9090 100%);
          color: #fff; border: none; border-radius: 10px;
          font-size: 0.9375rem; font-weight: 600;
          font-family: var(--admin-font-heading, system-ui);
          cursor: pointer; letter-spacing: -0.01em;
          transition: opacity 0.15s, box-shadow 0.15s, transform 0.1s;
          box-shadow: 0 4px 16px rgba(14,110,110,0.32);
        }
        .l-btn:hover:not(:disabled) {
          opacity: 0.92;
          box-shadow: 0 6px 22px rgba(14,110,110,0.42);
          transform: translateY(-1px);
        }
        .l-btn:active:not(:disabled) { transform: scale(0.988); }
        .l-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .l-back {
          background: none; border: none; color: #8fa0b0;
          font-size: 0.8125rem; cursor: pointer; padding: 0;
          text-decoration: underline; text-underline-offset: 2px;
          margin-top: 1.125rem; display: block; width: 100%; text-align: center;
        }
        .l-back:hover { color: #64748b; }

        @media (max-width: 767px) {
          .l-left-panel { display: none !important; }
          .l-right-panel { flex: 1 !important; max-width: 100% !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          fontFamily: "var(--admin-font-body, 'Inter', system-ui)",
        }}
      >
        {/* ── Left: brand panel ── */}
        <div
          className="l-left-panel"
          style={{
            flex: '0 0 52%',
            maxWidth: '52%',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(160deg, #051818 0%, #082828 45%, #0a3838 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '3rem',
          }}
        >
          {/* Hex grid background */}
          <svg
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.055,
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="hex-grid"
                x="0"
                y="0"
                width="60"
                height="52"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points="30,2 58,17 58,35 30,50 2,35 2,17"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-grid)" />
          </svg>

          {/* Floating glow blobs */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div
              style={{
                position: 'absolute',
                top: '14%',
                right: '-80px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14,170,140,0.18) 0%, transparent 70%)',
                animation: 'l-float-1 11s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '18%',
                left: '-60px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(226,114,91,0.14) 0%, transparent 70%)',
                animation: 'l-float-2 14s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '52%',
                right: '18%',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14,200,160,0.12) 0%, transparent 70%)',
                animation: 'l-float-3 8s ease-in-out infinite',
              }}
            />
          </div>

          {/* Logo / brand */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '1rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="NOG Lab logo"
                width={50}
                height={50}
                style={{ display: 'block' }}
              />
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: '1.4375rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                fontFamily: 'var(--admin-font-heading, system-ui)',
              }}
            >
              NOG Lab
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Admin Portal
            </div>
          </div>

          {/* Center hero text */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
            }}
          >
            {/* Pulse icon */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                border: '1.5px solid rgba(14,200,160,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(14,200,160,0.15)',
                  animation: 'l-pulse-ring 2.8s ease-out infinite',
                }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"
                  stroke="rgba(14,200,160,0.75)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 700,
                margin: '0 0 1rem',
                letterSpacing: '-0.04em',
                lineHeight: 1.25,
                fontFamily: 'var(--admin-font-heading, system-ui)',
              }}
            >
              Manage your
              <br />
              research content
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.42)',
                fontSize: '0.9375rem',
                lineHeight: 1.75,
                margin: 0,
                maxWidth: '340px',
              }}
            >
              Publications, people, projects and site settings — all in one place for the
              Neurological Outcomes Group Lab at KMU.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '2rem' }}>
              {['Publications', 'People', 'Projects', 'Blog', 'Settings'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '0.275rem 0.7rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.38)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              color: 'rgba(255,255,255,0.18)',
              fontSize: '0.75rem',
            }}
          >
            Neurological Outcomes Group · Khyber Medical University
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div
          className="l-right-panel"
          style={{
            flex: '0 0 48%',
            maxWidth: '48%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#f0f4f8',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              animation: 'l-fade-up 0.44s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Form card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '2.25rem 2.25rem 2.375rem',
                boxShadow:
                  '0 0 0 1px rgba(0,0,0,0.055), 0 4px 8px rgba(0,0,0,0.055), 0 24px 64px rgba(0,0,0,0.09)',
              }}
            >
              {step === 'credentials' ? (
                <>
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h2
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0 0 0.375rem',
                        letterSpacing: '-0.03em',
                        fontFamily: 'var(--admin-font-heading, system-ui)',
                      }}
                    >
                      Welcome back
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#8fa0b0', margin: 0 }}>
                      Sign in to your admin account
                    </p>
                  </div>

                  <form onSubmit={handleCredentials} noValidate>
                    <div style={{ marginBottom: '1rem' }}>
                      <label
                        htmlFor="l-email"
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '0.375rem',
                        }}
                      >
                        Email address
                      </label>
                      <input
                        id="l-email"
                        className="l-input"
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

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label
                        htmlFor="l-password"
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '0.375rem',
                        }}
                      >
                        Password
                      </label>
                      <input
                        id="l-password"
                        className="l-input"
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
                          borderRadius: '9px',
                          color: '#c0392b',
                          fontSize: '0.8125rem',
                          lineHeight: 1.55,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                          style={{ flexShrink: 0, marginTop: '1px' }}
                        >
                          <circle cx="8" cy="8" r="6.5" stroke="#e53e3e" strokeWidth="1.3" />
                          <path
                            d="M8 5v3.5M8 11h.01"
                            stroke="#e53e3e"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                        {error}
                      </div>
                    )}

                    <button type="submit" className="l-btn" disabled={loading}>
                      {loading && (
                        <span
                          aria-hidden="true"
                          style={{
                            width: '15px',
                            height: '15px',
                            border: '2.25px solid rgba(255,255,255,0.28)',
                            borderTopColor: '#fff',
                            borderRadius: '50%',
                            animation: 'l-spin 0.65s linear infinite',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(14,110,110,0.1)',
                        marginBottom: '1rem',
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="5"
                          y="11"
                          width="14"
                          height="10"
                          rx="2"
                          stroke="#0e6e6e"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 11V7a4 4 0 0 1 8 0v4"
                          stroke="#0e6e6e"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <h2
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0 0 0.375rem',
                        letterSpacing: '-0.03em',
                        fontFamily: 'var(--admin-font-heading, system-ui)',
                      }}
                    >
                      Two-factor auth
                    </h2>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#8fa0b0',
                        margin: 0,
                        lineHeight: 1.65,
                      }}
                    >
                      Enter the 6-digit code for{' '}
                      <strong style={{ color: '#475569' }}>{email}</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleTotp} noValidate>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label
                        htmlFor="l-totp"
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '0.375rem',
                        }}
                      >
                        Authenticator code
                      </label>
                      <input
                        id="l-totp"
                        className="l-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9 ]*"
                        maxLength={7}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        required
                        autoComplete="one-time-code"
                        autoFocus
                        placeholder="000 000"
                        disabled={loading}
                        style={{
                          textAlign: 'center',
                          fontSize: '1.625rem',
                          letterSpacing: '0.25em',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
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
                          borderRadius: '9px',
                          color: '#c0392b',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {error}
                      </div>
                    )}

                    <button type="submit" className="l-btn" disabled={loading}>
                      {loading && (
                        <span
                          aria-hidden="true"
                          style={{
                            width: '15px',
                            height: '15px',
                            border: '2.25px solid rgba(255,255,255,0.28)',
                            borderTopColor: '#fff',
                            borderRadius: '50%',
                            animation: 'l-spin 0.65s linear infinite',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {loading ? 'Verifying…' : 'Verify & Sign In →'}
                    </button>

                    <button
                      type="button"
                      className="l-back"
                      onClick={() => {
                        setStep('credentials')
                        setTotpCode('')
                        setError('')
                      }}
                    >
                      ← Back to sign in
                    </button>
                  </form>
                </>
              )}
            </div>

            <p
              style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.75rem',
                margin: '1.375rem 0 0',
              }}
            >
              Internal use only · NOG Lab at KMU
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
