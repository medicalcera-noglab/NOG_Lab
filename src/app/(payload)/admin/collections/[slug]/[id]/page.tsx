import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COLLECTION_SCHEMAS } from '@/lib/admin-collections'
import { DocForm } from '../../../_components/DocForm'
import { AdminShell } from '../../../_components/AdminShell'
import { InquiryView } from '../../../_components/InquiryView'

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

  // Inquiries get a dedicated email-style view
  if (slug === 'inquiries') {
    return (
      <AdminShell
        title={title}
        breadcrumbs={[{ label: 'Inquiries', href: '/admin/collections/inquiries' }]}
      >
        <div style={{ padding: '1.75rem 2.25rem' }}>
          <InquiryView
            doc={doc as Parameters<typeof InquiryView>[0]['doc']}
            returnPath="/admin/collections/inquiries"
          />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title={title}
      breadcrumbs={[{ label: schema.label, href: `/admin/collections/${slug}` }]}
    >
      <div style={{ padding: '1.75rem 2.25rem', maxWidth: '860px' }}>
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
