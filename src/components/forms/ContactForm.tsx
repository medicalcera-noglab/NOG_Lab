'use client'

import { useActionState, useRef, useCallback } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/Button'
import { submitContact, type ContactFormState } from '@/lib/actions/submitContact'

declare global {
  interface Window {
    grecaptcha?: {
      ready(cb: () => void): void
      execute(siteKey: string, opts: { action: string }): Promise<string>
    }
  }
}

const initial: ContactFormState = { success: false }

interface Props {
  recaptchaSiteKey?: string | null
}

export function ContactForm({ recaptchaSiteKey }: Props) {
  const [state, action, pending] = useActionState(submitContact, initial)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)

      const submit = (token?: string) => {
        if (token) formData.set('recaptchaToken', token)
        action(formData)
      }

      if (recaptchaSiteKey && window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window
            .grecaptcha!.execute(recaptchaSiteKey, { action: 'contact_submit' })
            .then(submit)
            .catch(() => submit())
        })
      } else {
        submit()
      }
    },
    [recaptchaSiteKey, action],
  )

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800"
      >
        <p className="font-semibold">Message sent!</p>
        <p className="mt-1 text-sm">We&apos;ll get back to you within 3–5 business days.</p>
      </div>
    )
  }

  return (
    <>
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          strategy="lazyOnload"
        />
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
        />
        {/* Populated by handleSubmit before submission */}
        <input type="hidden" name="recaptchaToken" />

        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
            Name <span aria-hidden>*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="border-border bg-bg text-fg placeholder:text-muted w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
            Email <span aria-hidden>*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border-border bg-bg text-fg placeholder:text-muted w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
            Message <span aria-hidden>*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            className="border-border bg-bg text-fg placeholder:text-muted w-full resize-y rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send Message'}
        </Button>
      </form>
    </>
  )
}
