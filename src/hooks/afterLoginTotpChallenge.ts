/**
 * Payload afterLogin hook for the Users collection.
 *
 * When the user has TOTP enabled, this hook must prevent the normal session
 * from being issued. Payload doesn't expose a built-in "reject login" from
 * afterLogin hooks, so the strategy is:
 *
 * 1. Allow Payload to complete its password check (maxLoginAttempts still applies).
 * 2. In afterOperation on the login endpoint, detect totpEnabled and:
 *    a. Set a signed `totp-challenge` cookie (userId + partial:true, 5 min TTL).
 *    b. Clear the `payload-token` cookie Payload just set.
 *    c. Return a 200 response that the client recognises as "needs TOTP".
 *
 * Because we cannot intercept the cookie-writing at the hook level, the
 * afterLogin hook attaches metadata to the response and the custom API route
 * at /api/totp/intercept handles the actual cookie swap.
 *
 * Simpler alternative used here: afterLogin hook writes challenge to DB and the
 * login route.ts wraps Payload's login response.
 *
 * --- Implementation note ---
 * Payload 3.x provides `afterLogin` hooks. The hook receives `{ user, req }`.
 * We cannot remove the token from the response here, but we CAN:
 *   • Mark a DB field `totpChallengePending = true`
 *   • The totp/login endpoint verifies against this flag
 *
 * For a clean UX the admin TOTP UI calls /api/users/login, then checks the
 * response body for `requiresTOTP: true`, and redirects to the 2FA entry screen.
 *
 * The actual token enforcement is done by proxy.ts which checks for
 * `totpChallengePending` in the JWT before allowing /admin through.
 */
import type { CollectionAfterLoginHook } from 'payload'
import { issueTotpChallenge } from '../app/(payload)/api/totp/login/route'

export const afterLoginTotpChallenge: CollectionAfterLoginHook = async ({ user, req }) => {
  const typedUser = user as {
    id: string | number
    email: string
    totpEnabled?: boolean
  }

  if (!typedUser.totpEnabled) return user

  // Issue a challenge token and set it as a cookie on the response.
  const challengeToken = issueTotpChallenge(typedUser.id, typedUser.email)

  // Attach challenge info to the request so the response middleware can act on it.
  // We use req.responseHeaders if available (Payload 3.x Web API).
  const headers = req.responseHeaders
  if (headers) {
    const cookieValue = [
      `totp-challenge=${challengeToken}`,
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=300`,
      'Path=/',
      ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
    ].join('; ')

    headers.append('Set-Cookie', cookieValue)
    // Signal the client that TOTP is required.
    headers.set('X-Requires-TOTP', '1')
  }

  // Return user with a flag the client can read from the JSON body.
  return { ...typedUser, requiresTOTP: true }
}
