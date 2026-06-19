'use server'

import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyRecaptcha } from '../recaptcha'

const MAX_FILE_MB = 10
const MAX_BYTES = MAX_FILE_MB * 1024 * 1024
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  positionTitle: z.string().max(300).optional(),
  recaptchaToken: z.string().min(1),
  honeypot: z.string().max(0, 'Bot detected'),
})

export interface JoinFormState {
  success: boolean
  error?: string
}

export async function submitJoin(_prev: JoinFormState, formData: FormData): Promise<JoinFormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    positionTitle: formData.get('positionTitle') ?? undefined,
    recaptchaToken: formData.get('recaptchaToken'),
    honeypot: formData.get('website') ?? '',
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { name, email, message, positionTitle, recaptchaToken, honeypot } = parsed.data
  if (honeypot) return { success: false, error: 'Bot detected.' }

  const valid = await verifyRecaptcha(recaptchaToken)
  if (!valid) return { success: false, error: 'Security check failed. Please try again.' }

  const cvFile = formData.get('cv')
  const sopFile = formData.get('sop')

  try {
    const payload = await getPayload({ config })

    let cvId: number | undefined
    let sopId: number | undefined

    if (cvFile instanceof File && cvFile.size > 0) {
      if (cvFile.size > MAX_BYTES)
        return { success: false, error: `CV must be under ${MAX_FILE_MB} MB.` }
      if (!ALLOWED_MIME.includes(cvFile.type))
        return { success: false, error: 'CV must be PDF or Word doc.' }
      const buf = Buffer.from(await cvFile.arrayBuffer())
      const created = await payload.create({
        collection: 'applicant_files',
        data: { submittedBy: email },
        file: { data: buf, mimetype: cvFile.type, name: cvFile.name, size: cvFile.size },
        overrideAccess: true,
      })
      cvId = created.id
    }

    if (sopFile instanceof File && sopFile.size > 0) {
      if (sopFile.size > MAX_BYTES)
        return { success: false, error: `SOP must be under ${MAX_FILE_MB} MB.` }
      if (!ALLOWED_MIME.includes(sopFile.type))
        return { success: false, error: 'SOP must be PDF or Word doc.' }
      const buf = Buffer.from(await sopFile.arrayBuffer())
      const created = await payload.create({
        collection: 'applicant_files',
        data: { submittedBy: email },
        file: { data: buf, mimetype: sopFile.type, name: sopFile.name, size: sopFile.size },
        overrideAccess: true,
      })
      sopId = created.id
    }

    const msgText = positionTitle ? `Position: ${positionTitle}\n\n${message}` : message

    await payload.create({
      collection: 'inquiries',
      data: {
        formType: 'join',
        name: sanitize(name),
        email,
        message: sanitize(msgText),
        ...(cvId ? { cv: cvId } : {}),
        ...(sopId ? { sop: sopId } : {}),
      },
      overrideAccess: true,
    })

    const contactEmail = process.env.EMAIL_FROM
    if (contactEmail) {
      await payload.sendEmail({
        to: contactEmail,
        subject: `[NOG Lab] New application from ${name}`,
        html: `<p><b>${sanitize(name)}</b> (${email}) applied${positionTitle ? ` for <em>${sanitize(positionTitle)}</em>` : ''}.</p><blockquote>${sanitize(message).replace(/\n/g, '<br>')}</blockquote>`,
      })
      await payload.sendEmail({
        to: email,
        subject: 'Application received — NOG Lab',
        html: `<p>Dear ${sanitize(name)},</p><p>Thank you for your interest in joining NOG Lab. We will review your application and be in touch.</p><p>— NOG Lab</p>`,
      })
    }
  } catch (err) {
    console.error('[submitJoin]', err)
    return { success: false, error: 'Server error. Please try again.' }
  }

  return { success: true }
}

function sanitize(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
