'use server'

import { Resend } from 'resend'
import { z } from 'zod'
import { ContactNotification } from '@/emails/ContactNotification'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required').max(5000),
})

const resend = new Resend(process.env.RESEND_API_KEY)

type FormState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
  name?: string
}

export async function sendContactEmail(prevState: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    message: formData.get('message') as string,
  }

  const result = schema.safeParse(raw)

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { name, email, message } = result.data

  try {
    const { error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [process.env.ANNA_EMAIL ?? 'test@example.com'],
      subject: `New message from ${name}`,
      react: ContactNotification({ name, email, message }),
    })

    if (error) {
      console.error('Resend error:', error)
      return { error: 'Failed to send message. Please try again.' }
    }

    return { success: true, name }
  } catch (err) {
    console.error('Unexpected error sending contact email:', err)
    return { error: 'Failed to send message. Please try again.' }
  }
}
