'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyRecaptcha } from '../recaptcha'
import { formLimiter, checkLimit } from '../rateLimit'

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  organization: z.string().min(1).max(300),
  organizationType: z.enum(['industry', 'academic', 'ngo', 'government', 'other']),
  researchInterest: z.string().min(1).max(300),
  message: z.string().min(10).max(5000),
  recaptchaToken: z.string(),
  honeypot: z.string().max(0, 'Bot detected'),
})

export interface PartnershipFormState {
  success: boolean
  error?: string
}

export async function submitPartnership(
  _prev: PartnershipFormState,
  formData: FormData,
): Promise<PartnershipFormState> {
  const ip =
    (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ??
    (await headers()).get('x-real-ip') ??
    '127.0.0.1'

  const { success: rateLimitOk } = await checkLimit(formLimiter, `partnership:${ip}`)
  if (!rateLimitOk) {
    return { success: false, error: 'Too many submissions. Please wait before trying again.' }
  }

  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    organization: formData.get('organization'),
    organizationType: formData.get('organizationType'),
    researchInterest: formData.get('researchInterest'),
    message: formData.get('message'),
    recaptchaToken: formData.get('recaptchaToken') ?? '',
    honeypot: formData.get('website') ?? '',
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const {
    name,
    email,
    organization,
    organizationType,
    researchInterest,
    message,
    recaptchaToken,
    honeypot,
  } = parsed.data

  if (honeypot) return { success: false, error: 'Bot detected.' }

  const valid = await verifyRecaptcha(recaptchaToken)
  if (!valid) return { success: false, error: 'Security check failed. Please try again.' }

  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'inquiries',
      data: {
        formType: 'partnership',
        name,
        email,
        organization,
        organizationType,
        researchInterest,
        message,
      },
      overrideAccess: true,
    })

    const notifyAddress = process.env.EMAIL_NOTIFY ?? process.env.EMAIL_FROM
    if (notifyAddress) {
      Promise.all([
        payload.sendEmail({
          to: notifyAddress,
          subject: `[NOG Lab] New Partnership Enquiry from ${name} (${organization})`,
          html: `<p><b>Name:</b> ${htmlEscape(name)}<br><b>Email:</b> ${htmlEscape(email)}<br><b>Organization:</b> ${htmlEscape(organization)} (${htmlEscape(organizationType)})<br><b>Primary Interest:</b> ${htmlEscape(researchInterest)}</p><p><b>Message:</b></p><blockquote>${htmlEscape(message).replace(/\n/g, '<br>')}</blockquote>`,
        }),
        payload.sendEmail({
          to: email,
          subject: 'Partnership Enquiry Received — NOG Lab',
          html: `<p>Dear ${htmlEscape(name)},</p><p>Thank you for expressing interest in partnering with NOG Lab at Khyber Medical University. Our research collaborations team will review your enquiry and contact you within 2–3 business days.</p><p>Best regards,<br><b>NOG Lab Research Partnerships Team</b></p>`,
        }),
      ]).catch((err) => console.error('[submitPartnership] email error (non-fatal):', err))
    }
  } catch (err) {
    console.error('[submitPartnership] db error:', err)
    return { success: false, error: 'Server error. Please try again.' }
  }

  return { success: true }
}

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
