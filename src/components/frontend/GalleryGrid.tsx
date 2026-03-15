'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'motion/react'
import type { Target, TargetAndTransition, Transition } from 'motion/react'
import { TagFilter } from './TagFilter'
import { GalleryLightbox } from './GalleryLightbox'
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

function useIsHoverDevice() {
  const [isHover, setIsHover] = useState(false)
  useEffect(() => {
    setIsHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])
  return isHover
}

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  initial?: Target | boolean
  whileInView?: TargetAndTransition
  viewport?: { once?: boolean; margin?: string; amount?: number | 'some' | 'all' }
  transition?: Transition
}

function TiltCard({ children, className, onClick, initial, whileInView, viewport, transition }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const prefersReducedMotion = useReducedMotion()
  const dampen = 25

  const rotateX = useTransform(mouseY, (y) => {
    if (!cardRef.current) return 0
    const rect = cardRef.current.getBoundingClientRect()
    return -(y - rect.top - rect.height / 2) / dampen
  })

  const rotateY = useTransform(mouseX, (x) => {
    if (!cardRef.current) return 0
    const rect = cardRef.current.getBoundingClientRect()
    return (x - rect.left - rect.width / 2) / dampen
  })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    animate(mouseX, e.clientX, { duration: 0 })
    animate(mouseY, e.clientY, { duration: 0 })
  }, [prefersReducedMotion, mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    animate(mouseX, 0, { type: 'spring', stiffness: 300, damping: 30 })
    animate(mouseY, 0, { type: 'spring', stiffness: 300, damping: 30 })
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}

export function GalleryGrid({ pieces }: GalleryGridProps) {
  const [activeTag, setActiveTag] = useState<Tag | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const isHoverDevice = useIsHoverDevice()

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
        {sorted.map((piece, idx) => {
          const media =
            typeof piece.image === 'object' ? (piece.image as Media) : null
          if (!media) return null

          const src = media.sizes?.gallery?.url ?? media.url ?? ''
          const width = media.sizes?.gallery?.width ?? media.width ?? 1200
          const height = media.sizes?.gallery?.height ?? media.height ?? 800

          const scrollRevealProps = {
            initial: { opacity: 0, y: 24 } as const,
            whileInView: { opacity: 1, y: 0 } as const,
            viewport: { once: true, margin: '-60px' } as const,
            transition: { duration: 0.55, ease: 'easeOut' as const, delay: Math.min(idx, 12) * 0.07 },
          }

          const CardWrapper = isHoverDevice ? TiltCard : motion.div

          return (
            <CardWrapper
              key={piece.id}
              className="gallery-card relative group cursor-pointer overflow-hidden rounded-sm"
              {...scrollRevealProps}
              {...(!isHoverDevice && { whileHover: { scale: 1.025 } })}
              onClick={() => { setLightboxIndex(idx); setLightboxOpen(true) }}
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
            </CardWrapper>
          )
        })}
      </Masonry>

      <GalleryLightbox
        pieces={sorted}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
