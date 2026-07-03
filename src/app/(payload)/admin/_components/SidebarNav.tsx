'use client'

import { usePathname } from 'next/navigation'

const COLLECTIONS = [
  { slug: 'publications', label: 'Publications' },
  { slug: 'people', label: 'People' },
  { slug: 'projects', label: 'Projects' },
  { slug: 'blog_posts', label: 'Blog Posts' },
  { slug: 'news_events', label: 'News & Events' },
  { slug: 'research_themes', label: 'Research Themes' },
  { slug: 'study_sites', label: 'Study Sites' },
  { slug: 'collaborators', label: 'Collaborators' },
  { slug: 'impact_stories', label: 'Impact Stories' },
  { slug: 'media_coverage', label: 'Media Coverage' },
  { slug: 'open_positions', label: 'Open Positions' },
  { slug: 'inquiries', label: 'Inquiries' },
  { slug: 'applicant_files', label: 'Applicant Files' },
  { slug: 'users', label: 'Users' },
]

const GLOBALS = [
  { slug: 'site_settings', label: 'Site Settings' },
  { slug: 'navigation', label: 'Navigation' },
  { slug: 'about', label: 'About Page' },
  { slug: 'page_seo', label: 'Page SEO' },
  { slug: 'legal_pages', label: 'Legal Pages' },
]

export function SidebarNav() {
  const pathname = usePathname()
  const isDashboard = pathname === '/admin/dashboard' || pathname === '/admin'

  function colActive(slug: string) {
    return pathname.startsWith(`/admin/collections/${slug}`)
  }
  function globActive(slug: string) {
    return pathname.startsWith(`/admin/globals/${slug}`)
  }

  const navItem = (
    href: string,
    label: string,
    isActive: boolean,
    accent: 'teal' | 'coral' = 'teal',
  ) => (
    <a
      key={href}
      href={href}
      style={{
        display: 'block',
        padding: '0.4375rem 1rem 0.4375rem 1.125rem',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.48)',
        background: isActive
          ? accent === 'teal'
            ? 'rgba(14,170,140,0.15)'
            : 'rgba(226,114,91,0.15)'
          : 'transparent',
        borderLeft: isActive
          ? `3px solid ${accent === 'teal' ? '#0ec8a0' : '#e2725b'}`
          : '3px solid transparent',
        textDecoration: 'none',
        letterSpacing: '-0.01em',
        transition: 'background 0.12s, color 0.12s',
        borderRadius: '0 6px 6px 0',
        marginRight: '0.5rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(255,255,255,0.48)'
        }
      }}
    >
      {label}
    </a>
  )

  return (
    <aside
      style={{
        width: '240px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, #0c1a1a 0%, #091414 100%)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── Logo ── */}
      <a
        href="/admin/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.125rem 1rem 1rem',
          textDecoration: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
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
            boxShadow: '0 3px 12px rgba(14,110,110,0.5)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.6875rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            Admin Portal
          </div>
        </div>
      </a>

      {/* ── Dashboard ── */}
      <div style={{ padding: '0.75rem 0 0.25rem', flexShrink: 0 }}>
        {navItem('/admin/dashboard', '⊞  Dashboard', isDashboard, 'teal')}
      </div>

      {/* ── Scrollable nav ── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '0.75rem',
        }}
      >
        {/* Collections label */}
        <div
          style={{
            padding: '0.75rem 1rem 0.375rem',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Collections
        </div>
        {COLLECTIONS.map(({ slug, label }) =>
          navItem(`/admin/collections/${slug}`, label, colActive(slug), 'teal'),
        )}

        {/* Divider */}
        <div style={{ margin: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Globals label */}
        <div
          style={{
            padding: '0 1rem 0.375rem',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Globals
        </div>
        {GLOBALS.map(({ slug, label }) =>
          navItem(`/admin/globals/${slug}`, label, globActive(slug), 'coral'),
        )}
      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          gap: '0.25rem',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.28)',
            fontSize: '0.8125rem',
            textDecoration: 'none',
            padding: '0.3125rem 0.125rem',
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M10 2h4m0 0v4m0-4L8 8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          View Site
        </a>
        <a
          href="/admin/logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.28)',
            fontSize: '0.8125rem',
            textDecoration: 'none',
            padding: '0.3125rem 0.125rem',
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(226,114,91,0.85)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 12l4-4-4-4M14 8H6M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sign Out
        </a>
      </div>
    </aside>
  )
}
