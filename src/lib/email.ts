import { resendAdapter } from '@payloadcms/email-resend'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * Returns the appropriate Payload email adapter.
 * - Production / staging: Resend (requires RESEND_API_KEY + EMAIL_FROM).
 * - Development without a key: Nodemailer ethereal (auto-captures in console).
 */
export function buildEmailAdapter() {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'NOG Lab <noreply@noglab.org>'

  if (key && key.length > 0) {
    return resendAdapter({
      defaultFromAddress: from,
      defaultFromName: 'NOG Lab',
      apiKey: key,
    })
  }

  // Dev fallback — Nodemailer with ethereal transport. Preview URL printed to console.
  return nodemailerAdapter({
    defaultFromAddress: from,
    defaultFromName: 'NOG Lab',
    // Transport-less: nodemailer-adapter creates an ethereal test account automatically.
  })
}
