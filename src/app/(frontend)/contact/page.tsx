import { ContactForm } from '@/components/frontend/ContactForm'

export const metadata = {
  title: 'Contact — Anna Blomgren',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="font-heading text-text-heading text-4xl md:text-5xl mb-4">
        Get in Touch
      </h1>
      <p className="text-text-muted font-body mb-8">
        Interested in collaborating or have a question? Drop me a message.
      </p>
      <ContactForm />
    </div>
  )
}
