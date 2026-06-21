'use client'

import { useActionState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { submitContact, type ContactFormState } from '@/lib/actions/submitContact'

const initial: ContactFormState = { success: false }

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial)
  const formRef = useRef<HTMLFormElement>(null)

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
    <form ref={formRef} action={action} className="space-y-5" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />
      {/* reCAPTCHA token injected by the page via a hidden input */}
      <input type="hidden" name="recaptchaToken" id="recaptchaToken" defaultValue="" />

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
  )
}
