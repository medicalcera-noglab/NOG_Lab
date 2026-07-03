import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (token) {
    const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'
    await fetch(`${base}/api/users/logout`, {
      method: 'POST',
      headers: { Authorization: `JWT ${token}` },
    }).catch(() => {})
  }

  const res = NextResponse.redirect(
    new URL('/admin/login', process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org'),
  )
  res.cookies.delete('payload-token')
  return res
}
