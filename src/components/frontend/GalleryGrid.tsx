'use client'

import { useState } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import { TagFilter } from './TagFilter'
import type { ArtPiece, Media } from '@/payload-types'

type Tag = 'drawings' | 'paintings' | 'tattoo-designs' | 'digital-art' | 'mixed-media'

const breakpointColumns = {
  default: 3,
  1024: 3,
  768: 2,
  480: 1,
}

interface GalleryGridProps {
  pieces: ArtPiece[]
}

export function GalleryGrid({ pieces }: GalleryGridProps) {
  const [activeTag, setActiveTag] = useState<Tag | null>(null)

  const filtered =
    activeTag === null
      ? pieces
      : pieces.filter((p) => p.tags?.includes(activeTag))

  // Featured first; preserve server order within same featured status
  const sorted = [...filtered].sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
  )

  return (
    <div className="space-y-6">
      <TagFilter activeTag={activeTag} onTagChange={setActiveTag} />

      {sorted.length === 0 && (
        <p className="font-body text-text-muted text-center py-20">
          No pieces found.
        </p>
      )}

      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {sorted.map((piece) => {
          const media =
            typeof piece.image === 'object' ? (piece.image as Media) : null
          if (!media) return null

          const src = media.sizes?.gallery?.url ?? media.url ?? ''
          const width = media.sizes?.gallery?.width ?? media.width ?? 1200
          const height = media.sizes?.gallery?.height ?? media.height ?? 800

          return (
            <div
              key={piece.id}
              className="relative group cursor-pointer overflow-hidden rounded-sm"
              onClick={() => console.log('Open lightbox for piece', piece.id)}
            >
              <Image
                src={src}
                width={width}
                height={height}
                alt={media.alt}
                placeholder={media.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={media.blurDataURL ?? undefined}
                className="w-full h-auto rounded-sm"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-bg/80 to-transparent rounded-sm flex flex-col justify-end p-4">
                <p className="font-heading text-text-heading text-sm leading-tight">
                  {piece.title}
                </p>
                {piece.medium && (
                  <p className="font-body text-text-muted text-xs mt-1">
                    {piece.medium}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </Masonry>
    </div>
  )
}
