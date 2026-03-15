---
phase: 07-cinematic-layer
plan: "01"
subsystem: frontend-transitions
tags: [page-transition, ink-bleed, svg-filter, motion, template]
dependency_graph:
  requires: [phase-06-signature-effects]
  provides: [ink-bleed-page-transition, template-remount-wrapper]
  affects: [src/app/(frontend)/template.tsx, src/components/frontend/InkTransition.tsx]
tech_stack:
  added: []
  patterns: [template.tsx remount, entrance-only motion, SVG feTurbulence displacement filter, double-guard sessionStorage+localStorage]
key_files:
  created:
    - src/app/(frontend)/template.tsx
    - src/components/frontend/InkTransition.tsx
  modified: []
decisions:
  - "SVG clipPath + feTurbulence/feDisplacementMap/feGaussianBlur for organic ink-bleed edge (consistent with IntroAnimation filter)"
  - "Double guard: localStorage 'intro-seen' prevents intro conflict; sessionStorage 'navigated' prevents first-load trigger"
  - "template.tsx not layout.tsx — templates receive unique key on every navigation, layouts persist (no remount)"
  - "No AnimatePresence — entrance-only pattern per confirmed App Router production bug #42658"
  - "z-50 overlay with pointer-events: none — sits above NavBar (z-40) during animation but never blocks clicks"
metrics:
  duration: "~8 minutes"
  completed: "2026-03-15"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 7 Plan 01: Ink-Bleed Page Transition Summary

**One-liner:** Entrance-only SVG ink-bleed transition via template.tsx remount with double-guarded InkTransition overlay using feTurbulence displacement filter.

## What Was Built

Two files wired together to create cinematic route transitions:

1. **`src/components/frontend/InkTransition.tsx`** — Client component rendering a `fixed inset-0 z-50 pointer-events-none` overlay with an SVG ink-bleed animation. On mount, checks two guards before animating: (1) `localStorage 'intro-seen'` to prevent conflict with IntroAnimation on first-ever visit, (2) `sessionStorage 'navigated'` to skip the first page load (template.tsx remounts on initial render too, not only on navigation). When guards pass, a SVG rect with `scaleX` clipPath sweep (0.5s) reveals the `--color-bg` background over the incoming page, then the entire overlay fades out (0.3s, delayed 0.5s). `useReducedMotion()` returns null entirely.

2. **`src/app/(frontend)/template.tsx`** — Minimal `'use client'` wrapper that renders `<InkTransition />` above `{children}`. Next.js assigns a unique key to template.tsx on every navigation, causing a full remount — this is what triggers InkTransition's `initial`/`animate` props on each route change without any additional router listener or AnimatePresence.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create InkTransition component with ink-bleed SVG overlay | 327973e | src/components/frontend/InkTransition.tsx |
| 2 | Create template.tsx to wire InkTransition on every route change | b569b7f | src/app/(frontend)/template.tsx |

## Verification

- `npx tsc --noEmit` — passed cleanly after Task 1
- `npx next build` — passed cleanly after Task 2; all routes build successfully

## Deviations from Plan

None — plan executed exactly as written. The SVG clipPath + feTurbulence approach from the plan was implemented directly; no fallback to the CSS clip-path alternative was needed.

## Key Decisions

1. **SVG approach over CSS clip-path fallback:** Implemented the primary SVG approach with `feTurbulence` + `feDisplacementMap` + `feGaussianBlur` for organic ink edge. The filter reuses identical parameters to IntroAnimation's filter (`baseFrequency="0.04 0.08"`, `numOctaves=3`, `seed=5`) for visual brand consistency.

2. **Double guard pattern:** The `localStorage 'intro-seen'` check handles first-ever visitors where IntroAnimation is playing simultaneously. The `sessionStorage 'navigated'` flag handles subsequent same-session page loads where the template remounts without actual navigation occurring. Together they ensure the ink-bleed fires exactly on inter-page navigation — never before.

3. **template.tsx confirmed as correct vehicle:** `layout.tsx` persists across routes (no remount). `template.tsx` receives Next.js unique key on every segment change and fully remounts — this is the production-correct entrance-only transition pattern for App Router without AnimatePresence.

4. **No AnimatePresence:** Exit animations silently break in App Router production (vercel/next.js #42658, #59349). Entrance-only via `initial`/`animate` on a remounting template is the only reliable pattern.

## Self-Check: PASSED

Files verified:
- FOUND: src/components/frontend/InkTransition.tsx
- FOUND: src/app/(frontend)/template.tsx

Commits verified:
- FOUND: 327973e — feat(07-01): create InkTransition ink-bleed SVG overlay component
- FOUND: b569b7f — feat(07-01): create template.tsx to wire InkTransition on every route change
