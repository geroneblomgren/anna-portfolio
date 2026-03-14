# Roadmap: Anna Blomgren Artist Portfolio

## Milestones

- ✅ **v1.0 MVP** — Phases 1-3 (shipped 2026-03-14)
- 🚧 **v1.1 Dark & Dangerous** — Phases 4-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) — SHIPPED 2026-03-14</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-13
- [x] Phase 2: Admin + Image Pipeline (3/3 plans) — completed 2026-03-13
- [x] Phase 3: Public Site (4/4 plans) — completed 2026-03-14

Full details archived: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Dark & Dangerous (In Progress)

**Milestone Goal:** Transform the portfolio from polished-but-safe to dark, dangerous, and immersive — the kind of site that makes a tattoo master stop and lean in.

- [ ] **Phase 4: Atmospheric Foundation** — CSS texture overlays, typography attitude, and AnimatePresence audit
- [ ] **Phase 5: Gallery Interactions** — Scroll-reveal stagger, compound hover, and enhanced intro animation
- [ ] **Phase 6: Signature Effects** — 3D tilt parallax, lightbox atmosphere, stagger reveals, ink-stain dividers
- [ ] **Phase 7: Cinematic Layer** — Ink-bleed page transitions and ambient particle canvas

## Phase Details

### Phase 4: Atmospheric Foundation
**Goal**: The entire site breathes with dark texture — grain, vignette, and commanding typography transform every page before a single motion effect is added
**Depends on**: Phase 3 (v1.0 complete)
**Requirements**: ATMO-01, ATMO-02, ATMO-03, INTR-03
**Success Criteria** (what must be TRUE):
  1. Film grain noise texture is visible across all pages (gallery, about, contact) without blocking any clickable element
  2. Vignette darkens screen edges on every page, visually focusing the eye on central content
  3. Bodoni Moda headings display with aggressive letter-spacing, strong size contrast, and strategic italic — visibly more commanding than v1.0
  4. IntroAnimation skip, localStorage memory, and prefers-reduced-motion behavior work identically to v1.0 after AnimatePresence refactor
**Plans:** 1/2 plans executed

Plans:
- [ ] 04-01-PLAN.md — AnimatePresence refactor + film grain and vignette CSS overlays
- [ ] 04-02-PLAN.md — Brand typography tokens and commanding heading upgrades across all pages

### Phase 5: Gallery Interactions
**Goal**: The gallery feels like a curated reveal — artwork earns its place through scroll-choreographed entrances and hover depth that simulates physical handling
**Depends on**: Phase 4
**Requirements**: GLRY-01, GLRY-02, INTR-01, INTR-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Gallery cards animate in with staggered scroll-reveal — cards below the fold are invisible until they scroll into view, then appear in sequence
  2. Gallery cards gain visible scale, shadow deepening, and gradient lift on hover — the effect is compound, not flat
  3. Intro animation SVG strokes are visibly thicker with feathered/bleed edges and the name "Anna Blomgren" reveals letter-by-letter, not as a block
  4. On a throttled mobile profile, scrolling through the full gallery does not stutter — GPU layers stay bounded because off-screen cards are deactivated
  5. Cursor-based (hover: hover) effects are absent on touch-only devices — no broken parallax flicker on phone
**Plans**: TBD

### Phase 6: Signature Effects
**Goal**: The site's differentiating moments are in place — 3D card handling, darkroom lightbox atmosphere, precision stagger on content pages, and ink-stain section texture
**Depends on**: Phase 5
**Requirements**: GLRY-03, GLRY-04, LBOX-01, PAGE-01, PAGE-02, DECR-01, DECR-02, PERF-01, PERF-02
**Success Criteria** (what must be TRUE):
  1. On desktop, gallery cards tilt in 3D as the cursor moves across them — the effect simulates holding a physical print; on touch devices the compound hover from Phase 5 is active instead
  2. Lightbox backdrop shows grain and vignette — artwork feels lit from a darkroom, not floating on flat black
  3. About and Contact page elements entrance with visible vertical stagger — each section arrives in deliberate sequence, not all at once
  4. Ink-stain SVG blob dividers appear between sections, slowly morphing shape — they add organic texture without displacing any content
  5. With prefers-reduced-motion enabled, tilt, stagger, and divider morph are all disabled or simplified — no animation plays against the user's system preference
**Plans**: TBD

### Phase 7: Cinematic Layer
**Goal**: Navigation between pages and the ambient atmosphere of the site are cinematic — ink bleeds across the screen on route change and ambient particles drift across every page
**Depends on**: Phase 6
**Requirements**: PAGE-03, PAGE-04, PERF-05
**Success Criteria** (what must be TRUE):
  1. Navigating between gallery, about, and contact routes shows a visible ink-bleed SVG transition on arrival — the new page bleeds in, not cuts in
  2. The page transition has no exit animation — the old page disappears immediately, only the entrance is animated (confirmed correct pattern for App Router production)
  3. Ambient ink/smoke particles drift across every page without any noticeable frame drop on a mid-range Android at 6x CPU throttle
  4. The total new JavaScript added across the entire v1.1 milestone stays under 5KB gzip

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-03-13 |
| 2. Admin + Image Pipeline | v1.0 | 3/3 | Complete | 2026-03-13 |
| 3. Public Site | v1.0 | 4/4 | Complete | 2026-03-14 |
| 4. Atmospheric Foundation | 1/2 | In Progress|  | - |
| 5. Gallery Interactions | v1.1 | 0/TBD | Not started | - |
| 6. Signature Effects | v1.1 | 0/TBD | Not started | - |
| 7. Cinematic Layer | v1.1 | 0/TBD | Not started | - |
