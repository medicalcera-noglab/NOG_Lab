import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COLLECTION_SCHEMAS } from '@/lib/admin-collections'
import { DocForm } from '../../../_components/DocForm'
import { AdminShell } from '../../../_components/AdminShell'

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
    <AdminShell>
      <div style={{ padding: '2rem 2.25rem', maxWidth: '860px' }}>
        {/* Breadcrumb + header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.8rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
            }}
          >
            <a
              href={`/admin/collections/${slug}`}
              style={{ color: '#64748b', textDecoration: 'none' }}
            >
              {schema.label}
            </a>
            <span>›</span>
            <span
              style={{
                color: '#374151',
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.025em',
              fontFamily: 'var(--admin-font-heading, system-ui)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h1>
        </div>

        <DocForm
          apiSlug={schema.apiSlug}
          docId={id}
          initialData={doc}
          fields={schema.fields}
          returnPath={`/admin/collections/${slug}`}
          collectionLabel={schema.label}
        />
      </div>
    </AdminShell>
  )
}
