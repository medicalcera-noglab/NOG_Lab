'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Forward to Sentry as a custom measurement
    Sentry.setMeasurement(metric.name, metric.value, metric.name === 'CLS' ? '' : 'millisecond')

    if (process.env.NODE_ENV === 'development' && metric.rating === 'poor') {
      console.warn(`[WebVitals] Poor ${metric.name}: ${metric.value.toFixed(1)}`)
    }
  })

  return null
}
