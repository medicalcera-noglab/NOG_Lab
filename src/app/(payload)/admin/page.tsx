import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminHome() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')

  if (!token) {
    redirect('/admin/login')
  }

  redirect('/admin/dashboard')
}
