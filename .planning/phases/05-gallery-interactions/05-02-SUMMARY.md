---
phase: 05-gallery-interactions
plan: "02"
subsystem: frontend/intro-animation
tags: [animation, svg, accessibility, motion, ink]
dependency_graph:
  requires: []
  provides: [INTR-01, INTR-02]
  affects: [src/components/frontend/IntroAnimation.tsx]
tech_stack:
  added: []
  patterns:
    - SVG filter chain (feTurbulence + feDisplacementMap + feGaussianBlur) for ink-bleed effect
    - Framer Motion staggerChildren variant pattern for letter-by-letter reveals
    - sr-only + aria-hidden accessibility split for animated text
key_files:
  created: []
  modified:
    - src/components/frontend/IntroAnimation.tsx
decisions:
  - "ease: 'easeOut' as const required in letterVariants — TypeScript motion/react types do not widen string literals to Easing without explicit const assertion"
  - "Auto-complete timer (3500ms) unchanged — total animation duration (1.5 + 13*0.06 + 0.08 = ~2.4s for name, ~2.7s for subtitle) fits comfortably within window"
metrics:
  duration: "~7 min"
  completed_date: "2026-03-14"
  tasks_completed: 2
  files_modified: 1
---

# Phase 05 Plan 02: Intro Animation Upgrade — Thick Ink Strokes + Letter Stagger Summary

**One-liner:** SVG ink-bleed filter (feTurbulence + feDisplacementMap + feGaussianBlur) on thickened strokes (5-12px) and Framer Motion staggerChildren letter-by-letter name reveal with sr-only accessibility.

## What Was Built

IntroAnimation.tsx received two upgrades that transform the intro from a clean vector animation into something that feels hand-made:

**Ink Stroke Overhaul (INTR-01):** A `<defs>` block with `filter#ink-bleed` was added inside the SVG. The filter chain runs fractal noise through a displacement map (scale=6) then a Gaussian blur (stdDeviation=1.2), creating organic, feathered stroke edges. The filter region is expanded (-10%/120%) to prevent displaced pixels from being silently clipped at the element bounding box. All 4 motion.path elements were updated: strokeWidth increased to 5/6/8/10px (from 1.5/2/2.5/3), `strokeLinecap="round"` added for hand-drawn rounded ends, and `filter="url(#ink-bleed)"` applied.

**Letter-by-Letter Name Reveal (INTR-02):** The block-fade `motion.h1` was replaced with a static `<h1>` container holding two children: a `<span className="sr-only">Anna Blomgren</span>` for screen readers, and an `aria-hidden="true" motion.span` orchestrator that maps each character to its own `motion.span` with `letterVariants`. The space character is rendered as `\u00A0` to preserve the word gap in inline-block spans. `delayChildren: 1.5` preserves the original timing — letters begin appearing after the SVG strokes finish drawing.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 — Ink strokes + filter | 87c76e0 | feat(05-02): thicken ink strokes with SVG ink-bleed filter (INTR-01) |
| 2 — Letter stagger reveal | f69165f | feat(05-02): letter-by-letter name reveal with accessibility (INTR-02) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript type error on ease string literal in letterVariants**
- **Found during:** Task 2 build verification
- **Issue:** `ease: 'easeOut'` in the transition object inside letterVariants caused TypeScript error: `Type 'string' is not assignable to type 'Easing | Easing[] | undefined'`. The motion/react type system does not auto-widen bare string literals in nested objects.
- **Fix:** Added `as const` assertion — `ease: 'easeOut' as const`
- **Files modified:** src/components/frontend/IntroAnimation.tsx
- **Commit:** f69165f (included in Task 2 commit)

## Verification Status

Manual steps required (visual verification):
1. `npx next build` — passed (zero TypeScript errors)
2. Visual checks (require browser): clear localStorage, verify thick ink strokes with feathered edges, verify letter-by-letter name reveal, verify subtitle overlaps mid-name reveal, verify skip button, verify localStorage memory, verify prefers-reduced-motion skip

## Self-Check: PASSED

- src/components/frontend/IntroAnimation.tsx — FOUND
- Commit 87c76e0 — FOUND
- Commit f69165f — FOUND
