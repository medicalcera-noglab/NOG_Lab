import type { ReactNode } from 'react'
import { SidebarNav } from './SidebarNav'

export function AdminShell({ children }: { children: ReactNode }) {
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
          background: '#f1f5f9',
        }}
      >
        <SidebarNav />
        <div style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>{children}</div>
      </div>
    </>
  )
}
