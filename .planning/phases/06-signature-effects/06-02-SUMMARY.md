---
phase: 06-signature-effects
plan: 02
subsystem: content-page-animations
tags: [motion, stagger, svg-morph, ink-blob, reduced-motion, server-component]
dependency_graph:
  requires: [06-01]
  provides: [PageStagger, PageStaggerItem, InkBlob]
  affects: [src/app/(frontend)/about/page.tsx, src/app/(frontend)/contact/page.tsx]
tech_stack:
  added: []
  patterns: [staggerChildren with animate="visible" for mount-time stagger, SVG path morphing with identical command structure, useReducedMotion explicit guard for d-attribute animation]
key_files:
  created:
    - src/components/frontend/PageStagger.tsx
    - src/components/frontend/InkBlob.tsx
  modified:
    - src/app/(frontend)/about/page.tsx
    - src/app/(frontend)/contact/page.tsx
decisions:
  - "animate='visible' (not whileInView) for About/Contact stagger — these are single-screen pages where content should stagger immediately on arrival, not triggered by scroll"
  - "InkBlob uses explicit useReducedMotion guard (renders static <path> instead of <motion.path>) — MotionConfig reducedMotion='user' may not cover d-attribute morphing per research flag"
  - "InkBlob placed in PageStaggerItem so it fades in with the sequence rather than appearing instantly"
  - "BLOB_PATHS all use identical M + 4C + Z structure — mismatched path command counts would cause snapping instead of smooth morphing"
metrics:
  duration: 4 minutes
  completed_date: "2026-03-15"
  tasks_completed: 2
  files_modified: 4
---

# Phase 06 Plan 02: Staggered Entrance Animations and Morphing Ink-Blob Dividers Summary

Staggered entrance animations on About and Contact pages via reusable PageStagger/PageStaggerItem client wrappers, with morphing SVG ink-stain blob dividers between sections — server pages unchanged, purely decorative blobs aria-hidden with pointer-events none.

## What Was Built

### PageStagger and PageStaggerItem

`src/components/frontend/PageStagger.tsx` — `"use client"` Framer Motion container with `staggerChildren: 0.12` and `delayChildren: 0.05`. Child items animate from `{ opacity: 0, y: 20 }` to `{ opacity: 1, y: 0 }` over 0.5s with easeOut. Uses `animate="visible"` (fires on mount) rather than `whileInView` — About and Contact are not scroll-heavy pages where in-view triggering makes sense.

### InkBlob

`src/components/frontend/InkBlob.tsx` — `"use client"` SVG component with 3 pre-generated blob paths sharing identical M+4C+Z structure (critical for smooth d-attribute morphing). Animates through paths over 10s in an infinite loop. `useReducedMotion()` explicit guard: reduced-motion users get a static `<path>` element; others get `<motion.path>` with the full morph. `aria-hidden="true"` and `pointer-events: none` ensure purely decorative semantics.

### About Page

`src/app/(frontend)/about/page.tsx` — remains a Server Component. All 5 conditional sections (hero photo, bio text, artist statement, contact info, social links) wrapped in `<PageStagger>` / `<PageStaggerItem>`. InkBlob dividers inserted between: bio↔statement (w-32 opacity-40) and before contact section (w-28 opacity-30). All existing classNames preserved exactly.

### Contact Page

`src/app/(frontend)/contact/page.tsx` — remains a Server Component. Heading, subtitle+form, and social links each become a `<PageStaggerItem>`. InkBlob (w-24 opacity-30) inserted before the social links section. All existing content preserved.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/components/frontend/PageStagger.tsx | FOUND |
| src/components/frontend/InkBlob.tsx | FOUND |
| src/app/(frontend)/about/page.tsx | FOUND |
| src/app/(frontend)/contact/page.tsx | FOUND |
| Commit 1410ab5 (Task 1) | FOUND |
| Commit b698c21 (Task 2) | FOUND |
| Build passes cleanly | PASSED |
