'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendContactEmail } from '@/actions/sendContactEmail'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-bg font-body font-medium px-8 py-3 rounded-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
    >
      {pending ? 'Sending...' : 'Send Message'}
    </button>
  )
}

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactEmail, {})

  if (state.success) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-heading text-xl font-heading mb-2">
          Thank you{state.name ? `, ${state.name}` : ''}!
        </p>
        <p className="text-text-body font-body">
          Your message has been sent. Anna will get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="font-body text-text-body text-sm mb-1 block">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          autoComplete="name"
          className="bg-surface border border-border text-text-body rounded-sm px-4 py-3 w-full font-body focus:border-accent focus:outline-none transition-colors"
        />
        {state.fieldErrors?.name && (
          <p className="text-error text-sm mt-1">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="font-body text-text-body text-sm mb-1 block">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          className="bg-surface border border-border text-text-body rounded-sm px-4 py-3 w-full font-body focus:border-accent focus:outline-none transition-colors"
        />
        {state.fieldErrors?.email && (
          <p className="text-error text-sm mt-1">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="font-body text-text-body text-sm mb-1 block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="bg-surface border border-border text-text-body rounded-sm px-4 py-3 w-full font-body focus:border-accent focus:outline-none transition-colors resize-y"
        />
        {state.fieldErrors?.message && (
          <p className="text-error text-sm mt-1">{state.fieldErrors.message[0]}</p>
        )}
      </div>

      {/* General error */}
      {state.error && (
        <p className="text-error text-sm">{state.error}</p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
