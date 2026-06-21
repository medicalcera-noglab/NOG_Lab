'use client'
import { useAuth } from '@payloadcms/ui'

type AdminUser = { email?: string; role?: string }

const ROLE_CONFIG: Record<string, { label: string; bg: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    bg: '#0E6E6E',
    description: 'Full access — content, users, and site settings.',
  },
  editor: {
    label: 'Editor',
    bg: '#2563EB',
    description: 'Manage all content. Cannot edit users or settings.',
  },
  contributor: {
    label: 'Contributor',
    bg: '#D97706',
    description: 'Write blog posts and news. Publish requires review.',
  },
}

export function NavRoleBadge() {
  const { user } = useAuth<AdminUser>()
  if (!user) return null

  const role = user.role ?? 'contributor'
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.contributor
  const email = user.email ?? ''
  const displayEmail = email.length > 28 ? email.slice(0, 26) + '…' : email

  return (
    <div
      style={{
        padding: '10px 16px 12px',
        borderBottom: '1px solid var(--theme-border-color, rgba(255,255,255,0.1))',
        marginBottom: '2px',
      }}
    >
      {/* Email */}
      <p
        style={{
          fontSize: '11px',
          color: 'var(--theme-elevation-500, #888)',
          margin: '0 0 6px',
          lineHeight: 1,
          fontFamily: 'monospace',
        }}
      >
        {displayEmail}
      </p>

      {/* Role pill */}
      <span
        style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '999px',
          background: cfg.bg,
          color: '#fff',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.4px',
          marginBottom: '7px',
        }}
      >
        {cfg.label}
      </span>

      {/* Description */}
      <p
        style={{
          fontSize: '11px',
          color: 'var(--theme-elevation-400, #999)',
          margin: 0,
          lineHeight: 1.45,
        }}
      >
        {cfg.description}
      </p>
    </div>
  )
}
