'use client'
import { useEffect, useRef } from 'react'

export function DiagnosticCapture() {
  const hasError = useRef(false)

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (hasError.current) return
      hasError.current = true
      const msg = [
        `${event.message}`,
        `File: ${event.filename}`,
        `Line ${event.lineno}:${event.colno}`,
        event.error?.stack ? `\nStack trace:\n${event.error.stack}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      console.error('[NOG Admin] JavaScript error caught:', msg)
      showDiag('JavaScript Error', msg, 'error')
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      if (hasError.current) return
      hasError.current = true
      const reason = event.reason
      const msg =
        reason instanceof Error
          ? `${reason.message}\n\nStack trace:\n${reason.stack ?? 'unavailable'}`
          : String(reason)
      console.error('[NOG Admin] Unhandled promise rejection:', msg)
      showDiag('Unhandled Promise Rejection', msg, 'error')
    }

    // After 8 s with no Payload content in DOM → show diagnostic
    const timer = setTimeout(() => {
      if (hasError.current) return
      const rendered = document.querySelector(
        '.login, .dashboard, .collection-list, [class*="template-"]',
      )
      if (!rendered) {
        const msg = [
          'The admin UI did not render within 8 seconds.',
          '',
          'Steps to diagnose:',
          '1. Open DevTools → Network tab (disable cache).',
          '2. Reload — look for any red (failed) requests.',
          '3. Open DevTools → Console — look for any red errors.',
          '4. Visit /api/health to confirm DB is reachable.',
          '',
          `Page URL: ${window.location.href}`,
          `User agent: ${navigator.userAgent}`,
        ].join('\n')
        console.warn('[NOG Admin] UI not rendered after 8 s:', msg)
        showDiag('Admin UI did not render', msg, 'warning')
      }
    }, 8000)

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      clearTimeout(timer)
    }
  }, [])

  return null
}

function showDiag(title: string, message: string, type: 'error' | 'warning') {
  if (typeof document === 'undefined') return
  if (document.getElementById('__nog_admin_diag')) return

  const accent = type === 'error' ? '#ff5555' : '#ffaa00'
  const bg = type === 'error' ? '#1a0000' : '#1a1000'

  const el = document.createElement('div')
  el.id = '__nog_admin_diag'
  el.setAttribute(
    'style',
    [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      `background:${bg}`,
      'color:#e8e6e1',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'padding:2rem',
      'overflow:auto',
      'font-family:ui-monospace,SFMono-Regular,monospace',
      'font-size:13px',
      'line-height:1.6',
    ].join(';'),
  )

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  el.innerHTML = `
    <div style="max-width:860px;width:100%;padding-top:1rem">
      <p style="font-size:1.4rem;font-weight:700;color:${accent};margin:0 0 0.25rem;font-family:system-ui,sans-serif">
        NOG Lab — Admin Diagnostic
      </p>
      <p style="color:#888;margin:0 0 1.25rem;font-family:system-ui,sans-serif;font-size:0.8rem">
        This overlay only appears in production when the admin fails to load. Share a screenshot with your developer.
      </p>
      <p style="font-weight:600;color:${accent};margin:0 0 0.5rem;font-family:system-ui,sans-serif">${esc(title)}</p>
      <pre style="background:#0a0a0a;border:1px solid ${accent}55;border-radius:6px;padding:1rem;white-space:pre-wrap;word-break:break-all;color:#ffb3b3;margin:0 0 1.25rem;overflow-x:auto">${esc(message)}</pre>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;font-family:system-ui,sans-serif">
        <button onclick="document.getElementById('__nog_admin_diag').remove()"
          style="padding:0.5rem 1rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer">
          Dismiss
        </button>
        <button onclick="window.location.reload()"
          style="padding:0.5rem 1rem;background:#0e6e6e;color:#fff;border:none;border-radius:4px;cursor:pointer">
          Reload page
        </button>
        <button onclick="window.open('/api/health','_blank')"
          style="padding:0.5rem 1rem;background:#222;color:#ccc;border:1px solid #444;border-radius:4px;cursor:pointer">
          Check DB health
        </button>
      </div>
    </div>
  `

  document.body.appendChild(el)
}
