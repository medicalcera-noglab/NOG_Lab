'use client'

import { useEffect } from 'react'
import { useConsent } from '@/providers/ConsentProvider'

interface AnalyticsProps {
  /** Plausible domain from SiteSettings.analyticsId (e.g. "noglab.org"). */
  analyticsId: string | null | undefined
}

export function Analytics({ analyticsId }: AnalyticsProps) {
  const { consent } = useConsent()

  useEffect(() => {
    if (consent !== 'granted' || !analyticsId) return
    if (document.querySelector('script[data-plausible]')) return

    const script = document.createElement('script')
    script.src = 'https://plausible.io/js/script.js'
    script.setAttribute('data-domain', analyticsId)
    script.setAttribute('data-plausible', '1')
    script.defer = true
    document.head.appendChild(script)
  }, [consent, analyticsId])

  return null
}
