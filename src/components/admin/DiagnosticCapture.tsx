'use client'
import { useEffect, useRef } from 'react'

export function DiagnosticCapture() {
  const hasShown = useRef(false)

  useEffect(() => {
    // Capture global JS errors
    const onError = (event: ErrorEvent) => {
      const msg = [
        `${event.message}`,
        `File: ${event.filename}`,
        `Line ${event.lineno}:${event.colno}`,
        event.error?.stack ? `\nStack trace:\n${event.error.stack}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      console.error('[NOG Admin] JS error:', msg)
      showDiag('JavaScript Error', msg, 'error')
    }

    // Capture unhandled promise rejections
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const msg =
        reason instanceof Error
          ? `${reason.message}\n\nStack:\n${reason.stack ?? 'unavailable'}`
          : String(reason)
      console.error('[NOG Admin] Unhandled promise rejection:', msg)
      showDiag('Unhandled Promise Rejection', msg, 'error')
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    // After 3 s — dump DOM diagnostic to console AND check visibility
    const diagTimer = setTimeout(() => {
      if (hasShown.current) return

      // Collect diagnostic data
      const theme = document.documentElement.getAttribute('data-theme') ?? 'not set'
      const bodyBg = window.getComputedStyle(document.body).backgroundColor
      const bodyColor = window.getComputedStyle(document.body).color

      const cssLinks = Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
      )
        .map((l) => l.href)
        .join('\n')

      const failed = performance
        .getEntriesByType('resource')
        .filter(
          (e) =>
            (e as PerformanceResourceTiming).responseStatus >= 400 ||
            (e as PerformanceResourceTiming).responseStatus === 0,
        )
        .map(
          (e) =>
            `${e.name}  →  status ${(e as PerformanceResourceTiming).responseStatus ?? 'failed'}`,
        )
        .join('\n')

      const templateEl = document.querySelector<HTMLElement>(
        '.template-minimal, [class*="template-"], .login-view, .render-root',
      )
      const inputEl = document.querySelector<HTMLInputElement>(
        'input[name="email"], input[type="email"]',
      )

      // Log everything to console so the developer can see it
      console.group('[NOG Admin] 3-second DOM diagnostic — share this with your developer')
      console.log('Page URL:', window.location.href)
      console.log('data-theme:', theme)
      console.log('body background-color:', bodyBg)
      console.log('body color:', bodyColor)
      console.log('Template element:', templateEl ? templateEl.className : 'NOT FOUND')
      console.log('Email input:', inputEl ? 'FOUND' : 'NOT FOUND')
      if (inputEl) {
        const r = inputEl.getBoundingClientRect()
        const s = window.getComputedStyle(inputEl)
        console.log('  → rect:', r.width, '×', r.height, 'at', r.left, r.top)
        console.log(
          '  → display:',
          s.display,
          '  visibility:',
          s.visibility,
          '  opacity:',
          s.opacity,
        )
      }
      console.log('Loaded stylesheets:', cssLinks || '(none)')
      console.log('Failed resources:', failed || '(none)')
      console.log(
        'document.body.innerHTML (first 5000 chars):\n',
        document.body.innerHTML.substring(0, 5000),
      )
      console.groupEnd()

      // Determine which problem to surface on-screen
      if (!inputEl) {
        // Login form not in DOM at all
        const msg = [
          'The email input (login form) did NOT appear in the DOM after 3 seconds.',
          '',
          `data-theme: ${theme}`,
          `body background: ${bodyBg}`,
          `Template element: ${templateEl ? templateEl.className : 'not found'}`,
          '',
          'Loaded stylesheets:',
          cssLinks || '(none)',
          '',
          'Failed network resources:',
          failed || '(none)',
          '',
          'Check DevTools → Console for the full diagnostic output including the DOM.',
        ].join('\n')
        showDiag('Login form did not render', msg, 'warning')
      } else {
        // Login form IS in DOM — check if it's actually visible
        const rect = inputEl.getBoundingClientRect()
        const styles = window.getComputedStyle(inputEl)
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          styles.display !== 'none' &&
          styles.visibility !== 'hidden' &&
          styles.opacity !== '0'

        if (!isVisible) {
          const msg = [
            'The login form exists in the DOM but is NOT visible on screen.',
            'This is almost certainly a CSS problem.',
            '',
            `Input dimensions: ${rect.width}w × ${rect.height}h`,
            `display: ${styles.display}`,
            `visibility: ${styles.visibility}`,
            `opacity: ${styles.opacity}`,
            `color: ${styles.color}`,
            `background-color: ${styles.backgroundColor}`,
            '',
            'Loaded stylesheets:',
            cssLinks || '(none)',
            '',
            'Failed network resources:',
            failed || '(none)',
          ].join('\n')
          showDiag('Login form is invisible — CSS issue', msg, 'warning')
        }
      }
    }, 3000)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      clearTimeout(diagTimer)
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
      'font-size:12px',
      'line-height:1.6',
    ].join(';'),
  )

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  el.innerHTML = `
    <div style="max-width:900px;width:100%;padding-top:1rem">
      <p style="font-size:1.3rem;font-weight:700;color:${accent};margin:0 0 0.2rem;font-family:system-ui,sans-serif">
        NOG Lab — Admin Diagnostic
      </p>
      <p style="color:#888;margin:0 0 1rem;font-family:system-ui,sans-serif;font-size:0.75rem">
        Share a screenshot of this page AND the DevTools → Console tab with your developer.
      </p>
      <p style="font-weight:600;color:${accent};margin:0 0 0.5rem;font-family:system-ui,sans-serif;font-size:0.9rem">${esc(title)}</p>
      <pre style="background:#0a0a0a;border:1px solid ${accent}44;border-radius:6px;padding:1rem;white-space:pre-wrap;word-break:break-all;color:#ffccaa;margin:0 0 1rem;overflow-x:auto;max-height:60vh">${esc(message)}</pre>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;font-family:system-ui,sans-serif">
        <button onclick="document.getElementById('__nog_admin_diag').remove()"
          style="padding:0.5rem 1rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px">
          Dismiss
        </button>
        <button onclick="window.location.reload()"
          style="padding:0.5rem 1rem;background:#0e6e6e;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px">
          Reload
        </button>
        <button onclick="window.open('/api/health','_blank')"
          style="padding:0.5rem 1rem;background:#222;color:#ccc;border:1px solid #444;border-radius:4px;cursor:pointer;font-size:13px">
          Check DB health
        </button>
      </div>
    </div>
  `

  document.body.appendChild(el)
}
