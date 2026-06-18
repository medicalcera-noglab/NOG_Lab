/**
 * POST /api/totp/setup
 * Generates a new TOTP secret for the authenticated user and returns a QR data URL.
 * The secret is NOT yet saved — it becomes permanent only after /api/totp/confirm succeeds.
 * The pending secret is stored encrypted in a short-lived httpOnly cookie.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { generateTotpSecret, generateQrDataUrl, encryptSecret } from '@/lib/totp'
import { NextResponse } from 'next/server'

export async function POST(): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()

  const token = cookieStore.get('payload-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const authResult = await payload
    .auth({ headers: new Headers({ authorization: `JWT ${token}` }) })
    .catch(() => null)
  const user = (authResult?.user ?? null) as {
    id: string | number
    email: string
    totpEnabled?: boolean
  } | null

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.totpEnabled) {
    return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
  }

  const { secret, otpauthUri } = await generateTotpSecret(user.email)
  const qrDataUrl = await generateQrDataUrl(otpauthUri)

  const res = NextResponse.json({ qrDataUrl, otpauthUri })
  // Store the pending (unconfirmed) secret encrypted; expires in 10 min.
  res.cookies.set('totp-pending', encryptSecret(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
