import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  try {
    const payload = await getPayload({ config })

    // Quick DB ping — fetches at most 1 row
    await payload.db.drizzle.execute('SELECT 1')

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
        db: 'ok',
        latencyMs: Date.now() - start,
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'unknown',
        latencyMs: Date.now() - start,
      },
      { status: 503 },
    )
  }
}
