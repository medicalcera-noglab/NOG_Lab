import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { GLOBAL_SCHEMAS } from '@/lib/admin-collections'
import { DocForm } from '../../_components/DocForm'

type Props = { params: Promise<{ slug: string }> }

export default async function GlobalEditorPage({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const schema = GLOBAL_SCHEMAS[slug]
  if (!schema) redirect('/admin/dashboard')

  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'
  const res = await fetch(`${base}/api/globals/${schema.apiSlug}?depth=1`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })

  const doc = res.ok ? ((await res.json()) as Record<string, unknown>) : {}

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
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Globals</span>
            <span style={{ color: '#cbd5e1' }}>›</span>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>{schema.label}</span>
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
              margin: '0 0 0.25rem',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--admin-font-heading,system-ui)',
            }}
          >
            {schema.label}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0 0 1.5rem' }}>
            Changes are saved globally and affect the live site immediately.
          </p>

          <DocForm
            apiSlug={schema.apiSlug}
            initialData={doc}
            fields={schema.fields}
            returnPath="/admin/dashboard"
            collectionLabel={schema.label}
            isGlobal
          />
        </main>
      </div>
    </>
  )
}
