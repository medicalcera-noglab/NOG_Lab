import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    // Session replays — 5 % of sessions, 100 % of errors
    integrations: [Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    // Trace 10 % of requests to get performance data
    tracesSampleRate: 0.1,

    // Strip PII from breadcrumbs and payloads
    beforeSend(event) {
      if (event.request?.cookies) delete event.request.cookies
      if (event.user) {
        delete event.user.ip_address
        delete event.user.email
      }
      return event
    },
  })
}
