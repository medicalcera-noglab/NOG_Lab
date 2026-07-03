import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COLLECTION_SCHEMAS } from '@/lib/admin-collections'
import { DocForm } from '../../../_components/DocForm'

type Props = { params: Promise<{ slug: string; id: string }> }

export default async function EditDocPage({ params }: Props) {
  const { slug, id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const schema = COLLECTION_SCHEMAS[slug]
  if (!schema) redirect('/admin/dashboard')

  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'
  const res = await fetch(`${base}/api/${schema.apiSlug}/${id}?depth=1`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) redirect(`/admin/collections/${slug}`)
  const doc = (await res.json()) as Record<string, unknown>
  const title = String(doc[schema.titleField] ?? 'Untitled')

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #f1f5f9; }
        @keyframes nog-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#f1f5f9',
          fontFamily: "var(--admin-font-body,'Inter',system-ui)",
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
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
                  fontFamily: 'var(--admin-font-heading,system-ui)',
                }}
              >
                NOG Lab Admin
              </span>
            </a>
            <span style={{ color: '#cbd5e1' }}>›</span>
            <a
              href={`/admin/collections/${slug}`}
              style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}
            >
              {schema.label}
            </a>
            <span style={{ color: '#cbd5e1' }}>›</span>
            <span
              style={{
                fontSize: '0.875rem',
                color: '#374151',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
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

        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 1.5rem',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--admin-font-heading,system-ui)',
            }}
          >
            Edit {schema.label.replace(/s$/, '')}
          </h1>

          <DocForm
            apiSlug={schema.apiSlug}
            docId={id}
            initialData={doc}
            fields={schema.fields}
            returnPath={`/admin/collections/${slug}`}
            collectionLabel={schema.label}
          />
        </main>
      </div>
    </>
  )
}
