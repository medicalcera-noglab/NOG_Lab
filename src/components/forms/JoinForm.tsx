'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { submitJoin, type JoinFormState } from '@/lib/actions/submitJoin'
import type { OpenPosition } from '../../../payload-types'

const initial: JoinFormState = { success: false }

interface Props {
  positions: OpenPosition[]
}

export function JoinForm({ positions }: Props) {
  const [state, action, pending] = useActionState(submitJoin, initial)

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800"
      >
        <p className="font-semibold">Application received!</p>
        <p className="mt-1 text-sm">We&apos;ll review your application and be in touch.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5" noValidate encType="multipart/form-data">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />
      <input type="hidden" name="recaptchaToken" id="join-recaptchaToken" defaultValue="" />

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {positions.length > 0 && (
        <div>
          <label htmlFor="join-position" className="mb-1.5 block text-sm font-medium">
            Position of Interest
          </label>
          <select
            id="join-position"
            name="positionTitle"
            className="border-border bg-bg text-fg w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
          >
            <option value="">— General Inquiry —</option>
            {positions.map((p) => (
              <option key={p.id} value={p.title}>
                {p.title} ({p.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="join-name" className="mb-1.5 block text-sm font-medium">
          Full Name <span aria-hidden>*</span>
        </label>
        <input
          id="join-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="border-border bg-bg text-fg w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="join-email" className="mb-1.5 block text-sm font-medium">
          Email <span aria-hidden>*</span>
        </label>
        <input
          id="join-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border-border bg-bg text-fg w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="join-message" className="mb-1.5 block text-sm font-medium">
          Cover Letter / Message <span aria-hidden>*</span>
        </label>
        <textarea
          id="join-message"
          name="message"
          required
          rows={5}
          className="border-border bg-bg text-fg w-full resize-y rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="join-cv" className="mb-1.5 block text-sm font-medium">
          CV / Resume <span className="text-muted text-xs">(PDF or Word, max 10 MB)</span>
        </label>
        <input
          id="join-cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="file:bg-accent w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>

      <div>
        <label htmlFor="join-sop" className="mb-1.5 block text-sm font-medium">
          Statement of Purpose{' '}
          <span className="text-muted text-xs">(optional, PDF or Word, max 10 MB)</span>
        </label>
        <input
          id="join-sop"
          name="sop"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="file:bg-surface-raised file:text-fg hover:file:bg-border w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit Application'}
      </Button>
    </form>
  )
}
