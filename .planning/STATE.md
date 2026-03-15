---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Dark & Dangerous
status: unknown
last_updated: "2026-03-15T12:04:33.261Z"
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 8
  completed_plans: 8
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** When someone scans Anna's QR code, the site makes an immediate, powerful visual impression — versatility, personal voice, dead serious about this career.
**Current focus:** v1.1 Dark & Dangerous — COMPLETE

## Current Position

Phase: 7 of 7 (Cinematic Layer)
Plan: 2 of 2 in current phase (Plan 02 complete — v1.1 MILESTONE COMPLETE)
Status: Complete
Last activity: 2026-03-15 — Plan 07-02 complete: ambient CSS ink particles on all pages, PERF-05 verified

Progress: [██████████] 100% (v1.0 phases 1-3 complete; v1.1 Phase 4 Plans 01-02 verified; Phase 5 Plans 01-02 complete; Phase 6 Plans 01-02 complete; Phase 7 Plans 01-02 complete)

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 9
- Average duration: ~40 min
- Total execution time: ~6.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2 | ~60 min | ~30 min |
| 2. Admin + Image Pipeline | 3 | ~90 min | ~30 min |
| 3. Public Site | 4 | ~210 min | ~52 min |

*Updated after each plan completion*
| Phase 04-atmospheric-foundation P01 | 3 | 2 tasks | 2 files |
| Phase 04-atmospheric-foundation P02 | 8 | 1 tasks | 4 files |
| Phase 05-gallery-interactions P01 | 7 | 2 tasks | 2 files |
| Phase 05-gallery-interactions P02 | 7 | 2 tasks | 1 files |
| Phase 06-signature-effects P01 | 7 | 2 tasks | 4 files |
| Phase 06-signature-effects P02 | 4 | 2 tasks | 4 files |
| Phase 07-cinematic-layer P01 | 8 | 2 tasks | 2 files |
| Phase 07-cinematic-layer P02 | 3 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Full decision log in PROJECT.md Key Decisions table (10 decisions, all Good).
Recent decisions affecting v1.1:

- [v1.1 research]: lenis is the only new npm dep — everything else uses existing Motion + CSS SVG filters
- [v1.1 research]: IntroAnimation AnimatePresence refactor is a hard prerequisite — must occur in Phase 4 before any outer wrappers are added anywhere in the tree
- [v1.1 research]: Entrance-only page transitions — exit animations silently break in App Router production (confirmed Next.js #42658, #59349)
- [v1.1 research]: 3D tilt fallback — if tilt fails mobile performance QA in Phase 6, reinstate compound hover from Phase 5 and defer tilt
- [Phase 04-atmospheric-foundation]: AnimatePresence removed from IntroAnimation in Phase 4; exit fade-out restored in Phase 7 via layout-level AnimatePresence
- [Phase 04-atmospheric-foundation]: Film grain opacity 0.035 (hard cap 0.05) to avoid dirty-noise on OLED displays
- [Phase 04-atmospheric-foundation]: tracking-brand-wide (0.12em) for headings; tracking-brand-widest (0.2em) for uppercase subtitle labels
- [Phase 04-atmospheric-foundation]: --color-bg #121212 not #0a0a0a — near-pure black hides grain/vignette; #121212 makes both visible without losing dark mood
- [Phase 05-gallery-interactions]: ease: 'easeOut' as const required in letterVariants — TypeScript motion/react types need explicit const assertion on string literals
- [Phase 05-gallery-interactions]: Auto-complete timer (3500ms) unchanged — total letter stagger duration (~2.7s) fits within existing window
- [Phase 06-signature-effects]: motion/react does not export a Viewport type — defined inline as { once?: boolean; margin?: string; amount?: number | 'some' | 'all' }
- [Phase 06-signature-effects]: useReducedMotion() guards imperative animate() calls in TiltCard — MotionConfig alone doesn't suppress imperative animations
- [Phase 06-signature-effects]: animate='visible' (not whileInView) for About/Contact stagger — single-screen pages stagger immediately on arrival
- [Phase 06-signature-effects]: InkBlob uses explicit useReducedMotion guard — MotionConfig may not cover d-attribute morphing
- [Phase 06-signature-effects]: BLOB_PATHS all use identical M+4C+Z structure — mismatched path commands cause snapping not smooth morphing
- [Phase 07-cinematic-layer]: template.tsx remounts on every navigation — correct vehicle for entrance-only transitions; layout.tsx persists (no remount)
- [Phase 07-cinematic-layer]: Double guard in InkTransition — localStorage 'intro-seen' prevents IntroAnimation conflict; sessionStorage 'navigated' prevents first-load trigger
- [Phase 07-cinematic-layer]: No AnimatePresence in template.tsx — entrance-only pattern confirmed; exit animations silently break in App Router production (#42658)
- [Phase 07-cinematic-layer]: AmbientParticles is a server component (no 'use client') — 6 static spans with CSS custom properties ship zero client JS (PERF-05)
- [Phase 07-cinematic-layer]: Entire .particle block wrapped in @media (prefers-reduced-motion: no-preference) — particles completely absent (not just paused) for reduced-motion users
- [Phase 07-cinematic-layer]: Particles placed in layout.tsx (not template.tsx) — ensures persistence across route navigations without restart/flash

### Pending Todos

None.

### Blockers/Concerns

- [v1.0 debt, non-blocking]: Resend sender domain upgrade needed for production email delivery to non-account-owner addresses

## Session Continuity

Last session: 2026-03-15
Stopped at: Completed 07-02-PLAN.md — AmbientParticles component + PERF-05 verification, Phase 7 Plan 02 done, v1.1 milestone COMPLETE
Resume file: None
