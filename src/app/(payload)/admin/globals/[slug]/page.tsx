import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { GLOBAL_SCHEMAS } from '@/lib/admin-collections'
import { DocForm } from '../../_components/DocForm'
import { AdminShell } from '../../_components/AdminShell'

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
    <AdminShell>
      <div style={{ padding: '2rem 2.25rem', maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
            }}
          >
            Global
          </div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 0.375rem',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--admin-font-heading, system-ui)',
            }}
          >
            {schema.label}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>
            Changes affect the live site immediately.
          </p>
        </div>

        <DocForm
          apiSlug={schema.apiSlug}
          initialData={doc}
          fields={schema.fields}
          returnPath="/admin/dashboard"
          collectionLabel={schema.label}
          isGlobal
        />
      </div>
    </AdminShell>
  )
}
