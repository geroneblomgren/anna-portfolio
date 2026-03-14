---
phase: 03-public-site
plan: 02
subsystem: ui
tags: [motion, animation, lightbox, yet-another-react-lightbox, next-image, svg]

# Dependency graph
requires:
  - phase: 03-01
    provides: GalleryGrid with ArtPiece[], masonry layout, tag filtering
provides:
  - IntroAnimation component with ink-bleed SVG strokes, text reveal, skip, localStorage, reduced-motion
  - GalleryLightbox component with YARL, Captions plugin, custom next/image render, blur placeholders
  - GalleryGrid updated with lightbox state and onClick wiring
  - page.tsx wrapped in IntroAnimation
affects: [03-03, 03-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AnimatePresence mode=wait for intro→gallery crossfade
    - pathLength animation on SVG motion.path for ink-stroke effect
    - YARL render.slide override with next/image for blur placeholder support
    - Lightbox receives sorted (filtered) array matching grid order for consistent navigation

key-files:
  created:
    - src/components/frontend/IntroAnimation.tsx
    - src/components/frontend/GalleryLightbox.tsx
  modified:
    - src/components/frontend/GalleryGrid.tsx
    - src/app/(frontend)/page.tsx

key-decisions:
  - "IntroAnimation uses showIntro=false default to avoid SSR hydration mismatch; useEffect sets it on client"
  - "Auto-complete timer at 3.5s matches total animation duration (0s + 0.9s delay + 1.3s duration + fade buffer)"
  - "YARL styles.root uses SlotCSSProperties type — removing React.CSSProperties cast fixed TS error"
  - "GalleryLightbox receives sorted array (post-filter + post-sort) so lightbox index matches grid thumbnail position"

patterns-established:
  - "IntroAnimation pattern: SSR-safe boolean default false, useEffect checks localStorage + matchMedia on mount"
  - "YARL render.slide: always use next/image fill with sizes=100vw and objectFit=contain for lightbox"

requirements-completed: [GAL-01, GAL-03, PRES-01, PRES-02]

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 3 Plan 02: Intro Animation and Lightbox Summary

**Ink-bleed SVG intro animation with skip/localStorage/reduced-motion and YARL full-screen lightbox with Captions, keyboard nav, and custom next/image render**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T02:10:58Z
- **Completed:** 2026-03-13T02:18:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- IntroAnimation renders 4 organic SVG ink strokes with staggered pathLength animation, followed by "Anna Blomgren" / "Artist & Illustrator" text reveal; auto-completes at 3.5s
- Skip button dismisses intro immediately; localStorage flag prevents replay on return visits; prefers-reduced-motion skips entirely
- GalleryLightbox wraps YARL with Captions plugin — title, medium, description, and tags displayed per piece
- Custom render.slide uses next/image with blur placeholder support for smooth loading of 2400px lightbox images
- GalleryGrid updated: each thumbnail opens lightbox at the correct filtered+sorted index

## Task Commits

Each task was committed atomically:

1. **Task 1: Ink-bleed intro animation** - `c6a0045` (feat)
2. **Task 2: Lightbox and gallery wiring** - `f858225` (feat)

## Files Created/Modified
- `src/components/frontend/IntroAnimation.tsx` - Ink-bleed SVG animation with AnimatePresence, skip, localStorage, reduced-motion
- `src/components/frontend/GalleryLightbox.tsx` - YARL lightbox with Captions, custom next/image render, dark backdrop
- `src/components/frontend/GalleryGrid.tsx` - Added lightboxOpen/lightboxIndex state, onClick wiring, GalleryLightbox render
- `src/app/(frontend)/page.tsx` - Wrapped GalleryGrid in IntroAnimation

## Decisions Made
- IntroAnimation defaults `showIntro` to `false` (not `true`) to prevent SSR hydration mismatch — useEffect detects client state on mount
- The `styles.root` YARL prop expects `SlotCSSProperties` (YARL's own type with `--yarl__*` index signature), not `React.CSSProperties` — removed the cast to fix TS error
- GalleryLightbox receives the `sorted` array (same filtered+sorted array the grid renders) so lightbox index always matches the visible thumbnail

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed YARL SlotCSSProperties TypeScript error**
- **Found during:** Task 2 (GalleryLightbox creation)
- **Issue:** Casting `--yarl__color_backdrop` object to `React.CSSProperties` caused TS2322 — YARL uses `SlotCSSProperties` with `--yarl__*` index signature
- **Fix:** Removed `as React.CSSProperties` cast; YARL correctly infers the type from the key
- **Files modified:** src/components/frontend/GalleryLightbox.tsx
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** f858225 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug fix)
**Impact on plan:** Minor TypeScript type correction. No behavior change, no scope creep.

## Issues Encountered
None beyond the TypeScript type fix above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Intro animation and lightbox are fully functional and TypeScript-clean
- Build passes: `/` route is 56.5 kB with lightbox bundle included
- Plan 03-03 (contact form / about page) can proceed immediately
- Plan 03-04 (deployment / QR code) can proceed after 03-03

## Self-Check: PASSED

All created files verified on disk. Both task commits confirmed in git log.

---
*Phase: 03-public-site*
*Completed: 2026-03-13*
