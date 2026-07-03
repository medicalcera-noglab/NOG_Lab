import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminShell } from '../_components/AdminShell'

const KEY_STATS = [
  { label: 'Publications', slug: 'publications', color: '#0e6e6e', bg: 'rgba(14,110,110,0.08)' },
  { label: 'People', slug: 'people', color: '#0e6e6e', bg: 'rgba(14,110,110,0.08)' },
  { label: 'Projects', slug: 'projects', color: '#0e6e6e', bg: 'rgba(14,110,110,0.08)' },
  { label: 'Blog Posts', slug: 'blog_posts', color: '#e2725b', bg: 'rgba(226,114,91,0.08)' },
]

const COLLECTIONS = [
  { label: 'Publications', slug: 'publications' },
  { label: 'People', slug: 'people' },
  { label: 'Projects', slug: 'projects' },
  { label: 'Blog Posts', slug: 'blog_posts' },
  { label: 'News & Events', slug: 'news_events' },
  { label: 'Research Themes', slug: 'research_themes' },
  { label: 'Study Sites', slug: 'study_sites' },
  { label: 'Collaborators', slug: 'collaborators' },
  { label: 'Impact Stories', slug: 'impact_stories' },
  { label: 'Media Coverage', slug: 'media_coverage' },
  { label: 'Open Positions', slug: 'open_positions' },
  { label: 'Inquiries', slug: 'inquiries' },
  { label: 'Applicant Files', slug: 'applicant_files' },
  { label: 'Users', slug: 'users' },
]

const GLOBALS = [
  { label: 'Site Settings', slug: 'site_settings' },
  { label: 'Navigation', slug: 'navigation' },
  { label: 'About Page', slug: 'about' },
  { label: 'Page SEO', slug: 'page_seo' },
  { label: 'Legal Pages', slug: 'legal_pages' },
]

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'

  const counts = await Promise.all(
    KEY_STATS.map(async ({ slug }) => {
      try {
        const res = await fetch(`${base}/api/${slug}?limit=0&depth=0`, {
          headers: { Authorization: `JWT ${token}` },
          cache: 'no-store',
        })
        if (!res.ok) return 0
        const j = (await res.json()) as { totalDocs?: number }
        return j.totalDocs ?? 0
      } catch {
        return 0
      }
    }),
  )

  return (
    <AdminShell>
      <style>{`
        .nog-quick-card {
          display: block;
          background: #fff;
          border: 1px solid #e8edf2;
          border-radius: 10px;
          padding: 1rem 1.125rem;
          text-decoration: none;
          transition: transform 0.13s ease, box-shadow 0.13s ease, border-color 0.13s;
        }
        .nog-quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.07);
          border-color: #c8d4dc;
        }
      `}</style>

      <div style={{ padding: '2rem 2.25rem', maxWidth: '980px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--admin-font-heading, system-ui)',
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Neurological Outcomes Group Lab content overview
          </p>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {KEY_STATS.map(({ label, slug, color, bg }, i) => (
            <a
              key={slug}
              href={`/admin/collections/${slug}`}
              style={{
                display: 'block',
                background: '#fff',
                border: '1px solid #e8edf2',
                borderRadius: '12px',
                padding: '1.25rem 1.375rem',
                textDecoration: 'none',
                transition: 'box-shadow 0.13s, border-color 0.13s',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: bg,
                  marginBottom: '0.75rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect
                    x="2.5"
                    y="1.5"
                    width="8"
                    height="11"
                    rx="1.25"
                    stroke={color}
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5 5.5h4M5 7.5h4M5 9.5h2.5"
                    stroke={color}
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  fontFamily: 'var(--admin-font-heading, system-ui)',
                  marginBottom: '0.3rem',
                }}
              >
                {counts[i]}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</div>
            </a>
          ))}
        </div>

        {/* All collections */}
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              margin: '0 0 0.875rem',
              fontFamily: 'var(--admin-font-heading, system-ui)',
            }}
          >
            Collections
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
              gap: '0.625rem',
            }}
          >
            {COLLECTIONS.map(({ label, slug }) => (
              <a key={slug} href={`/admin/collections/${slug}`} className="nog-quick-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <rect
                      x="2.5"
                      y="1.5"
                      width="8"
                      height="11"
                      rx="1.25"
                      stroke="#0e6e6e"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5 5.5h4M5 7.5h4M5 9.5h2.5"
                      stroke="#0e6e6e"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      fontFamily: 'var(--admin-font-heading, system-ui)',
                    }}
                  >
                    {label}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Globals */}
        <section>
          <h2
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              margin: '0 0 0.875rem',
              fontFamily: 'var(--admin-font-heading, system-ui)',
            }}
          >
            Globals
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
              gap: '0.625rem',
            }}
          >
            {GLOBALS.map(({ label, slug }) => (
              <a key={slug} href={`/admin/globals/${slug}`} className="nog-quick-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="8" cy="8" r="5.5" stroke="#e2725b" strokeWidth="1.3" />
                    <path
                      d="M8 2.5c0 0-2 2-2 5.5s2 5.5 2 5.5M8 2.5c0 0 2 2 2 5.5s-2 5.5-2 5.5M2.5 8h11"
                      stroke="#e2725b"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      fontFamily: 'var(--admin-font-heading, system-ui)',
                    }}
                  >
                    {label}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
