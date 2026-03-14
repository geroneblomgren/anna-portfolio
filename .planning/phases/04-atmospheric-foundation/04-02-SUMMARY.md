---
phase: 04-atmospheric-foundation
plan: 02
subsystem: ui
tags: [tailwind, css-tokens, typography, bodoni-moda, letter-spacing]

# Dependency graph
requires:
  - phase: 04-atmospheric-foundation
    provides: globals.css @theme block with font tokens and film grain/vignette overlays from Plan 01

provides:
  - --tracking-brand-tight/wide/widest CSS custom properties in @theme
  - Commanding typography on IntroAnimation (h1 + subtitle)
  - Commanding typography on contact page h1
  - Commanding typography on about page h2 elements (direct and RichText arbitrary variants)

affects:
  - 04-atmospheric-foundation (Plan 03+)
  - 05-typography-polish

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS @theme tracking tokens consumed via Tailwind tracking-brand-* utility classes"
    - "Arbitrary variant chaining [&_h2]: for RichText container heading styling"
    - "Strategic italic: italic only on secondary/subtitle lines, never primary headings"
    - "uppercase + tracking-brand-widest for spaced-out label effect on subtitle text"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/components/frontend/IntroAnimation.tsx
    - src/app/(frontend)/about/page.tsx
    - src/app/(frontend)/contact/page.tsx

key-decisions:
  - "tracking-brand-wide (0.12em) applied to all primary headings; tracking-brand-widest (0.2em) reserved for uppercase subtitle label"
  - "IntroAnimation subtitle changed to uppercase + tracking-brand-widest — spaced-out label effect, not italic heading"
  - "RichText [&_h2]: arbitrary variant chain kept in single className string — no component wrapping needed"
  - "--color-bg lightened from #0a0a0a to #121212 — near-pure black hid grain/vignette overlays; #121212 makes both visible without losing dark mood"

patterns-established:
  - "tracking-brand-* tokens: use tracking-brand-wide for headings, tracking-brand-widest for uppercase labels, tracking-brand-tight for tight display cases"
  - "RichText arbitrary variant pattern: [&_h2]:tracking-brand-wide alongside [&_h2]:font-heading for consistent heading treatment"

requirements-completed:
  - ATMO-03

# Metrics
duration: 8min
completed: 2026-03-14
---

# Phase 4 Plan 02: Brand Typography Tokens Summary

**Bodoni Moda headings upgraded to commanding scale with @theme tracking tokens — 0.12em wide-tracking h1/h2, uppercase+0.2em subtitle, and dramatic size bumps across IntroAnimation, contact, and about pages**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-14T18:37:44Z
- **Completed:** 2026-03-14T18:45:44Z
- **Tasks:** 2 of 2 (Task 2 human-verify checkpoint approved)
- **Files modified:** 4

## Accomplishments

- Added three brand tracking tokens to @theme: `--tracking-brand-tight` (-0.02em), `--tracking-brand-wide` (0.12em), `--tracking-brand-widest` (0.2em)
- IntroAnimation h1 "Anna Blomgren" grows from md:text-7xl to md:text-8xl with tracking-brand-wide
- IntroAnimation subtitle "ARTIST & ILLUSTRATOR" uppercased with tracking-brand-widest for cinematic spaced-out label effect
- Contact h1 "Get in Touch" grows from text-4xl/md:text-5xl to text-5xl/md:text-7xl with tracking-brand-wide — exceeds 3:1 size contrast vs body
- About page h2 elements (direct + RichText bioText container) upgraded to text-3xl/md:text-4xl with tracking-brand-wide for consistent treatment

## Task Commits

Each task was committed atomically:

1. **Task 1: Add typography tokens and upgrade all headings** - `b662341` (feat)
2. **Task 2: Visual verification of full Phase 4 atmosphere** - human-verify checkpoint approved, no code commit needed

**Deviation commit:** `78b36c3` (style: lighten background to #121212 for visible grain and vignette)

**Plan metadata:** `1825d0f` (docs: complete brand typography plan)

## Files Created/Modified

- `src/app/globals.css` - Added --tracking-brand-tight/wide/widest to @theme block; --color-bg changed from #0a0a0a to #121212
- `src/components/frontend/IntroAnimation.tsx` - h1 text-8xl tracking-brand-wide; subtitle uppercase tracking-brand-widest
- `src/app/(frontend)/contact/page.tsx` - h1 text-5xl md:text-7xl tracking-brand-wide
- `src/app/(frontend)/about/page.tsx` - h2 direct + RichText [&_h2]: chain upgraded to text-3xl md:text-4xl tracking-brand-wide; h3 to text-2xl tracking-brand-wide

## Decisions Made

- tracking-brand-wide (0.12em) is the standard heading token; tracking-brand-widest (0.2em) reserved for uppercase labels only
- IntroAnimation subtitle uses uppercase rather than title-case to maximize the spaced-out cinematic effect
- RichText arbitrary variant chain kept flat in className string — no separate component needed for this level of styling

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Lightened --color-bg from #0a0a0a to #121212 for grain/vignette visibility**
- **Found during:** Task 1 (post-build visual check before verification checkpoint)
- **Issue:** Film grain and vignette overlays from Plan 01 were invisible against the near-pure-black #0a0a0a background — the core atmospheric effects were effectively hidden
- **Fix:** Changed `--color-bg: #0a0a0a` to `--color-bg: #121212` in globals.css @theme block
- **Files modified:** src/app/globals.css
- **Verification:** Grain texture and darkened screen edges visible in dev server; human-verified in Task 2 checkpoint
- **Committed in:** `78b36c3` (separate style commit, before verification checkpoint)

---

**Total deviations:** 1 auto-fixed (Rule 1 — visibility bug)
**Impact on plan:** Essential fix — the atmospheric effects from Plan 01 were undetectable without this adjustment. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All four files modified. Build verified clean.
- Full Phase 4 atmospheric foundation is complete and human-verified: film grain, vignette, AnimatePresence refactor, and commanding typography are all live together
- Phase 5 (gallery experience or next planned phase) can begin
- Concern remains: Phase 7 entrance-only AnimatePresence template.tsx pattern should be smoke-tested against live layout.tsx before committing to full Phase 7 plan design

---
*Phase: 04-atmospheric-foundation*
*Completed: 2026-03-14*
