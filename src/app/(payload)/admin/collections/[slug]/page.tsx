import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COLLECTION_SCHEMAS } from '@/lib/admin-collections'
import { AdminShell } from '../../_components/AdminShell'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fmtVal(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'object') {
    const d = v as Record<string, unknown>
    return String(d.name ?? d.title ?? d.email ?? d.alt ?? d.id ?? '—')
  }
  const s = String(v)
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.substring(0, 10)
  if (s.length > 80) return s.substring(0, 80) + '…'
  return s
}

const INQUIRY_TABS = [
  { label: 'All', value: '' },
  { label: 'Contact', value: 'contact' },
  { label: 'Join', value: 'join' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Unread', value: 'unread' },
]

const STATUS_OPTIONS = ['draft', 'review', 'published', 'ongoing', 'completed']

export default async function CollectionListPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const search = typeof sp.search === 'string' ? sp.search.trim() : ''
  const statusFilter = typeof sp.status === 'string' ? sp.status : ''
  const inquiryTab = typeof sp.tab === 'string' ? sp.tab : ''

  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const schema = COLLECTION_SCHEMAS[slug]
  const apiSlug = schema?.apiSlug ?? slug
  const label = schema?.label ?? slug
  const titleField = schema?.titleField ?? 'id'
  const listFields = schema?.listFields ?? [titleField, 'updatedAt']

  // Build query string for Payload API
  const qp = new URLSearchParams()
  qp.set('limit', '100')
  qp.set('sort', '-updatedAt')
  qp.set('depth', '1')

  if (search && titleField) {
    qp.set(`where[${titleField}][contains]`, search)
  }

  if (slug === 'inquiries') {
    if (inquiryTab === 'contact') qp.set('where[formType][equals]', 'contact')
    else if (inquiryTab === 'join') qp.set('where[formType][equals]', 'join')
    else if (inquiryTab === 'partnership') qp.set('where[formType][equals]', 'partnership')
    else if (inquiryTab === 'unread') qp.set('where[isRead][equals]', 'false')
  } else if (statusFilter) {
    qp.set('where[status][equals]', statusFilter)
  }

  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'
  const res = await fetch(`${base}/api/${apiSlug}?${qp.toString()}`, {
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

  const hasStatusField = schema?.fields.some((f) => f.name === 'status')
  const isInquiries = slug === 'inquiries'

  return (
    <AdminShell
      title={label}
      breadcrumbs={[{ label: 'Collections' }]}
      action={
        slug !== 'audit_log'
          ? { label: '+ New', href: `/admin/collections/${slug}/new` }
          : undefined
      }
    >
      <style>{`
        .nog-tr:hover { background: #f8fafc; }
        .nog-tr td:first-child a { color: #0e6e6e; font-weight: 500; text-decoration: none; }
        .nog-tr td:first-child a:hover { text-decoration: underline; }
        .nog-edit-btn:hover { background: #e0f2f2 !important; border-color: #a0d0d0 !important; }
        .nog-tab { padding: 0.35rem 0.875rem; border-radius: 20px; border: 1.5px solid transparent; font-size: 0.8125rem; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.13s; color: #64748b; background: #f1f5f9; }
        .nog-tab[aria-current="true"] { background: #0e6e6e; color: #fff; border-color: #0e6e6e; }
        .nog-tab:not([aria-current="true"]):hover { background: #e0f2f2; color: #0e6e6e; }
        .nog-search { display: flex; align-items: center; gap: 0.5rem; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 0 0.75rem; transition: border-color 0.15s, box-shadow 0.15s; }
        .nog-search:focus-within { border-color: #0e6e6e; box-shadow: 0 0 0 3px rgba(14,110,110,0.1); }
        .nog-search input { border: none; outline: none; flex: 1; padding: 0.5rem 0; font-size: 0.875rem; color: #0f172a; background: transparent; }
        .nog-badge-unread { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #e2725b; margin-right: 4px; vertical-align: middle; }
      `}</style>

      <div style={{ padding: '1.5rem 2.25rem' }}>
        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search box */}
          <form method="GET" style={{ flex: '1', minWidth: '200px', maxWidth: '340px' }}>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {inquiryTab && <input type="hidden" name="tab" value={inquiryTab} />}
            <div className="nog-search">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ flexShrink: 0, opacity: 0.45 }}
              >
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#64748b" strokeWidth="1.5" />
                <path d="M10.5 10.5l3 3" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label}`}
              />
              {search && (
                <a
                  href={`/admin/collections/${slug}`}
                  style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    textDecoration: 'none',
                    lineHeight: 1,
                  }}
                  aria-label="Clear search"
                >
                  ×
                </a>
              )}
            </div>
          </form>

          {/* Inquiry tabs */}
          {isInquiries && (
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {INQUIRY_TABS.map((tab) => (
                <a
                  key={tab.value}
                  href={`/admin/collections/${slug}${tab.value ? `?tab=${tab.value}` : ''}`}
                  className="nog-tab"
                  aria-current={inquiryTab === tab.value ? 'true' : undefined}
                >
                  {tab.value === 'unread' && (
                    <span className="nog-badge-unread" aria-hidden="true" />
                  )}
                  {tab.label}
                </a>
              ))}
            </div>
          )}

          {/* Status filter */}
          {!isInquiries && hasStatusField && (
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <a
                href={`/admin/collections/${slug}${search ? `?search=${encodeURIComponent(search)}` : ''}`}
                className="nog-tab"
                aria-current={statusFilter === '' ? 'true' : undefined}
              >
                All
              </a>
              {STATUS_OPTIONS.map((s) => (
                <a
                  key={s}
                  href={`/admin/collections/${slug}?status=${s}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className="nog-tab"
                  aria-current={statusFilter === s ? 'true' : undefined}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </a>
              ))}
            </div>
          )}

          <span
            style={{
              color: '#94a3b8',
              fontSize: '0.8125rem',
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {totalDocs} result{totalDocs !== 1 ? 's' : ''}
          </span>
        </div>

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
                {search || statusFilter || inquiryTab
                  ? 'No results match your filter'
                  : `No ${label.toLowerCase()} yet`}
              </p>
              {!search && !statusFilter && !inquiryTab && slug !== 'audit_log' && (
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
              )}
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
                  {docs.map((doc) => {
                    const isUnread = isInquiries && !doc.isRead
                    return (
                      <tr
                        key={String(doc.id)}
                        className="nog-tr"
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.1s',
                          background: isUnread ? '#fffbf5' : undefined,
                        }}
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
                                {isUnread && (
                                  <span className="nog-badge-unread" aria-label="Unread" />
                                )}
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
                            {isInquiries ? 'Open' : 'Edit'}
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
