'use client'

/**
 * Idle timeout guard for the Payload admin.
 * After IDLE_MS of no user activity, clears the payload-token cookie and
 * redirects to the login page with a ?timeout=1 query param.
 *
 * Pairs with tokenExpiration: 1800 (30 min) in the Users collection.
 * Rendered in the (payload) layout so it covers every admin page.
 */
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const IDLE_MS = 30 * 60 * 1000 // 30 minutes
const EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
]

export function IdleTimeout() {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(signOut, IDLE_MS)
    }

    function signOut() {
      // Clear the session cookie by overwriting with expired date.
      document.cookie = 'payload-token=; Max-Age=0; Path=/; SameSite=Lax'
      router.push('/admin/login?timeout=1')
    }

    // Start the timer immediately.
    reset()

    // Reset on any user interaction.
    EVENTS.forEach((e) => document.addEventListener(e, reset, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      EVENTS.forEach((e) => document.removeEventListener(e, reset))
    }
  }, [router])

  return null
}
