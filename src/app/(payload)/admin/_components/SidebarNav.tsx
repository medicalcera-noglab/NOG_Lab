'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// ── icon library (inline SVG paths) ─────────────────────────────
const ICONS: Record<string, string> = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  publications:
    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  people:
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  projects: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  blog_posts: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  news_events:
    'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18',
  research_themes:
    'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  study_sites:
    'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
  collaborators:
    'M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17',
  impact_stories:
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  media_coverage:
    'M23 7l-7 5 7 5V7z M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  open_positions:
    'M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6 M12 12l9-9 M15 3h6v6 M9 12H3 M12 9V3',
  inquiries:
    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  applicant_files:
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15l3 3 3-3',
  media:
    'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  users: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  audit_log:
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  site_settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
  navigation: 'M3 12h18 M3 6h18 M3 18h18',
  about: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  page_seo: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  legal_pages: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  outreach_activities:
    'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  outreach_page: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z',
  partnerships_page:
    'M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17',
  account: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  view_site: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
  sign_out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
}

function Icon({ id, size = 14 }: { id: string; size?: number }) {
  const d = ICONS[id] ?? ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {d
        .split(' M')
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={(i === 0 ? '' : 'M') + seg} />
        ))}
    </svg>
  )
}

// ── nav data ────────────────────────────────────────────────────
const COLLECTIONS = [
  { slug: 'publications', label: 'Publications', icon: 'publications' },
  { slug: 'people', label: 'People', icon: 'people' },
  { slug: 'projects', label: 'Projects', icon: 'projects' },
  { slug: 'blog_posts', label: 'Blog Posts', icon: 'blog_posts' },
  { slug: 'news_events', label: 'News & Events', icon: 'news_events' },
  { slug: 'research_themes', label: 'Research Themes', icon: 'research_themes' },
  { slug: 'study_sites', label: 'Study Sites', icon: 'study_sites' },
  { slug: 'collaborators', label: 'Partner Institutions', icon: 'collaborators' },
  { slug: 'outreach_activities', label: 'Outreach Activities', icon: 'outreach_activities' },
  { slug: 'impact_stories', label: 'Impact Stories', icon: 'impact_stories' },
  { slug: 'media_coverage', label: 'Media Coverage', icon: 'media_coverage' },
  { slug: 'open_positions', label: 'Open Positions', icon: 'open_positions' },
  { slug: 'inquiries', label: 'Inquiries', icon: 'inquiries' },
  { slug: 'applicant_files', label: 'Applicant Files', icon: 'applicant_files' },
]

const SYSTEM = [
  { slug: 'users', label: 'Users', icon: 'users' },
  { slug: 'media', label: 'Media Library', icon: 'media' },
  { slug: 'audit_log', label: 'Audit Log', icon: 'audit_log' },
]

const GLOBALS = [
  { slug: 'site_settings', label: 'Site Settings', icon: 'site_settings' },
  { slug: 'navigation', label: 'Navigation', icon: 'navigation' },
  { slug: 'about', label: 'About Page', icon: 'about' },
  { slug: 'outreach_page', label: 'Outreach Page', icon: 'outreach_page' },
  { slug: 'partnerships_page', label: 'Partnerships Page', icon: 'partnerships_page' },
  { slug: 'page_seo', label: 'Page SEO', icon: 'page_seo' },
  { slug: 'legal_pages', label: 'Legal Pages', icon: 'legal_pages' },
]

// ── sub-components (declared outside to avoid react-hooks/static-components) ──
function NavItem({
  href,
  label,
  icon,
  active,
  accent = 'teal',
  badge,
}: {
  href: string
  label: string
  icon: string
  active: boolean
  accent?: 'teal' | 'coral'
  badge?: number
}) {
  const accentColor = accent === 'teal' ? '#0ec8a0' : '#e2725b'
  const accentBg = accent === 'teal' ? 'rgba(14,200,160,0.14)' : 'rgba(226,114,91,0.14)'

  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.4375rem 0.75rem',
        margin: '1px 0.625rem',
        fontSize: '0.84375rem',
        fontWeight: active ? 600 : 400,
        color: active ? accentColor : 'rgba(255,255,255,0.45)',
        background: active ? accentBg : 'transparent',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'background 0.12s, color 0.12s',
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.78)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
        }
      }}
    >
      <Icon id={icon} size={14} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      {badge != null && badge > 0 && (
        <span
          style={{
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
            background: '#e2725b',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            flexShrink: 0,
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </a>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '0.625rem 1.375rem 0.3rem',
        fontSize: '0.625rem',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.11em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────
export function SidebarNav() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const isDashboard = pathname === '/admin/dashboard' || pathname === '/admin'

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((j: unknown) => {
        const user = (j as Record<string, unknown>)?.user as Record<string, unknown> | undefined
        if (user?.email) setUserEmail(String(user.email))
      })
      .catch(() => null)
  }, [])

  const colActive = (slug: string) => pathname.startsWith(`/admin/collections/${slug}`)
  const globActive = (slug: string) => pathname.startsWith(`/admin/globals/${slug}`)

  const avatarLetter = userEmail ? userEmail[0]!.toUpperCase() : '?'

  return (
    <>
      <style>{`
        .nog-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .nog-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .nog-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .nog-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>
      <aside
        style={{
          width: '232px',
          flexShrink: 0,
          background: 'linear-gradient(180deg, #080e18 0%, #060c14 100%)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.055)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.35)',
        }}
      >
        {/* ── Logo ── */}
        <a
          href="/admin/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.125rem 1.125rem 1rem',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #0e6e6e 0%, #10c0a0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(14,200,160,0.45)',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path
                d="M7 21V7l14 14V7"
                stroke="#fff"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                fontFamily: 'var(--admin-font-heading, system-ui)',
              }}
            >
              NOG Lab
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontSize: '0.625rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginTop: '1px',
              }}
            >
              Admin Portal
            </div>
          </div>
        </a>

        {/* ── Dashboard ── */}
        <div style={{ paddingTop: '0.625rem', flexShrink: 0 }}>
          <NavItem
            href="/admin/dashboard"
            label="Dashboard"
            icon="dashboard"
            active={isDashboard}
          />
        </div>

        {/* ── Scrollable nav ── */}
        <nav
          className="nog-sidebar-scroll"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '0.5rem' }}
        >
          {/* Collections */}
          <SectionLabel label="Collections" />
          {COLLECTIONS.map(({ slug, label, icon }) => (
            <NavItem
              key={slug}
              href={`/admin/collections/${slug}`}
              label={label}
              icon={icon}
              active={colActive(slug)}
              badge={slug === 'inquiries' ? undefined : undefined}
            />
          ))}

          {/* System */}
          <div style={{ margin: '0.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.055)' }} />
          <SectionLabel label="System" />
          {SYSTEM.map(({ slug, label, icon }) => (
            <NavItem
              key={slug}
              href={`/admin/collections/${slug}`}
              label={label}
              icon={icon}
              active={colActive(slug)}
            />
          ))}

          {/* Globals */}
          <div style={{ margin: '0.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.055)' }} />
          <SectionLabel label="Globals" />
          {GLOBALS.map(({ slug, label, icon }) => (
            <NavItem
              key={slug}
              href={`/admin/globals/${slug}`}
              label={label}
              icon={icon}
              active={globActive(slug)}
              accent="coral"
            />
          ))}
        </nav>

        {/* ── User profile footer ── */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
            padding: '0.75rem',
          }}
        >
          {/* Account Settings */}
          <a
            href="/admin/account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              textDecoration: 'none',
              marginBottom: '0.5rem',
              transition: 'background 0.12s, border-color 0.12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #0e6e6e 0%, #0a9090 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {avatarLetter}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userEmail ?? 'Account'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6875rem' }}>
                Edit profile
              </div>
            </div>
            <Icon id="account" size={13} />
          </a>

          {/* Quick links row */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.4375rem',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.75rem',
                textDecoration: 'none',
                borderRadius: '7px',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }}
            >
              <Icon id="view_site" size={12} />
              <span>Site</span>
            </a>
            <a
              href="/admin/logout"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.4375rem',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.75rem',
                textDecoration: 'none',
                borderRadius: '7px',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(226,114,91,0.12)'
                e.currentTarget.style.color = 'rgba(226,114,91,0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }}
            >
              <Icon id="sign_out" size={12} />
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}
