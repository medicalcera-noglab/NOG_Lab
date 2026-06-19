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
  message: z.string().min(10).max(5000),
  recaptchaToken: z.string().min(1),
  honeypot: z.string().max(0, 'Bot detected'),
})

export interface ContactFormState {
  success: boolean
  error?: string
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const ip =
    (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ??
    (await headers()).get('x-real-ip') ??
    '127.0.0.1'
  const { success: rateLimitOk } = await checkLimit(formLimiter, `contact:${ip}`)
  if (!rateLimitOk)
    return { success: false, error: 'Too many submissions. Please wait before trying again.' }

  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    recaptchaToken: formData.get('recaptchaToken'),
    honeypot: formData.get('website') ?? '',
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { name, email, message, recaptchaToken, honeypot } = parsed.data
  if (honeypot) return { success: false, error: 'Bot detected.' }

  const valid = await verifyRecaptcha(recaptchaToken)
  if (!valid) return { success: false, error: 'Security check failed. Please try again.' }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'inquiries',
      data: {
        formType: 'contact',
        name: sanitize(name),
        email,
        message: sanitize(message),
      },
      overrideAccess: true,
    })

    const contactEmail = process.env.EMAIL_FROM
    if (contactEmail) {
      await payload.sendEmail({
        to: contactEmail,
        subject: `[NOG Lab] New contact from ${name}`,
        html: `<p><b>${sanitize(name)}</b> (${email}) sent a message:</p><blockquote>${sanitize(message).replace(/\n/g, '<br>')}</blockquote>`,
      })
      await payload.sendEmail({
        to: email,
        subject: 'We received your message — NOG Lab',
        html: `<p>Dear ${sanitize(name)},</p><p>Thank you for reaching out. We'll get back to you within 3-5 business days.</p><p>— NOG Lab</p>`,
      })
    }
  } catch (err) {
    console.error('[submitContact]', err)
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
