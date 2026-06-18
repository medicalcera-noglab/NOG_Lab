/**
 * POST /api/totp/login  { code: string }
 *
 * Second-factor verification in the TOTP login flow.
 *
 * HOW THE FLOW WORKS:
 * 1. User POSTs to /api/users/login (Payload built-in) with email + password.
 * 2. If totpEnabled=true the afterLogin hook sets a `totp-challenge` cookie
 *    containing a signed partial JWT and sets X-Requires-TOTP: 1 in the response.
 *    The full `payload-token` is NOT set at this stage.
 * 3. User POSTs here with their 6-digit code (or backup code).
 * 4. On success this endpoint issues the real `payload-token` session cookie.
 *
 * The partial token contains { userId, email, partial: true } signed with PAYLOAD_SECRET.
 * It expires in 5 minutes — tight window to prevent indefinite challenges.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { verifyTotpToken, decryptSecret, consumeBackupCode } from '@/lib/totp'
import { NextResponse, type NextRequest } from 'next/server'
import { sign, verify } from 'jsonwebtoken'

const CHALLENGE_COOKIE = 'totp-challenge'
const CHALLENGE_TTL = 5 * 60 // seconds

export interface ChallengePayload {
  userId: string | number
  partial: true
  email: string
}

/** Issued by the afterLogin hook to signal that a TOTP second factor is required. */
export function issueTotpChallenge(userId: string | number, email: string): string {
  const secret = process.env.PAYLOAD_SECRET ?? ''
  return sign({ userId, email, partial: true } satisfies ChallengePayload, secret, {
    expiresIn: CHALLENGE_TTL,
  })
}

interface TotpLoginUserRow {
  id: string | number
  email: string
  totpEnabled?: boolean
  totpSecret?: string
  backupCodes?: string[]
  totpFailedAttempts?: number
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()

  const challengeToken = cookieStore.get(CHALLENGE_COOKIE)?.value
  if (!challengeToken) {
    return NextResponse.json(
      { error: 'No TOTP challenge active — complete password login first' },
      { status: 400 },
    )
  }

  let challenge: ChallengePayload
  try {
    challenge = verify(challengeToken, process.env.PAYLOAD_SECRET ?? '') as ChallengePayload
  } catch {
    return NextResponse.json({ error: 'Challenge expired or invalid' }, { status: 401 })
  }

  if (!challenge.partial) {
    return NextResponse.json({ error: 'Invalid challenge token' }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const code = String(body.code ?? '').trim()
  if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 })

  const user = await payload.db.findOne<TotpLoginUserRow>({
    collection: 'users',
    where: { id: { equals: challenge.userId } },
  })

  if (!user?.totpEnabled) {
    return NextResponse.json({ error: 'User not found or 2FA not enabled' }, { status: 400 })
  }

  // Respect the same lockout as password login (maxLoginAttempts = 5).
  const failedAttempts = user.totpFailedAttempts ?? 0
  if (failedAttempts >= 5) {
    return NextResponse.json(
      { error: 'Account locked due to too many failed 2FA attempts. Contact an administrator.' },
      { status: 423 },
    )
  }

  const plaintextSecret = user.totpSecret ? decryptSecret(user.totpSecret) : null
  const validTotp = plaintextSecret ? await verifyTotpToken(code, plaintextSecret) : false

  let remainingHashes: string[] | null = null
  if (!validTotp) {
    remainingHashes = user.backupCodes ? consumeBackupCode(code, user.backupCodes) : null
  }

  if (!validTotp && remainingHashes === null) {
    await payload.db.updateOne({
      collection: 'users',
      id: user.id,
      data: { totpFailedAttempts: failedAttempts + 1 },
    })
    return NextResponse.json({ error: 'Invalid code' }, { status: 422 })
  }

  // Success — reset counter, persist consumed backup code list if applicable.
  await payload.db.updateOne({
    collection: 'users',
    id: user.id,
    data: {
      totpFailedAttempts: 0,
      ...(remainingHashes !== null ? { backupCodes: remainingHashes } : {}),
    },
  })

  // Issue the real Payload JWT — must match tokenExpiration in Users collection.
  const fullToken = sign(
    { id: user.id, email: user.email, collection: 'users' },
    process.env.PAYLOAD_SECRET ?? '',
    { expiresIn: 1800 },
  )

  const res = NextResponse.json({ success: true })
  res.cookies.set('payload-token', fullToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1800,
    path: '/',
  })
  res.cookies.set(CHALLENGE_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
