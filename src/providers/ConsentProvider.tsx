'use client'

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'nog_consent'

type ConsentState = 'granted' | 'denied' | null

// ── External store ────────────────────────────────────────────────────────────
// In-memory fallback for browsers that block localStorage (private mode, etc.)
let _mem: ConsentState = null
let _listeners: Array<() => void> = []

function _subscribe(fn: () => void) {
  _listeners.push(fn)
  return () => {
    _listeners = _listeners.filter((l) => l !== fn)
  }
}

function _read(): ConsentState {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'granted' || v === 'denied') return v
  } catch {
    // localStorage unavailable — use in-memory state
  }
  return _mem
}

function _getSnapshot(): ConsentState {
  return _read()
}

function _getServerSnapshot(): ConsentState {
  return null
}

function _emit() {
  // Copy the array before iterating in case a listener mutates it
  const fns = _listeners.slice()
  fns.forEach((fn) => fn())
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const consent = useSyncExternalStore(_subscribe, _getSnapshot, _getServerSnapshot)

  const grant = useCallback(() => {
    _mem = 'granted'
    try {
      localStorage.setItem(STORAGE_KEY, 'granted')
    } catch {
      // storage blocked — in-memory state still dismisses the banner
    }
    _emit()
  }, [])

  const deny = useCallback(() => {
    _mem = 'denied'
    try {
      localStorage.setItem(STORAGE_KEY, 'denied')
    } catch {
      // storage blocked — in-memory state still dismisses the banner
    }
    _emit()
  }, [])

  const reset = useCallback(() => {
    _mem = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
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
