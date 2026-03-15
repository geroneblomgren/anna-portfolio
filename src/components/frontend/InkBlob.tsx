'use client'
import { motion, useReducedMotion } from 'motion/react'

// Pre-generated blob paths — ALL share the same cubic bezier structure:
// M + 4 C commands + Z = 5 commands each, 4 control point sets
// Hand-crafted variations to ensure consistent point count for smooth morphing
const BLOB_PATHS = [
  "M 170,50 C 220,10 290,30 310,80 C 330,130 310,200 270,230 C 230,260 160,260 120,230 C 80,200 60,120 170,50 Z",
  "M 180,40 C 230,5 300,25 315,75 C 330,125 320,195 275,235 C 230,275 150,265 115,225 C 80,185 70,110 180,40 Z",
  "M 160,55 C 215,15 285,35 305,85 C 325,135 315,205 265,240 C 215,275 145,270 110,235 C 75,200 55,130 160,55 Z",
]

export function InkBlob({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 380 280"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      {prefersReducedMotion ? (
        <path d={BLOB_PATHS[0]} fill="var(--color-surface)" opacity={0.5} />
      ) : (
        <motion.path
          d={BLOB_PATHS[0]}
          fill="var(--color-surface)"
          opacity={0.5}
          animate={{ d: BLOB_PATHS }}
          transition={{
            duration: 10,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      )}
    </svg>
  )
}
