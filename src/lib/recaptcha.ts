const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const SCORE_THRESHOLD = 0.5

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET
  // reCAPTCHA is opt-in: if RECAPTCHA_SECRET is not configured, allow all submissions.
  // To enable: set RECAPTCHA_SECRET (server) + NEXT_PUBLIC_RECAPTCHA_SITE_KEY (client).
  if (!secret) return true
  if (!token) return false

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      cache: 'no-store',
    })
    const data = (await res.json()) as { success: boolean; score?: number }
    return data.success && (data.score ?? 0) >= SCORE_THRESHOLD
  } catch {
    return false
  }
}
