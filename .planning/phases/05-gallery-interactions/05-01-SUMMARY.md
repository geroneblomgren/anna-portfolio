---
phase: 05-gallery-interactions
plan: 01
subsystem: ui
tags: [motion, framer-motion, animation, gallery, scroll-reveal, hover, css, performance]

# Dependency graph
requires:
  - phase: 04-atmospheric-foundation
    provides: gallery-card className context, globals.css z-index conventions (grain at 9999, vignette at 9998)
provides:
  - motion.div gallery cards with whileInView scroll-reveal stagger
  - compositor-safe hover shadow via ::after pseudo-element gated to hover-capable devices
  - gallery-card className bridging GalleryGrid.tsx to globals.css
affects: [06-tilt-parallax, 07-transitions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-card stagger via Math.min(idx, 12) * 0.07 delay — NOT staggerChildren (Masonry column structure incompatible)"
    - "viewport once:true on whileInView prevents GPU layer explosion for off-screen cards"
    - "@media (hover: hover) and (pointer: fine) gates all hover CSS to prevent touch flicker"
    - "Shadow via ::after opacity transition — compositor-thread only, avoids box-shadow repaint per frame"

key-files:
  created: []
  modified:
    - src/components/frontend/GalleryGrid.tsx
    - src/app/globals.css

key-decisions:
  - "Per-card delay cap at Math.min(idx, 12) prevents last card in large gallery having 1.4s+ entrance delay"
  - "whileHover gated by @media (hover: hover) in CSS — Motion itself also skips hover on touch, but CSS pseudo-element needs explicit media gate"
  - "z-index: 1 on shadow pseudo-element keeps it below grain/vignette overlays (9998/9999) while above card content"

patterns-established:
  - "gallery-card: className bridge between component and globals.css for compound effects"
  - "Hover CSS always in @media (hover: hover) and (pointer: fine) block for touch-safe portfolio"

requirements-completed: [GLRY-01, GLRY-02, PERF-03, PERF-04]

# Metrics
duration: 7min
completed: 2026-03-14
---

# Phase 5 Plan 01: Gallery Interactions Summary

**Scroll-reveal stagger via motion.div whileInView and compositor-safe hover depth (scale + shadow + gradient) on gallery cards, fully gated for touch devices**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-14T23:24:05Z
- **Completed:** 2026-03-14T23:31:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Gallery cards now fade-and-slide in with staggered timing as they enter the viewport (delay capped at 12 cards x 0.07s to prevent long waits)
- Compound hover effect: scale lift (1.025x) + shadow deepening (::after pseudo) + existing gradient overlay
- All hover effects gated behind `@media (hover: hover) and (pointer: fine)` — zero flicker on touch devices
- GPU layers managed safely: `viewport={{ once: true }}` tears down Intersection Observers after first reveal

## Task Commits

1. **Task 1: Scroll-reveal stagger on gallery cards** - `34c0ba2` (feat)
2. **Task 2: Compound hover effect with compositor-safe shadow** - `07c50d7` (feat)

## Files Created/Modified

- `src/components/frontend/GalleryGrid.tsx` - Added motion import, replaced div with motion.div, added whileInView/whileHover/viewport props and gallery-card className
- `src/app/globals.css` - Added gallery-card::after shadow pseudo-element block inside @media (hover: hover) and (pointer: fine)

## Decisions Made

- Per-card stagger delay capped at `Math.min(idx, 12) * 0.07` — prevents 1.4s+ entrance delay on last card in large galleries
- Shadow implemented as `::after` opacity transition rather than direct `box-shadow` animation — keeps shadow repaint off main thread
- `z-index: 1` on shadow pseudo-element chosen after cross-referencing existing z-index map (grain: 9999, vignette: 9998)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The first `next build` after initial `.next` cache cleanup returned a `next-font-manifest.json` error — a known Next.js App Router race condition with custom fonts on consecutive builds. The second build passed cleanly with "Compiled successfully" and all 7 static pages generated. Not related to plan changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Gallery cards have scroll-reveal and hover depth ready for Phase 6 3D tilt overlay
- If Phase 6 tilt fails mobile performance QA, the compound hover from this plan is already in place as fallback (per Phase 4 decision log)

---
*Phase: 05-gallery-interactions*
*Completed: 2026-03-14*

## Self-Check: PASSED

- src/components/frontend/GalleryGrid.tsx — FOUND
- src/app/globals.css — FOUND
- .planning/phases/05-gallery-interactions/05-01-SUMMARY.md — FOUND
- Commit 34c0ba2 — FOUND
- Commit 07c50d7 — FOUND
