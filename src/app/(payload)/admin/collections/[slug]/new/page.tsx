import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COLLECTION_SCHEMAS } from '@/lib/admin-collections'
import { DocForm } from '../../../_components/DocForm'
import { AdminShell } from '../../../_components/AdminShell'

type Props = { params: Promise<{ slug: string }> }

export default async function NewDocPage({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const schema = COLLECTION_SCHEMAS[slug]
  if (!schema) redirect('/admin/dashboard')

  return (
    <AdminShell
      title={`New ${schema.label.replace(/s$/, '')}`}
      breadcrumbs={[{ label: schema.label, href: `/admin/collections/${slug}` }]}
    >
      <div style={{ padding: '1.75rem 2.25rem', maxWidth: '860px' }}>
        <DocForm
          apiSlug={schema.apiSlug}
          initialData={{}}
          fields={schema.fields}
          returnPath={`/admin/collections/${slug}`}
          collectionLabel={schema.label}
        />
      </div>
    </AdminShell>
  )
}
