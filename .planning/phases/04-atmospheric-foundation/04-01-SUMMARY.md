---
phase: 04-atmospheric-foundation
plan: 01
subsystem: ui
tags: [motion, css, film-grain, vignette, animation, framer-motion, next.js]

# Dependency graph
requires:
  - phase: 03-public-site
    provides: IntroAnimation component and globals.css baseline styles
provides:
  - IntroAnimation without AnimatePresence (structural prerequisite for Phases 5-7)
  - Film grain noise texture overlay across all pages (body::after, feTurbulence)
  - Vignette edge-darkening overlay across all pages (body::before, radial-gradient)
  - prefers-reduced-motion guard on grain animation
affects:
  - 04-atmospheric-foundation (remaining plans)
  - 05-card-interactions
  - 06-mobile-tilt
  - 07-page-transitions

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useState-gated conditional render (three explicit branches: null / intro / done)"
    - "CSS pseudo-element overlays with pointer-events:none for non-blocking global effects"
    - "SVG feTurbulence film grain via data-URI background-image"
    - "isolation:isolate on masonry-grid to contain GPU compositing from high-z-index overlays"

key-files:
  created: []
  modified:
    - src/components/frontend/IntroAnimation.tsx
    - src/app/globals.css

key-decisions:
  - "AnimatePresence removed from IntroAnimation now; exit fade-out will be restored in Phase 7 via layout-level AnimatePresence — documented as known limitation in code comment"
  - "Grain opacity set to 0.035 (not higher) to avoid dirty-noise appearance on OLED displays"
  - "z-index 9998/9999 for vignette/grain — both with pointer-events:none so no interaction is blocked"
  - "isolation:isolate on .masonry-grid prevents implicit compositing explosion from the grain overlay"

patterns-established:
  - "Global CSS overlay pattern: position:fixed + inset:0 + pointer-events:none + high z-index"
  - "Reduced-motion guard pattern: @media (prefers-reduced-motion: reduce) disables animation and reduces opacity"

requirements-completed: [INTR-03, ATMO-01, ATMO-02]

# Metrics
duration: 3min
completed: 2026-03-14
---

# Phase 4 Plan 01: Atmospheric Foundation Summary

**AnimatePresence removed from IntroAnimation (Phase 7 prerequisite) and persistent film grain + radial vignette CSS overlays added to transform flat-black into textured graphite depth**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-14T15:36:00Z
- **Completed:** 2026-03-14T15:39:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- IntroAnimation refactored to three explicit render branches (null/intro/done) — no AnimatePresence import or wrapper
- All existing behaviors preserved: localStorage memory, prefers-reduced-motion bypass, skip button, 3500ms auto-complete timer
- Film grain noise texture added via SVG feTurbulence data-URI on body::after (opacity 0.035, z-index 9999)
- Vignette overlay added via radial-gradient on body::before (z-index 9998, 45% edge darkening)
- Both overlays have pointer-events:none — no interactive elements are blocked
- Grain animation disabled and opacity halved when prefers-reduced-motion is enabled
- isolation:isolate added to .masonry-grid to contain GPU compositing

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor IntroAnimation to remove AnimatePresence** - `2b198b2` (refactor)
2. **Task 2: Add film grain and vignette CSS overlays** - `6dc1e9a` (feat)

## Files Created/Modified
- `src/components/frontend/IntroAnimation.tsx` - Refactored to useState-gated render branches, AnimatePresence removed
- `src/app/globals.css` - Added body::before vignette, body::after grain, @keyframes grain, prefers-reduced-motion guard, isolation:isolate on .masonry-grid

## Decisions Made
- AnimatePresence exit fade-out will not fire in Phase 4 — documented as a known limitation in the component. Phase 7 restores it via layout-level AnimatePresence.
- Grain opacity 0.035 (capped at 0.05 max) to avoid dirty-noise appearance on OLED screens.
- Grain z-index 9999 / vignette z-index 9998 — grain sits above vignette but both below any site modals/dialogs.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- AnimatePresence is fully removed from IntroAnimation — safe to add outer AnimatePresence wrappers in Phases 5-7
- Film grain and vignette are live on all pages as the atmospheric layer everything else builds on
- No blockers for Phase 4 Plan 02

---
*Phase: 04-atmospheric-foundation*
*Completed: 2026-03-14*
