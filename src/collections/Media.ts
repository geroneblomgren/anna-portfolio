import type { CollectionConfig } from 'payload'
import sharp from 'sharp'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
    },
    {
      name: 'blurDataURL',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated base64 blur placeholder',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Only run when a new file is uploaded
        if (operation !== 'create' && !(operation === 'update' && req.file)) {
          return doc
        }

        // Defer to let SQLite transaction commit first (avoids race condition)
        setTimeout(async () => {
          try {
            // Use thumb buffer if available, otherwise fall back to uploaded file buffer
            const thumbBuffer = (req as any).payloadUploadSizes?.thumb
            const fileBuffer = thumbBuffer || (req.file as any)?.data

            if (!fileBuffer) {
              req.payload.logger.warn({ msg: 'blurDataURL: no buffer available for media id=' + doc.id })
              return
            }

            const blurBuffer = await sharp(fileBuffer)
              .resize(10, 10, { fit: 'inside' })
              .blur(1)
              .png({ compressionLevel: 9 })
              .toBuffer()

            const blurDataURL = `data:image/png;base64,${blurBuffer.toString('base64')}`

            await req.payload.update({
              collection: 'media',
              id: doc.id,
              data: { blurDataURL },
              overrideAccess: true,
            })

            // Warn if gallery variant exceeds 300KB target
            const galleryFilesize = doc.sizes?.gallery?.filesize
            if (galleryFilesize && galleryFilesize > 307200) {
              req.payload.logger.warn({
                msg: `blurDataURL: gallery variant for media id=${doc.id} exceeds 300KB (${Math.round(galleryFilesize / 1024)}KB). Consider uploading a smaller original.`,
              })
            }
          } catch (err) {
            req.payload.logger.error({ err, msg: 'blurDataURL hook failed for media id=' + doc.id })
          }
        }, 100)

        return doc
      },
    ],
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'],
    adminThumbnail: 'thumb',
    filesRequiredOnCreate: false,
    imageSizes: [
      {
        name: 'gallery',
        width: 1200,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: { quality: 75 },
        },
      },
      {
        name: 'lightbox',
        width: 2400,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: { quality: 90 },
        },
      },
      {
        name: 'thumb',
        width: 400,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: { quality: 70 },
        },
      },
    ],
  },
}
