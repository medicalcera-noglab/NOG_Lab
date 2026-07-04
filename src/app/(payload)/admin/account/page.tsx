import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminShell } from '../_components/AdminShell'
import { AccountForm } from './_AccountForm'

export default async function AccountPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/admin/login')

  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'
  const res = await fetch(`${base}/api/users/me`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })

  type UserData = { id: number; email: string; name?: string | null }
  let user: UserData | null = null
  if (res.ok) {
    const j = (await res.json()) as { user?: UserData }
    user = j.user ?? null
  }
  if (!user) redirect('/admin/login')

  return (
    <AdminShell title="Account Settings" breadcrumbs={[{ label: 'Admin' }]}>
      <div style={{ padding: '2rem 2.25rem', maxWidth: '600px' }}>
        <AccountForm userId={user.id} initialEmail={user.email} initialName={user.name ?? ''} />
      </div>
    </AdminShell>
  )
}
