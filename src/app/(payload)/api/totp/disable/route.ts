/**
 * POST /api/totp/disable  { userId?: string, code?: string }
 * Disables TOTP for a user.
 * - Authenticated user: disables their own 2FA (must provide current TOTP or backup code).
 * - super_admin: can disable for any userId (lockout recovery) — no code required.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { verifyTotpToken, decryptSecret, consumeBackupCode } from '@/lib/totp'
import { NextResponse, type NextRequest } from 'next/server'

interface TotpUserRow {
  id: string | number
  totpEnabled?: boolean
  totpSecret?: string
  backupCodes?: string[]
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()

  const sessionToken = cookieStore.get('payload-token')?.value
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve actor — use inline catch to avoid uninitialized-let narrowing issues.
  const authResult = await payload
    .auth({ headers: new Headers({ authorization: `JWT ${sessionToken}` }) })
    .catch(() => null)
  const actor = (authResult?.user ?? null) as {
    id: string | number
    role?: string
  } | null
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Extract to consts so TypeScript tracks these as stable non-null values.
  const actorId = actor.id
  const actorRole = actor.role

  const body = (await req.json().catch(() => null)) as {
    userId?: unknown
    code?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const isSuperAdmin = actorRole === 'super_admin'
  const targetId: string | number = isSuperAdmin && body.userId ? String(body.userId) : actorId

  const target = await payload.db.findOne<TotpUserRow>({
    collection: 'users',
    where: { id: { equals: targetId } },
  })

  if (!target?.totpEnabled) {
    return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
  }

  // Non-super-admins (or admin disabling their own account) must verify with a code.
  if (!isSuperAdmin || targetId === actorId) {
    const code = String(body.code ?? '').trim()
    if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 })

    const plaintextSecret = target.totpSecret ? decryptSecret(target.totpSecret) : null
    const validTotp = plaintextSecret ? await verifyTotpToken(code, plaintextSecret) : false
    const remainingHashes = target.backupCodes ? consumeBackupCode(code, target.backupCodes) : null

    if (!validTotp && remainingHashes === null) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 422 })
    }

    if (!validTotp && remainingHashes !== null) {
      await payload.db.updateOne({
        collection: 'users',
        id: targetId,
        data: { backupCodes: remainingHashes },
      })
    }
  }

  await payload.db.updateOne({
    collection: 'users',
    id: targetId,
    data: {
      totpSecret: null,
      totpEnabled: false,
      backupCodes: null,
      totpFailedAttempts: 0,
    },
  })

  return NextResponse.json({ success: true })
}
