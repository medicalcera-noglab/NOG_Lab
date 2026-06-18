/**
 * POST /api/totp/confirm  { code: string }
 * Validates the 6-digit code against the pending secret from the setup cookie.
 * On success: saves the encrypted secret, sets totpEnabled=true, returns backup codes ONCE.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { verifyTotpToken, decryptSecret, encryptSecret, generateBackupCodes } from '@/lib/totp'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()

  const token = cookieStore.get('payload-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const authResult = await payload
    .auth({ headers: new Headers({ authorization: `JWT ${token}` }) })
    .catch(() => null)
  const userId = (authResult?.user as { id?: string | number } | null)?.id ?? null
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pendingCipher = cookieStore.get('totp-pending')?.value
  if (!pendingCipher) {
    return NextResponse.json(
      { error: 'No pending TOTP setup — call /api/totp/setup first' },
      { status: 400 },
    )
  }

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const code = String(body.code ?? '').trim()
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'code must be a 6-digit string' }, { status: 400 })
  }

  let plaintextSecret: string
  try {
    plaintextSecret = decryptSecret(pendingCipher)
  } catch {
    return NextResponse.json({ error: 'Setup session expired or corrupted' }, { status: 400 })
  }

  if (!(await verifyTotpToken(code, plaintextSecret))) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 422 })
  }

  const { plaintext: backupPlaintext, hashes: backupHashes } = generateBackupCodes()

  // Write directly via DB adapter — bypasses field-level access: () => false restrictions.
  await payload.db.updateOne({
    collection: 'users',
    id: userId,
    data: {
      totpSecret: encryptSecret(plaintextSecret),
      totpEnabled: true,
      backupCodes: backupHashes,
      totpFailedAttempts: 0,
    },
  })

  const res = NextResponse.json({
    success: true,
    // Backup codes shown exactly once — not stored in plaintext anywhere.
    backupCodes: backupPlaintext,
  })
  res.cookies.set('totp-pending', '', { maxAge: 0, path: '/' })
  return res
}
