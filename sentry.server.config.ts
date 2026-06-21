import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    tracesSampleRate: 0.1,

    // Strip PII before sending to Sentry
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
