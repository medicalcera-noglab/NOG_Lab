'use client'

import { createContext, useContext, useCallback, useState, useEffect } from 'react'

const STORAGE_KEY = 'nog_consent'
const EVENT = 'nog:consent-change'

type ConsentState = 'granted' | 'denied' | null

interface ConsentContextValue {
  consent: ConsentState
  ready: boolean
  grant: () => void
  deny: () => void
  reset: () => void
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  ready: false,
  grant: () => {},
  deny: () => {},
  reset: () => {},
})

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  // null = no preference yet; 'granted'|'denied' = user has decided
  const [consent, setConsent] = useState<ConsentState>(null)
  // ready = localStorage has been read; banner must not show before this
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => {
      try {
        const v = localStorage.getItem(STORAGE_KEY)
        setConsent(v === 'granted' ? 'granted' : v === 'denied' ? 'denied' : null)
      } catch {
        // localStorage unavailable (private mode, etc.)
      }
      setReady(true)
    }

    window.addEventListener(EVENT, sync)
    sync()

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
    <ConsentContext.Provider value={{ consent, ready, grant, deny, reset }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  return useContext(ConsentContext)
}
