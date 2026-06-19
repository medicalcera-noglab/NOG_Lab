import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }

  // Always load English as the base; overlay locale-specific translations on top.
  // This means ur.json only needs to contain strings that differ from English.
  const en = (await import('../../messages/en.json')).default
  const localeMessages =
    locale !== 'en'
      ? await import(`../../messages/${locale}.json`)
          .then((m) => m.default as Record<string, unknown>)
          .catch(() => ({}))
      : {}

  return {
    locale,
    messages: { ...en, ...localeMessages },
  }
})
