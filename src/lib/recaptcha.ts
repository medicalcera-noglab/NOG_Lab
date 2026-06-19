const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const SCORE_THRESHOLD = 0.5

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET
  if (!secret) {
    // Allow through in dev when secret not set
    if (process.env.NODE_ENV !== 'production') return true
    return false
  }

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
