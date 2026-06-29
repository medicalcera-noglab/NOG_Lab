import { resendAdapter } from '@payloadcms/email-resend'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * Returns the appropriate Payload email adapter.
 * - Production / staging: Resend (requires RESEND_API_KEY + EMAIL_FROM).
 * - Development without a key: Nodemailer ethereal (auto-captures in console).
 */
export function buildEmailAdapter() {
  const key = process.env.RESEND_API_KEY
  // EMAIL_FROM may be "email@example.com" or "Name <email@example.com>".
  // Resend's adapter expects defaultFromAddress to be the bare email only —
  // passing the full "Name <email>" format causes it to double-wrap the name.
  const raw = process.env.EMAIL_FROM ?? 'noreply@noglabkmu.org'
  const fromEmail = raw.match(/<(.+)>/)?.[1] ?? raw

  if (key && key.length > 0) {
    return resendAdapter({
      defaultFromAddress: fromEmail,
      defaultFromName: 'NOG Lab',
      apiKey: key,
    })
  }

  return nodemailerAdapter({
    defaultFromAddress: fromEmail,
    defaultFromName: 'NOG Lab',
  })
}
