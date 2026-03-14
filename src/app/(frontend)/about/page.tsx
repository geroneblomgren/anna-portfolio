import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media } from '@/payload-types'

export const metadata = {
  title: 'About — Anna Blomgren',
}

export default async function AboutPage() {
  const payload = await getPayload({ config })

  const about = await payload.findGlobal({ slug: 'about', depth: 1, overrideAccess: true })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })

  const hasContent =
    about.photoId || about.bioText || about.artistStatement || about.contactEmail || about.contactPhone

  if (!hasContent) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <p className="text-text-muted font-body text-lg">About page coming soon.</p>
      </div>
    )
  }

  const photoData = about.photoId && typeof about.photoId === 'object' ? (about.photoId as Media) : null
  const photoSrc = photoData?.sizes?.gallery?.url ?? photoData?.url
  const photo = photoData && photoSrc ? photoData : null
  const socialLinks = siteSettings.socialLinks ?? []

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Hero photo */}
      {photo && (
        <div className="mb-10">
          <Image
            src={photoSrc!}
            alt={photo.alt}
            width={photo.sizes?.gallery?.width ?? photo.width ?? 1200}
            height={photo.sizes?.gallery?.height ?? photo.height ?? 800}
            placeholder={photo.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={photo.blurDataURL ?? undefined}
            className="w-full h-auto rounded-sm"
            priority
          />
        </div>
      )}

      {/* Bio text */}
      {about.bioText && (
        <div className="mt-8 font-body text-text-body [&_p]:leading-relaxed [&_p]:mb-4 [&_h2]:text-text-heading [&_h2]:font-heading [&_h2]:text-3xl md:[&_h2]:text-4xl [&_h2]:tracking-brand-wide [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-text-heading [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:tracking-brand-wide [&_h3]:mt-6 [&_h3]:mb-3 [&_a]:text-accent [&_a]:underline [&_a]:hover:text-accent-hover [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_strong]:text-text-heading [&_em]:italic">
          <RichText data={about.bioText} />
        </div>
      )}

      {/* Artist statement */}
      {about.artistStatement && (
        <div className="mt-10">
          <h2 className="font-heading text-text-heading text-3xl md:text-4xl tracking-brand-wide mb-4">Artist Statement</h2>
          <blockquote className="pl-4 border-l-2 border-accent">
            <p className="text-text-body italic font-body text-lg leading-relaxed">
              {about.artistStatement}
            </p>
          </blockquote>
        </div>
      )}

      {/* Contact info */}
      {(about.contactEmail || about.contactPhone) && (
        <div className="mt-12">
          <h2 className="font-heading text-text-heading text-3xl md:text-4xl tracking-brand-wide mb-4">Contact</h2>
          <div className="flex flex-col gap-2">
            {about.contactEmail && (
              <a
                href={`mailto:${about.contactEmail}`}
                className="text-accent hover:text-accent-hover underline font-body transition-colors"
              >
                {about.contactEmail}
              </a>
            )}
            {about.contactPhone && (
              <a
                href={`tel:${about.contactPhone}`}
                className="text-accent hover:text-accent-hover underline font-body transition-colors"
              >
                {about.contactPhone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-col gap-3">
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
