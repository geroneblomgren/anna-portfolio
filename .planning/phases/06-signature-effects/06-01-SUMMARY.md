---
phase: 06-signature-effects
plan: 01
subsystem: gallery-interactions
tags: [motion, 3d-tilt, lightbox, reduced-motion, framer-motion]
dependency_graph:
  requires: [05-gallery-interactions]
  provides: [MotionProvider, TiltCard, lightbox-darkroom-CSS]
  affects: [src/components/frontend/GalleryGrid.tsx, src/app/(frontend)/layout.tsx, src/app/globals.css]
tech_stack:
  added: []
  patterns: [useMotionValue + useTransform for tilt, MotionConfig reducedMotion="user", CSS pseudo-elements for lightbox atmosphere]
key_files:
  created:
    - src/components/frontend/MotionProvider.tsx
  modified:
    - src/components/frontend/GalleryGrid.tsx
    - src/app/(frontend)/layout.tsx
    - src/app/globals.css
decisions:
  - "Inline Viewport type — motion/react does not export a Viewport type; defined locally as { once?: boolean; margin?: string; amount?: number | 'some' | 'all' }"
  - "TiltCard props use Target/TargetAndTransition/Transition from motion/react — these are the correct exported types for initial/whileInView/transition"
  - "useReducedMotion guards imperative animate() calls in TiltCard — supplements MotionConfig for cases where animate() bypasses the declarative system"
metrics:
  duration: 7 minutes
  completed_date: "2026-03-15"
  tasks_completed: 2
  files_modified: 4
---

# Phase 06 Plan 01: Signature Effects — Motion Provider and 3D Tilt Summary

MotionProvider with `reducedMotion="user"` wrapping all frontend children, cursor-tracking 3D tilt on gallery cards (desktop only), and darkroom grain + vignette atmosphere on the YARL lightbox backdrop.

## What Was Built

### MotionProvider

`src/components/frontend/MotionProvider.tsx` — thin `"use client"` wrapper around `<MotionConfig reducedMotion="user">`. This single wrapper ensures all transform-based Motion animations across the entire frontend automatically respect the OS `prefers-reduced-motion` setting.

`src/app/(frontend)/layout.tsx` — `MotionProvider` wraps `<main>` to provide the client boundary above all animated children. NavBar stays outside since it has no Phase 6 animations.

### 3D Tilt Parallax on Gallery Cards

`src/components/frontend/GalleryGrid.tsx` now contains:

- `useIsHoverDevice()` — SSR-safe hook; initial state `false` (renders touch path), upgrades on client hydration via `window.matchMedia('(hover: hover) and (pointer: fine)')`.
- `TiltCard` component — uses `useMotionValue` + `useTransform` for cursor-tracking 3D tilt. Uses `animate()` imperatively (duration 0) to follow cursor position without React re-renders. Springs back to flat on mouse leave (stiffness 300, damping 30). `useReducedMotion()` guards the `handleMouseMove` handler.
- Conditional wrapper: `const CardWrapper = isHoverDevice ? TiltCard : motion.div`. Desktop gets TiltCard (no `whileHover` scale). Touch devices get `motion.div` with `whileHover: { scale: 1.025 }` (Phase 5 compound hover preserved).
- Scroll-reveal props (`initial`, `whileInView`, `viewport`, `transition`) live on the same element as tilt — no nested motion.divs.

### Lightbox Darkroom Atmosphere

`src/app/globals.css` additions:

- `.yarl__container::before` — radial vignette from transparent center to `rgba(0,0,0,0.6)` at edges. z-index 1, `pointer-events: none`.
- `.yarl__container::after` — SVG fractalNoise grain at opacity 0.045 with `grain` animation (reuses existing `@keyframes grain`). z-index 1, `pointer-events: none`. Reduced to `animation: none; opacity: 0.02` under `prefers-reduced-motion`.
- `.masonry-grid_column { perspective: 1000px }` inside `@media (hover: hover) and (pointer: fine)` — enables CSS 3D depth for TiltCard transforms.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type errors on TiltCard props**
- **Found during:** Task 2 — first build attempt
- **Issue:** `TiltCardProps` used `object` for `initial`, `whileInView`, `viewport`, `transition`. TypeScript rejected `object` as not assignable to motion/react's `TargetAndTransition` and related types.
- **Fix 1:** Changed `initial` to `Target | boolean`, `whileInView` to `TargetAndTransition`, `transition` to `Transition` — all exported by `motion/react`. Changed `viewport` to inline type `{ once?: boolean; margin?: string; amount?: number | 'some' | 'all' }` since `Viewport` is not an exported member of `motion/react`.
- **Files modified:** `src/components/frontend/GalleryGrid.tsx`
- **Commit:** `be9e19f`

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/components/frontend/MotionProvider.tsx | FOUND |
| src/components/frontend/GalleryGrid.tsx | FOUND |
| src/app/(frontend)/layout.tsx | FOUND |
| src/app/globals.css | FOUND |
| Commit 57cf3aa (Task 1) | FOUND |
| Commit be9e19f (Task 2) | FOUND |
