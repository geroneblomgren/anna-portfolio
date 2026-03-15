'use client'
import { useEffect, useState } from 'react'
import { useReducedMotion, motion } from 'motion/react'

export function InkTransition() {
  const prefersReducedMotion = useReducedMotion()
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    // Guard 1: If intro hasn't been seen, skip (prevents conflict with IntroAnimation)
    if (!localStorage.getItem('intro-seen')) return

    // Guard 2: If this is the first mount in this session (initial page load), skip
    // Only animate on subsequent navigations
    if (sessionStorage.getItem('navigated')) {
      setShouldAnimate(true)
    } else {
      sessionStorage.setItem('navigated', '1')
    }
  }, [])

  if (!shouldAnimate || prefersReducedMotion) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <filter
            id="ink-bleed-transition"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04 0.08"
              numOctaves={3}
              seed={5}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={6}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation={1.2} />
          </filter>
          <clipPath id="ink-clip">
            <motion.rect
              x="0"
              y="0"
              width="100"
              height="100"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'left center' }}
            />
          </clipPath>
        </defs>
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="var(--color-bg)"
          filter="url(#ink-bleed-transition)"
          clipPath="url(#ink-clip)"
        />
      </svg>
    </motion.div>
  )
}
