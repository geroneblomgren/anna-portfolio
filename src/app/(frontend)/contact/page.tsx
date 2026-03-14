import { getPayload } from 'payload'
import config from '@payload-config'
import { ContactForm } from '@/components/frontend/ContactForm'

export const metadata = {
  title: 'Contact — Anna Blomgren',
}

export default async function ContactPage() {
  const payload = await getPayload({ config })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
  const socialLinks = siteSettings.socialLinks ?? []

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="font-heading text-text-heading text-4xl md:text-5xl mb-4">
        Get in Touch
      </h1>
      <p className="text-text-muted font-body mb-8">
        Interested in collaborating or have a question? Drop me a message.
      </p>
      <ContactForm />

      {socialLinks.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-text-muted font-body text-sm mb-3">You can also find me on</p>
          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.id ?? link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover inline-flex items-center gap-2 font-body transition-colors"
              >
                {link.platform === 'instagram' || link.platform === 'Instagram' ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    Instagram
                  </>
                ) : (
                  <>
                    {link.platform} <span aria-hidden="true">→</span>
                  </>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
