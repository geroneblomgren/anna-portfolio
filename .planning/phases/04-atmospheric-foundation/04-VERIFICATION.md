---
phase: 04-atmospheric-foundation
verified: 2026-03-14T19:21:33Z
status: human_needed
score: 11/11 automated must-haves verified
human_verification:
  - test: "Film grain texture is visually perceptible on all pages"
    expected: "Subtle noise texture visible across dark areas of gallery, about, and contact pages"
    why_human: "CSS opacity 0.035 on SVG data-URI — programmatic check can confirm the rule exists but not whether the rendered result is visible at that opacity level"
  - test: "Vignette edge-darkening is visible on all pages"
    expected: "Screen edges are noticeably darker than the center content area"
    why_human: "radial-gradient on body::before — perceptibility depends on render, display, and calibration; cannot assert visual outcome from source alone"
  - test: "Intro animation plays correctly from a cold start"
    expected: "Clear localStorage, refresh — intro overlay shows with large Anna Blomgren heading and spaced ARTIST & ILLUSTRATOR subtitle, then fades to gallery after 3.5s or on Skip"
    why_human: "Browser rendering, animation timing, and localStorage interaction require a live session"
  - test: "Typography is visibly more commanding than v1.0 across all pages"
    expected: "About h2 headings and contact h1 have clearly wider letter-spacing and larger size than body text — dominant, not polished-safe"
    why_human: "Visual quality judgment; size-contrast ratio and tracking perception vary by screen"
  - test: "Grain animation is static with prefers-reduced-motion enabled"
    expected: "Toggling 'prefers-reduced-motion: reduce' in DevTools stops grain movement and opacity drops to 0.02"
    why_human: "Media query behaviour and visual animation state require live browser inspection"
---

# Phase 4: Atmospheric Foundation — Verification Report

**Phase Goal:** The entire site breathes with dark texture — grain, vignette, and commanding typography transform every page before a single motion effect is added
**Verified:** 2026-03-14T19:21:33Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria + PLAN must_haves)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Film grain noise texture is visible across all pages without blocking any clickable element | ? HUMAN | `body::after` with `feTurbulence` exists; `pointer-events: none` confirmed; visibility is human-only |
| 2 | Vignette darkens screen edges on every page, visually focusing eye on central content | ? HUMAN | `body::before` radial-gradient exists; `pointer-events: none` confirmed; visual result is human-only |
| 3 | Bodoni Moda headings display with aggressive letter-spacing, strong size contrast, strategic italic | ? HUMAN | All `tracking-brand-wide/widest` classes applied in correct locations; visual judgment is human-only |
| 4 | IntroAnimation skip, localStorage, and prefers-reduced-motion work identically to v1.0 after refactor | ? HUMAN | All code paths verified (see artifact checks); live execution is human-only |
| 5 | IntroAnimation no longer owns AnimatePresence — uses useState gating instead | VERIFIED | No `AnimatePresence` import or usage in `IntroAnimation.tsx`; three explicit render branches present |
| 6 | Intro plays on first visit, skips on return visit, skips with prefers-reduced-motion | VERIFIED | `localStorage.getItem('intro-seen')` + `window.matchMedia('(prefers-reduced-motion: reduce)').matches` wired in `useEffect` with correct branching |
| 7 | Skip button works and sets localStorage key | VERIFIED | `skip()` calls `localStorage.setItem('intro-seen', '1')`, sets `showIntro=false`, `done=true`; bound to button `onClick` |
| 8 | Neither overlay blocks clicks on any interactive element | VERIFIED | `pointer-events: none` present on both `body::before` (line 32) and `body::after` (line 46) in `globals.css` |
| 9 | Grain animation is disabled when prefers-reduced-motion is active | VERIFIED | `@media (prefers-reduced-motion: reduce) { body::after { animation: none; opacity: 0.02; } }` present at line 62–67 |
| 10 | Brand tracking tokens defined in @theme | VERIFIED | `--tracking-brand-tight: -0.02em`, `--tracking-brand-wide: 0.12em`, `--tracking-brand-widest: 0.2em` at lines 95–97 of `globals.css` |
| 11 | RichText h2 elements in About page match direct h2 tracking treatment | VERIFIED | `[&_h2]:tracking-brand-wide` present in RichText container className at line 53 of `about/page.tsx` |

**Score:** 7/11 truths fully automated-verified, 4/11 require human confirmation (no gaps found — human tests are the final gate)

---

### Required Artifacts

#### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/frontend/IntroAnimation.tsx` | Refactored IntroAnimation without AnimatePresence | VERIFIED | Exists, substantive (144 lines), wired via `layout.tsx`; no `AnimatePresence` import; `useState` gating confirmed |
| `src/app/globals.css` | Film grain and vignette CSS overlays containing `feTurbulence` | VERIFIED | Exists, substantive (99 lines); `body::before`, `body::after`, `feTurbulence` all present |

#### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/globals.css` | Brand tracking tokens in @theme containing `--tracking-brand` | VERIFIED | All three tokens present at lines 95–97 |
| `src/components/frontend/IntroAnimation.tsx` | Upgraded intro heading with `tracking-brand` | VERIFIED | `tracking-brand-wide` on h1 (line 106), `tracking-brand-widest` on subtitle (line 114) |
| `src/app/(frontend)/about/page.tsx` | Upgraded about page heading typography with `tracking-brand` | VERIFIED | Direct h2 at lines 61, 73; RichText `[&_h2]:tracking-brand-wide` at line 53 |
| `src/app/(frontend)/contact/page.tsx` | Upgraded contact heading typography with `tracking-brand` | VERIFIED | h1 with `tracking-brand-wide text-5xl md:text-7xl` at line 16 |

---

### Key Link Verification

#### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `IntroAnimation.tsx` | `localStorage` | `getItem/setItem intro-seen` | WIRED | Line 15: `localStorage.getItem('intro-seen')`; line 31: `localStorage.setItem('intro-seen', '1')` |
| `globals.css` | `body::after` | film grain overlay | WIRED | `body::after` block at line 42 with `feTurbulence` data-URI background |
| `globals.css` | `body::before` | vignette overlay | WIRED | `body::before` block at line 28 with radial-gradient |

#### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `globals.css` | all heading components | `@theme tracking tokens` | WIRED | `--tracking-brand-wide` / `--tracking-brand-widest` consumed via Tailwind utility classes across all four files |
| `about/page.tsx` | RichText h2 selectors | `[&_h2]:tracking-brand-wide` arbitrary variant | WIRED | Present in RichText container className at line 53 |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| ATMO-01 | 04-01-PLAN.md | Persistent film grain noise overlay across all pages | SATISFIED | `body::after` with `feTurbulence` at `z-index: 9999`, `pointer-events: none`, opacity `0.035`; committed `6dc1e9a` |
| ATMO-02 | 04-01-PLAN.md | Persistent vignette overlay darkening screen edges | SATISFIED | `body::before` with radial-gradient at `z-index: 9998`, `pointer-events: none`; committed `6dc1e9a` |
| ATMO-03 | 04-02-PLAN.md | Aggressive letter-spacing, size contrast, strategic italic on Bodoni Moda headings | SATISFIED | `--tracking-brand-wide/widest` tokens defined; applied to h1 in IntroAnimation (`md:text-8xl`), h1 in contact (`md:text-7xl`), h2 in about (`md:text-4xl`), RichText h2; strategic italic only on subtitle; committed `b662341` |
| INTR-03 | 04-01-PLAN.md | Skip, localStorage memory, and prefers-reduced-motion support from v1.0 | SATISFIED | `useEffect` checks `localStorage.getItem` + `matchMedia`; `skip()` sets key; all three paths (seen / reduced / fresh) branch correctly; committed `2b198b2` |

No orphaned requirements — all four Phase 4 requirements (ATMO-01, ATMO-02, ATMO-03, INTR-03) are claimed by plans and verified in code.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/(frontend)/about/page.tsx` | 23 | `"About page coming soon."` | Info | Empty-state guard for no-CMS-data condition — correct and expected; not a stub |
| `src/app/(frontend)/about/page.tsx` | 43 | `placeholder={photo.blurDataURL ? 'blur' : 'empty'}` | Info | Next.js `Image` `placeholder` prop — correct usage; not a TODO |

No blocker or warning anti-patterns found.

---

### Human Verification Required

#### 1. Film Grain Perceptibility

**Test:** Open `http://localhost:3000` (gallery page). Look at dark areas — does the background have visible texture/noise?
**Expected:** Subtle but visible noise texture across the page, more apparent when the eye adjusts. Not heavy — a light graphite grit.
**Why human:** CSS `opacity: 0.035` on a data-URI SVG — below a threshold that is reliably visible on all display types. Cannot assert render perception from source.

#### 2. Vignette Edge Darkening

**Test:** Look at the four corners and edges of any page. Are they noticeably darker than the center?
**Expected:** A soft darkening toward the screen edges, pulling focus inward toward the artwork.
**Why human:** Radial-gradient perceptibility depends on display calibration and ambient light.

#### 3. Full Intro Sequence

**Test:**
1. Open DevTools console and run `localStorage.removeItem('intro-seen')`
2. Refresh the page
3. Observe: Does the full-screen intro play with the large "Anna Blomgren" heading and spaced-out "ARTIST & ILLUSTRATOR" subtitle?
4. After 3.5 seconds or after clicking Skip — does the gallery appear with a fade-in?

**Expected:** Intro plays cleanly, skip works, gallery fades in after intro.
**Why human:** Animation timing and localStorage state interaction require live browser session.

#### 4. Typography Attitude Across Pages

**Test:**
1. Visit `/about` — are the "Artist Statement" and "Contact" h2 headings larger and more widely spaced than the body text?
2. Visit `/contact` — is "Get in Touch" dramatically large with visible wide letter-spacing?
3. Confirm italic appears only on the subtitle line in the intro and blockquote content — NOT on primary headings.

**Expected:** All headings feel commanding, not cautious. Clear scale hierarchy. Strategic italic placement only.
**Why human:** Visual quality judgment — "commanding" is perceptual.

#### 5. Reduced-Motion Guard

**Test:** In Chrome DevTools, open Rendering panel, set "Emulate CSS media feature prefers-reduced-motion" to "reduce", then refresh.
**Expected:** Film grain overlay is static (no movement); intro animation skips immediately to gallery; vignette still visible.
**Why human:** Media query emulation and animation cessation require live browser inspection.

---

### Commit Verification

All four implementation commits confirmed present in repository:

| Commit | Message | Files |
|--------|---------|-------|
| `2b198b2` | refactor(04-01): remove AnimatePresence from IntroAnimation | `IntroAnimation.tsx` |
| `6dc1e9a` | feat(04-01): add film grain and vignette CSS overlays | `globals.css` |
| `b662341` | feat(04-02): add brand tracking tokens and upgrade headings | 4 files |
| `78b36c3` | style(04-02): lighten background to #121212 for visible grain and vignette | `globals.css` |

---

### Summary

All 11 automated must-haves pass. Every artifact exists, is substantive, and is correctly wired:

- `IntroAnimation.tsx` has no `AnimatePresence` — only `useState`-gated three-branch render
- `localStorage.getItem/setItem('intro-seen')` is wired to skip logic and `useEffect` gate
- `prefers-reduced-motion` is checked both in JS (IntroAnimation) and CSS (grain animation guard)
- `body::before` vignette and `body::after` film grain both carry `pointer-events: none` — no interactions blocked
- All three `--tracking-brand-*` tokens defined in `@theme`; consumed with `tracking-brand-wide` and `tracking-brand-widest` classes across IntroAnimation, about, and contact
- RichText `[&_h2]:tracking-brand-wide` arbitrary variant wired correctly on the bioText container
- `.masonry-grid` has `isolation: isolate` for GPU compositing containment
- Background lightened from `#0a0a0a` to `#121212` (deviation commit `78b36c3`) to ensure grain and vignette are perceptible

The 5 human tests are the final gate — these are perceptual/live-session checks, not gaps. The phase goal cannot be declared complete without human confirmation that the atmospheric effects are visually present and working as intended.

---

_Verified: 2026-03-14T19:21:33Z_
_Verifier: Claude (gsd-verifier)_
