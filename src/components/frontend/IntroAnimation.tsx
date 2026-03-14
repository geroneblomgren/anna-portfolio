'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

interface IntroAnimationProps {
  children: React.ReactNode
}

export function IntroAnimation({ children }: IntroAnimationProps) {
  const [showIntro, setShowIntro] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('intro-seen')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!seen && !reduced) {
      setShowIntro(true)
      // Auto-complete after animation finishes (~3.5s)
      const timer = setTimeout(() => {
        skip()
      }, 3500)
      return () => clearTimeout(timer)
    } else {
      setDone(true)
    }
  }, [])

  function skip() {
    localStorage.setItem('intro-seen', '1')
    setShowIntro(false)
    setDone(true)
  }

  // Phase 4 known limitation: without an AnimatePresence owner, the exit={{ opacity: 0 }}
  // prop on the intro motion.div will not fire — the intro disappears instantly when
  // showIntro flips to false. The fade-out transition will be restored in Phase 7 when
  // layout-level AnimatePresence is added.

  // Hydration state: return null until client-side useEffect has run
  if (!showIntro && !done) {
    return null
  }

  // Intro state: full-screen overlay with SVG strokes, text reveal, and skip button
  if (showIntro) {
    return (
      <motion.div
        className="fixed inset-0 bg-bg z-50 flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* SVG ink stroke animation */}
        <svg
          viewBox="0 0 800 400"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Stroke 1 — sweeping diagonal */}
          <motion.path
            d="M -50 300 Q 200 100 500 250 T 900 150"
            stroke="#c8c8cc"
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0 }}
          />
          {/* Stroke 2 — flowing arc */}
          <motion.path
            d="M 100 50 C 250 -30 550 200 700 80 S 900 300 1000 200"
            stroke="#c8c8cc"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
          />
          {/* Stroke 3 — lower sweep */}
          <motion.path
            d="M -20 380 Q 150 280 400 320 C 550 350 650 200 850 300"
            stroke="#c8c8cc"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.6 }}
          />
          {/* Stroke 4 — thin crossing line */}
          <motion.path
            d="M 200 400 C 300 200 500 350 600 150 Q 700 50 900 180"
            stroke="#c8c8cc"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.35 }}
            transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.9 }}
          />
        </svg>

        {/* Text reveal */}
        <div className="relative z-10 text-center">
          <motion.h1
            className="font-heading text-text-heading text-5xl md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
          >
            Anna Blomgren
          </motion.h1>
          <motion.p
            className="font-heading text-accent text-xl italic mt-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.0 }}
          >
            Artist &amp; Illustrator
          </motion.p>
        </div>

        {/* Skip button */}
        <button
          onClick={skip}
          className="fixed bottom-6 right-6 text-text-muted text-sm font-body hover:text-accent transition-colors cursor-pointer z-50"
        >
          Skip
        </button>
      </motion.div>
    )
  }

  // Done state: children with fade-in
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
