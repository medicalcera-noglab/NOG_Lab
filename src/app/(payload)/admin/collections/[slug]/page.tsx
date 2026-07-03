import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COLLECTION_SCHEMAS } from '@/lib/admin-collections'
import { AdminShell } from '../../_components/AdminShell'

type Props = { params: Promise<{ slug: string }> }

function fmtVal(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'object') {
    const d = v as Record<string, unknown>
    return String(d.name ?? d.title ?? d.email ?? d.id ?? '—')
  }
  const s = String(v)
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
    <AdminShell
      title={label}
      breadcrumbs={[{ label: 'Collections' }]}
      action={{ label: '+ New', href: `/admin/collections/${slug}/new` }}
    >
      <style>{`
        .nog-tr:hover { background: #f8fafc; }
        .nog-tr td:first-child a { color: #0e6e6e; font-weight: 500; text-decoration: none; }
        .nog-tr td:first-child a:hover { text-decoration: underline; }
        .nog-edit-btn:hover { background: #e0f2f2 !important; border-color: #a0d0d0 !important; }
      `}</style>

      <div style={{ padding: '1.75rem 2.25rem' }}>
        {/* Sub-header */}
        <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0 0 1.5rem' }}>
          {totalDocs} document{totalDocs !== 1 ? 's' : ''}
        </p>

        {/* Table */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {docs.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(14,110,110,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
              </div>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  margin: '0 0 1rem',
                }}
              >
                No {label.toLowerCase()} yet
              </p>
              <a
                href={`/admin/collections/${slug}/new`}
                style={{
                  display: 'inline-flex',
                  padding: '0.5rem 1.125rem',
                  background: '#0e6e6e',
                  color: '#fff',
                  borderRadius: '7px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Create first document
              </a>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e8edf4', background: '#f8fafc' }}>
                    {listFields.map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '0.75rem 1.125rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#64748b',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
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
                        padding: '0.75rem 1.125rem',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#64748b',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
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
                      className="nog-tr"
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                    >
                      {listFields.map((col, ci) => (
                        <td
                          key={col}
                          style={{
                            padding: '0.75rem 1.125rem',
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
                          padding: '0.75rem 1.125rem',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <a
                          href={`/admin/collections/${slug}/${doc.id}`}
                          className="nog-edit-btn"
                          style={{
                            fontSize: '0.8125rem',
                            color: '#0e6e6e',
                            textDecoration: 'none',
                            fontWeight: 500,
                            padding: '0.3125rem 0.75rem',
                            border: '1px solid #cde8e8',
                            borderRadius: '6px',
                            background: '#f0fafa',
                            transition: 'background 0.1s, border-color 0.1s',
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
      </div>
    </AdminShell>
  )
}
