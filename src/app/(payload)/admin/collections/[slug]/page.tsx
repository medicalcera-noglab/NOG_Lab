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
    <AdminShell>
      <style>{`
        .nog-tr:hover { background: #f8fafc; }
        .nog-tr td:first-child a { color: #0e6e6e; font-weight: 500; text-decoration: none; }
        .nog-tr td:first-child a:hover { text-decoration: underline; }
        .nog-edit-btn:hover { background: #e0f2f2 !important; border-color: #b0d8d8 !important; }
      `}</style>

      <div style={{ padding: '2rem 2.25rem' }}>
        {/* Page header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
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
                fontFamily: 'var(--admin-font-heading, system-ui)',
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5625rem 1.125rem',
              background: '#0e6e6e',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            + New
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
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                No documents yet
              </div>
              <a
                href={`/admin/collections/${slug}/new`}
                style={{
                  display: 'inline-flex',
                  padding: '0.5rem 1rem',
                  background: '#0e6e6e',
                  color: '#fff',
                  borderRadius: '7px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
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
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    {listFields.map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '0.6875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#475569',
                          fontSize: '0.75rem',
                          letterSpacing: '0.04em',
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
                        padding: '0.6875rem 1rem',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#475569',
                        fontSize: '0.75rem',
                        letterSpacing: '0.04em',
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
                            padding: '0.6875rem 1rem',
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
                          padding: '0.6875rem 1rem',
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
                            padding: '0.3rem 0.75rem',
                            border: '1px solid #d1e7e7',
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
