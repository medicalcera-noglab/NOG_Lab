import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
  { label: 'Partner Institutions', slug: 'collaborators' },
  { label: 'Outreach Activities', slug: 'outreach_activities' },
  { label: 'Impact Stories', slug: 'impact_stories' },
  { label: 'Media Coverage', slug: 'media_coverage' },
  { label: 'Open Positions', slug: 'open_positions' },
  { label: 'Inquiries', slug: 'inquiries' },
  { label: 'Applicant Files', slug: 'applicant_files' },
  { label: 'Media Library', slug: 'media' },
  { label: 'Users', slug: 'users' },
  { label: 'Audit Log', slug: 'audit_log' },
]

const GLOBALS = [
  { label: 'Site Settings', slug: 'site_settings' },
  { label: 'Navigation', slug: 'navigation' },
  { label: 'About Page', slug: 'about' },
  { label: 'Outreach Page', slug: 'outreach_page' },
  { label: 'Partnerships Page', slug: 'partnerships_page' },
  { label: 'Page SEO', slug: 'page_seo' },
  { label: 'Legal Pages', slug: 'legal_pages' },
]

const ACTION_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  create: { bg: 'rgba(14,110,110,0.10)', color: '#0e6e6e', label: 'Created' },
  update: { bg: 'rgba(234,179,8,0.10)', color: '#a16207', label: 'Updated' },
  delete: { bg: 'rgba(220,38,38,0.10)', color: '#dc2626', label: 'Deleted' },
  publish: { bg: 'rgba(14,110,110,0.10)', color: '#0e6e6e', label: 'Published' },
  login: { bg: 'rgba(226,114,91,0.10)', color: '#c05544', label: 'Login' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

type AuditEntry = {
  id: string
  action?: string
  entityType?: string
  entityId?: string
  createdAt?: string
  user?: { id: string; email: string } | string | null
}

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'

  // Fetch in parallel: counts, unread inquiries, recent audit log
  const [counts, unreadRes, auditRes] = await Promise.all([
    Promise.all(
      KEY_STATS.map(async ({ slug }) => {
        try {
          const r = await fetch(`${base}/api/${slug}?limit=0&depth=0`, {
            headers: { Authorization: `JWT ${token}` },
            cache: 'no-store',
          })
          if (!r.ok) return 0
          const j = (await r.json()) as { totalDocs?: number }
          return j.totalDocs ?? 0
        } catch {
          return 0
        }
      }),
    ),
    fetch(`${base}/api/inquiries?limit=0&depth=0&where[isRead][equals]=false`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    }).catch(() => null),
    fetch(`${base}/api/audit_log?limit=20&sort=-createdAt&depth=1`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    }).catch(() => null),
  ])

  let unreadCount = 0
  if (unreadRes?.ok) {
    const j = (await unreadRes.json()) as { totalDocs?: number }
    unreadCount = j.totalDocs ?? 0
  }

  let auditEntries: AuditEntry[] = []
  if (auditRes?.ok) {
    const j = (await auditRes.json()) as { docs?: AuditEntry[] }
    auditEntries = j.docs ?? []
  }

  return (
    <AdminShell title="Dashboard">
      <style>{`
        .nog-quick-card {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: #fff;
          border: 1px solid #e8edf2;
          border-radius: 10px;
          padding: 0.875rem 1rem;
          text-decoration: none;
          transition: box-shadow 0.13s, border-color 0.13s, transform 0.13s;
          position: relative;
        }
        .nog-quick-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border-color: #c0d4dc;
          transform: translateY(-1px);
        }
        .nog-stat-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
          border-color: #c0d4dc !important;
        }
        .nog-badge-count {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          background: #e2725b;
          color: #fff;
          font-size: 0.6875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          line-height: 1;
        }
      `}</style>

      <div style={{ padding: '2rem 2.25rem', maxWidth: '1060px', margin: '0 auto' }}>
        {/* Unread inquiry alert */}
        {unreadCount > 0 && (
          <Link
            href="/admin/collections/inquiries?tab=unread"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#fff8f5',
              border: '1.5px solid #f4c0b0',
              borderRadius: '10px',
              padding: '0.875rem 1.25rem',
              textDecoration: 'none',
              marginBottom: '1.75rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#e2725b',
                color: '#fff',
                fontSize: '0.8125rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {unreadCount}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c05544' }}>
              {unreadCount} unread {unreadCount === 1 ? 'inquiry' : 'inquiries'} — click to view
            </span>
          </Link>
        )}

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
              className="nog-stat-card"
              style={{
                display: 'block',
                background: '#fff',
                border: '1px solid #e8edf2',
                borderRadius: '14px',
                padding: '1.375rem 1.5rem',
                textDecoration: 'none',
                transition: 'box-shadow 0.13s, border-color 0.13s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: bg,
                  marginBottom: '1rem',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1,
                  letterSpacing: '-0.05em',
                  fontFamily: 'var(--admin-font-heading, system-ui)',
                  marginBottom: '0.375rem',
                }}
              >
                {counts[i]}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                {label}
              </div>
            </a>
          ))}
        </div>

        {/* Two-col layout: collections/globals + activity feed */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          <div>
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
                }}
              >
                Collections
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                  gap: '0.625rem',
                }}
              >
                {COLLECTIONS.map(({ label, slug }) => (
                  <a key={slug} href={`/admin/collections/${slug}`} className="nog-quick-card">
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
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                      {label}
                    </span>
                    {slug === 'inquiries' && unreadCount > 0 && (
                      <span className="nog-badge-count">{unreadCount}</span>
                    )}
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
                }}
              >
                Globals
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                  gap: '0.625rem',
                }}
              >
                {GLOBALS.map(({ label, slug }) => (
                  <a key={slug} href={`/admin/globals/${slug}`} className="nog-quick-card">
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
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Activity feed */}
          <aside>
            <h2
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                margin: '0 0 0.875rem',
              }}
            >
              Recent Activity
            </h2>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8edf2',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {auditEntries.length === 0 ? (
                <p
                  style={{
                    padding: '1.5rem',
                    fontSize: '0.8125rem',
                    color: '#94a3b8',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  No activity yet
                </p>
              ) : (
                auditEntries.map((entry, idx) => {
                  const ac = ACTION_COLORS[entry.action ?? ''] ?? ACTION_COLORS.update
                  const userEmail =
                    typeof entry.user === 'object' && entry.user
                      ? entry.user.email
                      : typeof entry.user === 'string'
                        ? entry.user
                        : 'System'
                  const entityLabel = entry.entityType ? entry.entityType.replace(/_/g, ' ') : '—'

                  return (
                    <div
                      key={entry.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: idx < auditEntries.length - 1 ? '1px solid #f1f5f9' : 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.625rem',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: ac.bg,
                          color: ac.color,
                          flexShrink: 0,
                          marginTop: '1px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {ac.label}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: '0 0 0.125rem',
                            fontSize: '0.8rem',
                            color: '#1e293b',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {entityLabel}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                          {userEmail}
                          {entry.createdAt && ` · ${timeAgo(entry.createdAt)}`}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {auditEntries.length > 0 && (
              <Link
                href="/admin/collections/audit_log"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: '#0e6e6e',
                  textDecoration: 'none',
                  marginTop: '0.625rem',
                  fontWeight: 500,
                }}
              >
                View full log →
              </Link>
            )}
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
