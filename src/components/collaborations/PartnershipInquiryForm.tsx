'use client'

import { useActionState } from 'react'
import { submitPartnership, type PartnershipFormState } from '@/lib/actions/submitPartnership'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const initialFormState: PartnershipFormState = { success: false }

export function PartnershipInquiryForm() {
  const [state, formAction, isPending] = useActionState(submitPartnership, initialFormState)
  const recaptchaToken = 'demo-bypass-token'

  return (
    <div className="border-border bg-surface rounded-2xl border p-6 shadow-sm md:p-8">
      {state.success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-primary/10 text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="font-heading text-fg mb-2 text-2xl font-bold">
            Partnership Enquiry Submitted!
          </h3>
          <p className="text-muted max-w-md text-sm leading-relaxed">
            Thank you for reaching out to NOG Lab. Our research collaborations team will review your
            enquiry and get back to you within 2–3 business days.
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-6">
          {/* Honeypot anti-spam */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="sr-only"
            aria-hidden="true"
          />
          <input type="hidden" name="recaptchaToken" value={recaptchaToken} />

          {state.error && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-4 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-fg mb-2 block text-sm font-semibold">
                Your Full Name <span className="text-primary">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Prof. Sarah Ahmed / Dr. Tariq Khan"
                className={cn(
                  'border-border bg-bg text-fg w-full rounded-xl border px-4 py-3 text-sm transition-colors',
                  'focus:border-primary focus:ring-primary focus:ring-2 focus:outline-none',
                )}
              />
            </div>

            <div>
              <label htmlFor="email" className="text-fg mb-2 block text-sm font-semibold">
                Work Email <span className="text-primary">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="e.g. s.ahmed@institution.org"
                className={cn(
                  'border-border bg-bg text-fg w-full rounded-xl border px-4 py-3 text-sm transition-colors',
                  'focus:border-primary focus:ring-primary focus:ring-2 focus:outline-none',
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="organization" className="text-fg mb-2 block text-sm font-semibold">
                Organization / Institution Name <span className="text-primary">*</span>
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                placeholder="e.g. Khyber Medical University / Imperial College London"
                className={cn(
                  'border-border bg-bg text-fg w-full rounded-xl border px-4 py-3 text-sm transition-colors',
                  'focus:border-primary focus:ring-primary focus:ring-2 focus:outline-none',
                )}
              />
            </div>

            <div>
              <label
                htmlFor="organizationType"
                className="text-fg mb-2 block text-sm font-semibold"
              >
                Organization Type <span className="text-primary">*</span>
              </label>
              <select
                id="organizationType"
                name="organizationType"
                required
                defaultValue="academic"
                className={cn(
                  'border-border bg-bg text-fg w-full rounded-xl border px-4 py-3 text-sm transition-colors',
                  'focus:border-primary focus:ring-primary focus:ring-2 focus:outline-none',
                )}
              >
                <option value="academic">Academic & Research Institution</option>
                <option value="industry">Industry (Nutrition / Pharma / Biotech)</option>
                <option value="ngo">NGO / Development Organisation</option>
                <option value="government">Government / Public Health Agency</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="researchInterest" className="text-fg mb-2 block text-sm font-semibold">
              Primary Research Interest / Focus Area <span className="text-primary">*</span>
            </label>
            <input
              id="researchInterest"
              name="researchInterest"
              type="text"
              required
              placeholder="e.g. Gut Microbiome Cohort, Clinical Trial, Biobanking"
              className={cn(
                'border-border bg-bg text-fg w-full rounded-xl border px-4 py-3 text-sm transition-colors',
                'focus:border-primary focus:ring-primary focus:ring-2 focus:outline-none',
              )}
            />
          </div>

          <div>
            <label htmlFor="message" className="text-fg mb-2 block text-sm font-semibold">
              Project Overview & Collaboration Goals <span className="text-primary">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Please briefly describe your study objectives, scope, or how you would like to partner with NOG Lab..."
              className={cn(
                'border-border bg-bg text-fg w-full rounded-xl border px-4 py-3 text-sm transition-colors',
                'focus:border-primary focus:ring-primary focus:ring-2 focus:outline-none',
              )}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'bg-primary hover:bg-accent flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold text-white transition-colors',
              'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
              isPending && 'cursor-not-allowed opacity-70',
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Enquiry...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Collaboration Enquiry
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
