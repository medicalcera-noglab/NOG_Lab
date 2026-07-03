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
    <AdminShell title={schema.label} breadcrumbs={[{ label: 'Globals' }]}>
      <div style={{ padding: '1.75rem 2.25rem', maxWidth: '860px' }}>
        <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0 0 1.5rem' }}>
          Changes affect the live site immediately.
        </p>
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
