'use client'

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'nog_consent'

type ConsentState = 'granted' | 'denied' | null

// ── External store ────────────────────────────────────────────────────────────
// Keeps a listener set so useSyncExternalStore gets notified on mutations.
let _listeners: Array<() => void> = []

function _subscribe(fn: () => void) {
  _listeners.push(fn)
  return () => {
    _listeners = _listeners.filter((l) => l !== fn)
  }
}

function _getSnapshot(): ConsentState {
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'granted' ? 'granted' : v === 'denied' ? 'denied' : null
}

// Server-side snapshot: unknown until we can read localStorage on the client.
function _getServerSnapshot(): ConsentState {
  return null
}

function _emit() {
  _listeners.forEach((fn) => fn())
}
// ─────────────────────────────────────────────────────────────────────────────

interface ConsentContextValue {
  consent: ConsentState
  grant: () => void
  deny: () => void
  /** Clears the stored preference — the banner reappears. */
  reset: () => void
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  grant: () => {},
  deny: () => {},
  reset: () => {},
})

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(_subscribe, _getSnapshot, _getServerSnapshot)

  const grant = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'granted')
    _emit()
  }, [])

  const deny = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'denied')
    _emit()
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    _emit()
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
