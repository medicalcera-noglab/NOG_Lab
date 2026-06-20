import { getPayload } from 'payload'
import config from '@payload-config'
import type { NextRequest } from 'next/server'

function escapeCell(val: unknown): string {
  const s = val == null ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user || !['super_admin', 'editor'].includes((user as { role?: string }).role ?? '')) {
    return new Response('Forbidden', { status: 403 })
  }

  const result = await payload.find({
    collection: 'inquiries',
    overrideAccess: true,
    limit: 10000,
    sort: '-createdAt',
    depth: 0,
  })

  const headers = [
    'ID',
    'Form Type',
    'Name',
    'Email',
    'Message',
    'Read',
    'Replied At',
    'Created At',
  ]
  const rows = result.docs.map((doc) => [
    doc.id,
    doc.formType,
    doc.name,
    doc.email,
    doc.message,
    doc.isRead ? 'Yes' : 'No',
    doc.repliedAt ?? '',
    doc.createdAt ?? '',
  ])

  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
