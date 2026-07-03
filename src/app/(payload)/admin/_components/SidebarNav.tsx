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

function DocIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: active ? 1 : 0.45 }}
    >
      <rect
        x="2.5"
        y="1.5"
        width="8"
        height="11"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5 5.5h4M5 7.5h4M5 9.5h2.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GlobeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: active ? 1 : 0.45 }}
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 2.5c0 0-2 2-2 5.5s2 5.5 2 5.5M8 2.5c0 0 2 2 2 5.5s-2 5.5-2 5.5M2.5 8h11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SidebarNav() {
  const pathname = usePathname()
  const isDashboard = pathname === '/admin/dashboard' || pathname === '/admin'

  return (
    <>
      <style>{`
        .nog-sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.5625rem;
          padding: 0.4rem 0.875rem 0.4rem 0.875rem;
          text-decoration: none;
          font-size: 0.8125rem;
          font-weight: 400;
          border-left: 2px solid transparent;
          transition: background 0.1s, color 0.1s, border-color 0.1s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        .nog-sidebar-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .nog-sidebar-item.col-active {
          color: #e0f2f2 !important;
          background: rgba(14,110,110,0.22);
          border-left-color: #0e9090;
          font-weight: 500;
        }
        .nog-sidebar-item.glob-active {
          color: #fde8e3 !important;
          background: rgba(226,114,91,0.18);
          border-left-color: #e2725b;
          font-weight: 500;
        }
        .nog-sidebar-footer a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          text-decoration: none;
          padding: 0.3125rem 0;
          transition: color 0.12s;
        }
      `}</style>

      <aside
        style={{
          width: '224px',
          flexShrink: 0,
          background: '#0d1818',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '1rem 0.875rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <a
            href="/admin/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '7px',
                background: 'linear-gradient(145deg, #0e6e6e 0%, #1fa0a0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(14,110,110,0.35)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M7 21V7l14 14V7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div
                style={{
                  color: '#e8f4f4',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  fontFamily: 'var(--admin-font-heading, system-ui)',
                }}
              >
                NOG Lab
              </div>
              <div
                style={{
                  color: '#2d5050',
                  fontSize: '0.625rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Admin
              </div>
            </div>
          </a>
        </div>

        {/* Dashboard link */}
        <div style={{ padding: '0.5rem 0 0.25rem', flexShrink: 0 }}>
          <a
            href="/admin/dashboard"
            className={`nog-sidebar-item${isDashboard ? 'col-active' : ''}`}
            style={{ color: isDashboard ? undefined : '#4a7070' }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              style={{ flexShrink: 0, opacity: isDashboard ? 1 : 0.45 }}
            >
              <rect
                x="1.5"
                y="1.5"
                width="5.5"
                height="5.5"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <rect
                x="9"
                y="1.5"
                width="5.5"
                height="5.5"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <rect
                x="1.5"
                y="9"
                width="5.5"
                height="5.5"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <rect
                x="9"
                y="9"
                width="5.5"
                height="5.5"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            Dashboard
          </a>
        </div>

        {/* Scrollable nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '0.5rem' }}>
          {/* Collections section */}
          <div
            style={{
              padding: '0.625rem 0.875rem 0.3rem',
              fontSize: '0.625rem',
              fontWeight: 700,
              color: '#1e4040',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Collections
          </div>
          {COLLECTIONS.map(({ slug, label }) => {
            const active = pathname.startsWith(`/admin/collections/${slug}`)
            return (
              <a
                key={slug}
                href={`/admin/collections/${slug}`}
                className={`nog-sidebar-item${active ? 'col-active' : ''}`}
                style={{ color: active ? undefined : '#5a8888' }}
              >
                <DocIcon active={active} />
                {label}
              </a>
            )
          })}

          {/* Globals section */}
          <div
            style={{
              padding: '0.875rem 0.875rem 0.3rem',
              fontSize: '0.625rem',
              fontWeight: 700,
              color: '#1e4040',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Globals
          </div>
          {GLOBALS.map(({ slug, label }) => {
            const active = pathname.startsWith(`/admin/globals/${slug}`)
            return (
              <a
                key={slug}
                href={`/admin/globals/${slug}`}
                className={`nog-sidebar-item${active ? 'glob-active' : ''}`}
                style={{ color: active ? undefined : '#6a7060' }}
              >
                <GlobeIcon active={active} />
                {label}
              </a>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className="nog-sidebar-footer"
          style={{
            padding: '0.75rem 0.875rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
            flexShrink: 0,
          }}
        >
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d5050' }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
              <path
                d="M10 2h4m0 0v4m0-4L8 8"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View Site
          </a>
          <a href="/admin/logout" style={{ color: '#4a3030' }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 12l4-4-4-4M14 8H6M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign Out
          </a>
        </div>
      </aside>
    </>
  )
}
