---
phase: 07-cinematic-layer
plan: 02
subsystem: ui
tags: [css-animation, performance, particles, server-component, compositor, prefers-reduced-motion]

# Dependency graph
requires:
  - phase: 07-cinematic-layer
    provides: Frontend layout.tsx with NavBar and MotionProvider already wired
  - phase: 04-atmospheric-foundation
    provides: globals.css with grain/vignette patterns and @theme CSS variables
provides:
  - AmbientParticles server component rendering 6 CSS-animated ink specks
  - particle-drift @keyframes inside prefers-reduced-motion: no-preference guard
  - Persistent cross-route particle layer in frontend layout
  - PERF-05 bundle size verification (server component = zero client JS added)
affects: [future-ui-enhancements, performance-audits]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS-only animation for decorative elements — no JS animation loop, zero bundle cost"
    - "Server component for purely decorative static HTML — no 'use client' directive"
    - "CSS custom properties per element for varied animation parameters without JS"
    - "will-change: transform, opacity on compositor-only animations (under 10-element ceiling)"
    - "@media (prefers-reduced-motion: no-preference) wrapping entire decorative animation block"

key-files:
  created:
    - src/components/frontend/AmbientParticles.tsx
  modified:
    - src/app/globals.css
    - src/app/(frontend)/layout.tsx

key-decisions:
  - "AmbientParticles is a server component (no 'use client') — 6 static spans with CSS custom properties ship zero client JS"
  - "Entire .particle class and @keyframes block wrapped in @media (prefers-reduced-motion: no-preference) — particles are completely absent for users who prefer reduced motion (not just paused)"
  - "6 particles with will-change: transform, opacity — conservative count, well under 10-element compositor layer ceiling"
  - "Particles placed in layout.tsx (not template.tsx) — ensures persistence across route navigations without restart/flash"
  - "PERF-05 verified: build output shows server component adds zero client JS; all route First Load JS unchanged from Phase 6 baseline"

patterns-established:
  - "Decorative CSS-only animation pattern: wrap entire block in prefers-reduced-motion: no-preference guard"
  - "Per-element CSS custom properties pattern: use inline style with CSS vars for varied animation parameters"

requirements-completed: [PERF-05]

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 07 Plan 02: Ambient Ink Particles Summary

**6 CSS-animated ink particle specks drift across every page via a zero-JS server component with full prefers-reduced-motion support and confirmed PERF-05 bundle compliance**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T11:51:44Z
- **Completed:** 2026-03-15T11:55:17Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created AmbientParticles.tsx as a server component (no client JS) rendering 6 particle spans with staggered CSS custom properties for varied size (2-4px), opacity (0.08-0.12), duration (19-26s), and delay (0-12s)
- Added .particle class and @keyframes particle-drift to globals.css inside @media (prefers-reduced-motion: no-preference) guard — particles are completely invisible for reduced-motion users, not just paused
- Wired AmbientParticles into frontend layout.tsx (not template.tsx) so particles persist across all route navigations without restarting
- Verified PERF-05: build output confirms server component adds zero client JavaScript; First Load JS for all routes unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add particle CSS keyframes and create AmbientParticles component** - `4d77b3a` (feat)
2. **Task 2: Wire AmbientParticles into layout and verify v1.1 bundle size** - `d4bcf44` (feat)

## Files Created/Modified

- `src/components/frontend/AmbientParticles.tsx` - Server component rendering 6 particle spans with CSS custom properties for drift parameters
- `src/app/globals.css` - Added .particle class and @keyframes particle-drift inside prefers-reduced-motion: no-preference guard
- `src/app/(frontend)/layout.tsx` - Added AmbientParticles import and render after NavBar, before MotionProvider

## Decisions Made

- **AmbientParticles as server component:** No interactivity, no hooks, no event handlers — purely static HTML with CSS. Server rendering means zero client JS shipped for this component. This fully satisfies the "CSS-only animation, zero bundle cost" requirement in PERF-05.
- **Entire animation block inside prefers-reduced-motion: no-preference:** More robust than just removing the animation — the .particle class itself doesn't exist for reduced-motion users, so no invisible elements pollute the DOM.
- **Layout vs template placement:** Particles must not restart on every route change. Placing in layout.tsx (which persists) rather than template.tsx (which re-mounts per route) ensures continuous, uninterrupted drift across navigations.
- **6 particles, will-change on both transform and opacity:** Conservative count (under 10-element ceiling for safe compositor promotion). Each particle gets its own GPU compositor layer, keeping scroll and interactions completely unaffected.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 7 atmospheric effects are now implemented: InkTransition (07-01) and AmbientParticles (07-02)
- Phase 7 and the v1.1 Dark & Dangerous milestone are complete
- The site now has: film grain, vignette, ink page transitions, staggered entrance animations, morphing ink blob dividers, 3D tilt gallery cards, and ambient particle drift
- No blockers for deployment or further phases

## Self-Check: PASSED

- `src/components/frontend/AmbientParticles.tsx` — FOUND
- `src/app/globals.css` — contains `.particle` and `particle-drift` — FOUND
- `src/app/(frontend)/layout.tsx` — contains `AmbientParticles` — FOUND
- Commit `4d77b3a` — FOUND
- Commit `d4bcf44` — FOUND

---
*Phase: 07-cinematic-layer*
*Completed: 2026-03-15*
