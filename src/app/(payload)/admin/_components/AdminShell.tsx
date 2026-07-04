import type { ReactNode } from 'react'
import { SidebarNav } from './SidebarNav'

interface Props {
  children: ReactNode
  title?: string
  breadcrumbs?: { label: string; href?: string }[]
  action?: { label: string; href: string }
}

export function AdminShell({ children, title, breadcrumbs, action }: Props) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; }
        @keyframes nog-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          fontFamily: "var(--admin-font-body, 'Inter', system-ui)",
          background: '#eef2f7',
        }}
      >
        <SidebarNav />

        {/* Content column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          {(title || breadcrumbs || action) && (
            <header
              style={{
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                padding: '0 1.75rem',
                height: '54px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                zIndex: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* Left: breadcrumbs + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                {breadcrumbs?.map((crumb, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      flexShrink: 0,
                    }}
                  >
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        style={{
                          fontSize: '0.8125rem',
                          color: '#94a3b8',
                          textDecoration: 'none',
                          fontWeight: 400,
                          transition: 'color 0.12s',
                        }}
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{crumb.label}</span>
                    )}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path
                        d="M6 12l4-4-4-4"
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ))}
                {title && (
                  <h1
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      margin: 0,
                      letterSpacing: '-0.02em',
                      fontFamily: 'var(--admin-font-heading, system-ui)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title}
                  </h1>
                )}
              </div>

              {/* Right: action button */}
              {action && (
                <a
                  href={action.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.4375rem 1rem',
                    background: 'linear-gradient(135deg, #0e6e6e 0%, #0a9090 100%)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(14,110,110,0.28)',
                    transition: 'opacity 0.15s, box-shadow 0.15s',
                  }}
                >
                  {action.label}
                </a>
              )}
            </header>
          )}

          {/* Page content */}
          <main style={{ flex: 1, overflowX: 'hidden' }}>{children}</main>
        </div>
      </div>
    </>
  )
}
