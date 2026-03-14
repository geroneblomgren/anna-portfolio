'use client'

import NextImage from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import type { ArtPiece, Media } from '@/payload-types'

interface GalleryLightboxProps {
  pieces: ArtPiece[]
  open: boolean
  index: number
  onClose: () => void
}

export function GalleryLightbox({ pieces, open, index, onClose }: GalleryLightboxProps) {
  const slides = pieces.map((p) => {
    const media = typeof p.image === 'object' ? (p.image as Media) : null
    return {
      src: media?.sizes?.lightbox?.url ?? media?.url ?? '',
      width: media?.sizes?.lightbox?.width ?? media?.width ?? 2400,
      height: media?.sizes?.lightbox?.height ?? media?.height ?? 1600,
      alt: media?.alt ?? p.title,
      title: p.title,
      description: [
        p.medium,
        p.description,
        p.tags?.map((t) => t.replace(/-/g, ' ')).join(', '),
      ]
        .filter(Boolean)
        .join(' — '),
      blurDataURL: media?.blurDataURL ?? undefined,
    }
  })

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Captions]}
      styles={{ root: { '--yarl__color_backdrop': 'rgba(10,10,10,0.95)' } }}
      render={{
        slide: ({ slide }) => (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <NextImage
              src={slide.src}
              alt={'alt' in slide ? (slide.alt ?? '') : ''}
              fill
              sizes="100vw"
              placeholder={'blurDataURL' in slide && slide.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={'blurDataURL' in slide ? (slide.blurDataURL as string | undefined) : undefined}
              style={{ objectFit: 'contain' }}
            />
          </div>
        ),
      }}
    />
  )
}
