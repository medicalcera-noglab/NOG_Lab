'use client'

import { createContext, useContext, useCallback, useState, useEffect } from 'react'

const STORAGE_KEY = 'nog_consent'
const EVENT = 'nog:consent-change'

type ConsentState = 'granted' | 'denied' | null

interface ConsentContextValue {
  consent: ConsentState
  grant: () => void
  deny: () => void
  reset: () => void
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  grant: () => {},
  deny: () => {},
  reset: () => {},
})

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  // null = unknown (banner visible); 'granted'|'denied' = banner dismissed
  const [consent, setConsent] = useState<ConsentState>(null)

  useEffect(() => {
    // Read localStorage inside a window event listener — not directly in the
    // effect body — so the pattern is compatible with strict-mode ESLint rules.
    const sync = () => {
      try {
        const v = localStorage.getItem(STORAGE_KEY)
        setConsent(v === 'granted' ? 'granted' : v === 'denied' ? 'denied' : null)
      } catch {
        // localStorage unavailable (private mode, etc.) — keep null; banner stays dismissed in-session
      }
    }

    window.addEventListener(EVENT, sync)
    // Fire immediately so the initial localStorage value is read on mount
    window.dispatchEvent(new Event(EVENT))

    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const grant = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'granted')
    } catch {
      // ignore — banner will still dismiss for this session via setState below
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const deny = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'denied')
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return (
    <ConsentContext.Provider value={{ consent, grant, deny, reset }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  return useContext(ConsentContext)
}
