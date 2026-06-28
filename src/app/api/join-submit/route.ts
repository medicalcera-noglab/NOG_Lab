import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { formLimiter, checkLimit } from '@/lib/rateLimit'

const MAX_FILE_MB = 10
const MAX_BYTES = MAX_FILE_MB * 1024 * 1024
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Browsers sometimes misreport docx as zip or octet-stream
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
]

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  positionTitle: z.string().max(300).optional(),
  recaptchaToken: z.string(),
  honeypot: z.string().max(0, 'Bot detected'),
})

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'

    const { success: rateLimitOk } = await checkLimit(formLimiter, `join:${ip}`)
    if (!rateLimitOk) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please wait before trying again.' },
        { status: 429 },
      )
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Could not read form data. Please try again.' },
        { status: 400 },
      )
    }

    const raw = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      positionTitle: formData.get('positionTitle') ?? undefined,
      recaptchaToken: formData.get('recaptchaToken') ?? '',
      honeypot: formData.get('website') ?? '',
    }

    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      )
    }

    const { name, email, message, positionTitle, recaptchaToken, honeypot } = parsed.data
    if (honeypot) {
      return NextResponse.json({ success: false, error: 'Bot detected.' }, { status: 400 })
    }

    const valid = await verifyRecaptcha(recaptchaToken)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Security check failed. Please try again.' },
        { status: 400 },
      )
    }

    const cvFile = formData.get('cv')
    const sopFile = formData.get('sop')

    const payload = await getPayload({ config })

    let cvUrl: string | undefined
    let sopUrl: string | undefined
    let cvFilename: string | undefined
    let sopFilename: string | undefined

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (cvFile instanceof File && cvFile.size > 0) {
      if (cvFile.size > MAX_BYTES) {
        return NextResponse.json(
          { success: false, error: `CV must be under ${MAX_FILE_MB} MB.` },
          { status: 400 },
        )
      }
      const typeOk = ALLOWED_MIME.includes(cvFile.type) || ALLOWED_EXT.test(cvFile.name)
      if (!typeOk) {
        return NextResponse.json(
          { success: false, error: 'CV must be a PDF or Word document (.pdf, .doc, .docx).' },
          { status: 400 },
        )
      }
      cvFilename = cvFile.name
      if (blobToken) {
        try {
          const { put } = await import('@vercel/blob')
          const safeName = cvFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const { url } = await put(
            `applicant-files/${Date.now()}-cv-${safeName}`,
            Buffer.from(await cvFile.arrayBuffer()),
            { access: 'public', contentType: cvFile.type, token: blobToken },
          )
          cvUrl = url
        } catch (fileErr) {
          console.error('[join-submit] CV upload to Vercel Blob failed:', fileErr)
        }
      }
    }

    if (sopFile instanceof File && sopFile.size > 0) {
      if (sopFile.size > MAX_BYTES) {
        return NextResponse.json(
          { success: false, error: `SOP must be under ${MAX_FILE_MB} MB.` },
          { status: 400 },
        )
      }
      const typeOk = ALLOWED_MIME.includes(sopFile.type) || ALLOWED_EXT.test(sopFile.name)
      if (!typeOk) {
        return NextResponse.json(
          { success: false, error: 'SOP must be a PDF or Word document (.pdf, .doc, .docx).' },
          { status: 400 },
        )
      }
      sopFilename = sopFile.name
      if (blobToken) {
        try {
          const { put } = await import('@vercel/blob')
          const safeName = sopFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const { url } = await put(
            `applicant-files/${Date.now()}-sop-${safeName}`,
            Buffer.from(await sopFile.arrayBuffer()),
            { access: 'public', contentType: sopFile.type, token: blobToken },
          )
          sopUrl = url
        } catch (fileErr) {
          console.error('[join-submit] SOP upload to Vercel Blob failed:', fileErr)
        }
      }
    }

    await payload.create({
      collection: 'inquiries',
      data: {
        formType: 'join',
        name,
        email,
        message,
        ...(positionTitle ? { positionTitle } : {}),
        ...(cvFilename ? { cvFilename } : {}),
        ...(cvUrl ? { cvUrl } : {}),
        ...(sopFilename ? { sopFilename } : {}),
        ...(sopUrl ? { sopUrl } : {}),
      },
      overrideAccess: true,
    })

    const notifyAddress = process.env.EMAIL_NOTIFY ?? process.env.EMAIL_FROM
    if (notifyAddress) {
      Promise.all([
        payload.sendEmail({
          to: notifyAddress,
          subject: `[NOG Lab] New application from ${name}`,
          html: `<p><b>${htmlEscape(name)}</b> (${htmlEscape(email)}) applied${positionTitle ? ` for <em>${htmlEscape(positionTitle)}</em>` : ''}.</p>${cvFilename ? `<p>CV: ${htmlEscape(cvFilename)} ${cvUrl ? `— <a href="${cvUrl}">Download</a> ✓` : '⚠ not stored (no Blob token)'}` : ''}${sopFilename ? `<p>SOP: ${htmlEscape(sopFilename)} ${sopUrl ? `— <a href="${sopUrl}">Download</a> ✓` : '⚠ not stored (no Blob token)'}` : ''}<blockquote>${htmlEscape(message).replace(/\n/g, '<br>')}</blockquote>`,
        }),
        payload.sendEmail({
          to: email,
          subject: 'Application received — NOG Lab',
          html: `<p>Dear ${htmlEscape(name)},</p><p>Thank you for your interest in joining NOG Lab. We will review your application and be in touch.</p><p>— NOG Lab</p>`,
        }),
      ]).catch((err) => console.error('[join-submit] email error (non-fatal):', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[join-submit] unhandled error:', err)
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 },
    )
  }
}
