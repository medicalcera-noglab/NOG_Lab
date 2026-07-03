import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COLLECTION_SCHEMAS } from '@/lib/admin-collections'

type Props = { params: Promise<{ slug: string }> }

function fmtVal(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'object') {
    // relationship object
    const d = v as Record<string, unknown>
    return String(d.name ?? d.title ?? d.email ?? d.id ?? '—')
  }
  const s = String(v)
  // ISO date → short date
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.substring(0, 10)
  if (s.length > 80) return s.substring(0, 80) + '…'
  return s
}

export default async function CollectionListPage({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const schema = COLLECTION_SCHEMAS[slug]
  const apiSlug = schema?.apiSlug ?? slug
  const label = schema?.label ?? slug
  const titleField = schema?.titleField ?? 'id'
  const listFields = schema?.listFields ?? [titleField, 'updatedAt']

  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'
  const res = await fetch(`${base}/api/${apiSlug}?limit=100&sort=-updatedAt&depth=1`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })

  let docs: Record<string, unknown>[] = []
  let totalDocs = 0

  if (res.ok) {
    const json = (await res.json()) as { docs?: Record<string, unknown>[]; totalDocs?: number }
    docs = json.docs ?? []
    totalDocs = json.totalDocs ?? docs.length
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #f1f5f9; }
        .nog-row:hover { background: #f8fafc; }
        .nog-row td:first-child a { color: #0e6e6e; font-weight: 500; text-decoration: none; }
        .nog-row td:first-child a:hover { text-decoration: underline; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#f1f5f9',
          fontFamily: "var(--admin-font-body, 'Inter', system-ui)",
        }}
      >
        {/* Nav */}
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(145deg,#0e6e6e,#20a0a0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                  fontFamily: 'var(--admin-font-heading,system-ui)',
                }}
              >
                NOG Lab Admin
              </span>
            </a>
            <span style={{ color: '#cbd5e1' }}>›</span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{label}</span>
          </div>
          <a
            href="/admin/logout"
            style={{
              fontSize: '0.8125rem',
              color: '#64748b',
              textDecoration: 'none',
              padding: '0.375rem 0.875rem',
              borderRadius: '7px',
              border: '1px solid #e2e8f0',
              fontWeight: 500,
            }}
          >
            Sign out
          </a>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: '0 0 0.25rem',
                  letterSpacing: '-0.03em',
                  fontFamily: 'var(--admin-font-heading,system-ui)',
                }}
              >
                {label}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>
                {totalDocs} document{totalDocs !== 1 ? 's' : ''}
              </p>
            </div>
            <a
              href={`/admin/collections/${slug}/new`}
              style={{
                padding: '0.6rem 1.25rem',
                background: '#0e6e6e',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              + New {label.replace(/s$/, '')}
            </a>
          </div>

          {/* Table */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {docs.length === 0 ? (
              <p style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                No documents yet. Create one with the button above.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      {listFields.map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#374151',
                            fontSize: '0.8rem',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/_/g, ' ')
                            .trim()}
                        </th>
                      ))}
                      <th
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: '#374151',
                          fontSize: '0.8rem',
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc) => (
                      <tr
                        key={String(doc.id)}
                        className="nog-row"
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                      >
                        {listFields.map((col, ci) => (
                          <td
                            key={col}
                            style={{
                              padding: '0.75rem 1rem',
                              color: '#374151',
                              maxWidth: '280px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ci === 0 ? (
                              <a href={`/admin/collections/${slug}/${doc.id}`}>
                                {fmtVal(doc[col]) || '(no title)'}
                              </a>
                            ) : (
                              fmtVal(doc[col])
                            )}
                          </td>
                        ))}
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <a
                            href={`/admin/collections/${slug}/${doc.id}`}
                            style={{
                              fontSize: '0.8125rem',
                              color: '#0e6e6e',
                              textDecoration: 'none',
                              fontWeight: 500,
                              padding: '0.3rem 0.625rem',
                              border: '1px solid #d1e7e7',
                              borderRadius: '6px',
                              background: '#f0fafa',
                            }}
                          >
                            Edit
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
