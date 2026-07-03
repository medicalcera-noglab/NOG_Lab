import type { ReactNode } from 'react'
import { SidebarNav } from './SidebarNav'

interface Props {
  children: ReactNode
  /** Page title shown in the top content bar */
  title?: string
  /** Breadcrumb items rendered before the title */
  breadcrumbs?: { label: string; href?: string }[]
  /** Action button rendered in the top-right of the content bar */
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
          background: '#f0f4f8',
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
                padding: '0 2rem',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                {breadcrumbs?.map((crumb, i) => (
                  <span
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
                  >
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        style={{
                          fontSize: '0.875rem',
                          color: '#64748b',
                          textDecoration: 'none',
                          fontWeight: 400,
                        }}
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{crumb.label}</span>
                    )}
                    <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>›</span>
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
              {action && (
                <a
                  href={action.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.4375rem 1rem',
                    background: '#0e6e6e',
                    color: '#fff',
                    borderRadius: '7px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
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
