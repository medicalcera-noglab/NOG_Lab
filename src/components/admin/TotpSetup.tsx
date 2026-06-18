'use client'

/**
 * TOTP Setup UI — rendered in the Payload admin as a custom component.
 * Shows QR code, prompts for confirmation code, then displays backup codes once.
 */
import { useState } from 'react'

type Step = 'idle' | 'scanning' | 'confirming' | 'done'

interface SetupState {
  qrDataUrl: string
  otpauthUri: string
}

export function TotpSetup({ totpEnabled }: { totpEnabled: boolean }) {
  const [step, setStep] = useState<Step>('idle')
  const [setupData, setSetupData] = useState<SetupState | null>(null)
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function startSetup() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/totp/setup', { method: 'POST', credentials: 'include' })
      const data = (await res.json()) as { qrDataUrl?: string; otpauthUri?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to start setup')
        return
      }
      setSetupData({ qrDataUrl: data.qrDataUrl!, otpauthUri: data.otpauthUri! })
      setStep('scanning')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function confirmCode() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/totp/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = (await res.json()) as { backupCodes?: string[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Invalid code')
        return
      }
      setBackupCodes(data.backupCodes!)
      setStep('done')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function disable() {
    const userCode = window.prompt('Enter your current TOTP code or a backup code to disable 2FA:')
    if (!userCode) return
    setLoading(true)
    try {
      const res = await fetch('/api/totp/disable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: userCode }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to disable')
        return
      }
      window.location.reload()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (totpEnabled && step === 'idle') {
    return (
      <div style={{ padding: '16px 0' }}>
        <p
          style={{ marginBottom: 12, color: 'var(--theme-success-500, #16a34a)', fontWeight: 600 }}
        >
          Two-factor authentication is enabled.
        </p>
        {error && (
          <p style={{ color: 'var(--theme-error-500, #dc2626)', marginBottom: 8 }}>{error}</p>
        )}
        <button
          type="button"
          onClick={disable}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: 'var(--theme-error-400, #f87171)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Working…' : 'Disable 2FA'}
        </button>
      </div>
    )
  }

  if (step === 'idle') {
    return (
      <div style={{ padding: '16px 0' }}>
        <p style={{ marginBottom: 12, color: 'var(--theme-text)' }}>
          Two-factor authentication is not enabled. Enable it to require a TOTP code on every login.
        </p>
        {error && (
          <p style={{ color: 'var(--theme-error-500, #dc2626)', marginBottom: 8 }}>{error}</p>
        )}
        <button
          type="button"
          onClick={startSetup}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: 'var(--theme-success-500, #16a34a)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Working…' : 'Enable 2FA'}
        </button>
      </div>
    )
  }

  if (step === 'scanning' && setupData) {
    return (
      <div style={{ padding: '16px 0', maxWidth: 400 }}>
        <p style={{ marginBottom: 12 }}>
          Scan this QR code with Google Authenticator, Authy, or any TOTP app:
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- QR is a data URL, not a CMS image */}
        <img
          src={setupData.qrDataUrl}
          alt="TOTP QR code"
          width={200}
          height={200}
          style={{ display: 'block', marginBottom: 16, borderRadius: 4 }}
        />
        <p
          style={{
            fontSize: 12,
            color: 'var(--theme-elevation-400)',
            marginBottom: 16,
            wordBreak: 'break-all',
          }}
        >
          Manual entry: <code>{setupData.otpauthUri}</code>
        </p>
        <label htmlFor="totp-code" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
          Enter the 6-digit code to confirm:
        </label>
        <input
          id="totp-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--theme-border-color)',
            borderRadius: 4,
            fontSize: 18,
            letterSpacing: 4,
            width: 140,
          }}
          aria-label="Six-digit TOTP confirmation code"
        />
        {error && <p style={{ color: 'var(--theme-error-500, #dc2626)', marginTop: 8 }}>{error}</p>}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={confirmCode}
            disabled={loading || code.length !== 6}
            style={{
              padding: '8px 16px',
              background: '#0E6E6E',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Verifying…' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('idle')
              setCode('')
              setSetupData(null)
              setError('')
            }}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--theme-border-color)',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div style={{ padding: '16px 0', maxWidth: 480 }}>
        <p
          style={{ marginBottom: 12, color: 'var(--theme-success-500, #16a34a)', fontWeight: 600 }}
        >
          Two-factor authentication enabled successfully!
        </p>
        <p style={{ marginBottom: 8 }}>
          Save these backup codes somewhere safe. Each can be used <strong>once</strong> to sign in
          if you lose your authenticator app. They will not be shown again.
        </p>
        <ul
          style={{
            fontFamily: 'monospace',
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
            marginBottom: 16,
          }}
        >
          {backupCodes.map((c) => (
            <li
              key={c}
              style={{
                background: 'var(--theme-elevation-50)',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              {c}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: '#0E6E6E',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    )
  }

  return null
}
