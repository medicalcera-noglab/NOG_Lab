import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
  const token = cookieStore.get('payload-token')

  if (!token) {
    redirect('/admin/login')
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #f1f5f9; }
        .nog-card {
          display: block;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem 1.375rem;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .nog-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.09);
          border-color: #cbd5e1;
        }
        .nog-signout:hover { color: #0e6e6e !important; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#f1f5f9',
          fontFamily: "var(--admin-font-body, 'Inter', system-ui)",
        }}
      >
        {/* Top nav */}
        <header
          style={{
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(145deg, #0e6e6e 0%, #20a0a0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M7 21V7l14 14V7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--admin-font-heading, system-ui)',
              }}
            >
              NOG Lab Admin
            </span>
          </div>

          <a
            href="/admin/logout"
            className="nog-signout"
            style={{
              fontSize: '0.8125rem',
              color: '#64748b',
              textDecoration: 'none',
              padding: '0.375rem 0.875rem',
              borderRadius: '7px',
              border: '1px solid #e2e8f0',
              fontWeight: 500,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            Sign out
          </a>
        </header>

        {/* Content */}
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 0.375rem',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--admin-font-heading, system-ui)',
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 2.5rem' }}>
            Select a collection or global to manage content
          </p>

          {/* Collections */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                margin: '0 0 1rem',
                fontFamily: 'var(--admin-font-heading, system-ui)',
              }}
            >
              Collections
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '0.875rem',
              }}
            >
              {COLLECTIONS.map(({ label, slug }) => (
                <a key={slug} href={`/admin/collections/${slug}`} className="nog-card">
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      background: 'rgba(14,110,110,0.08)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.8rem',
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0e6e6e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      fontFamily: 'var(--admin-font-heading, system-ui)',
                    }}
                  >
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Globals */}
          <section>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                margin: '0 0 1rem',
                fontFamily: 'var(--admin-font-heading, system-ui)',
              }}
            >
              Globals
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '0.875rem',
              }}
            >
              {GLOBALS.map(({ label, slug }) => (
                <a key={slug} href={`/admin/globals/${slug}`} className="nog-card">
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      background: 'rgba(226,114,91,0.08)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.8rem',
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#e2725b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      fontFamily: 'var(--admin-font-heading, system-ui)',
                    }}
                  >
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
