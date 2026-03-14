# Requirements: Anna Blomgren Portfolio

**Defined:** 2026-03-14
**Core Value:** When someone scans Anna's QR code, the site must make an immediate, powerful visual impression that communicates versatility, personal voice, and professional seriousness.

## v1.1 Requirements

Requirements for Dark & Dangerous visual/UX overhaul. Each maps to roadmap phases.

### Atmosphere

- [x] **ATMO-01**: Site displays a persistent film grain noise overlay across all pages, creating textured graphite depth instead of flat black
- [x] **ATMO-02**: Site displays a persistent vignette overlay darkening screen edges to focus the eye on central content
- [ ] **ATMO-03**: Typography uses aggressive letter-spacing, size contrast, and strategic italic on Bodoni Moda headings — commanding, not cautious

### Intro

- [ ] **INTR-01**: Intro animation uses thicker ink strokes (5-12px) with SVG turbulence filter for bleed/feathered edges — feels like actual mark-making
- [ ] **INTR-02**: Name reveal uses letter-by-letter stagger animation instead of block fade
- [x] **INTR-03**: Intro maintains skip, localStorage memory, and prefers-reduced-motion support from v1.0

### Gallery

- [ ] **GLRY-01**: Gallery cards fade and slide in on scroll with staggered timing per card — curated reveal, not static dump
- [ ] **GLRY-02**: Gallery cards gain compound hover effect with scale, shadow, and gradient depth
- [ ] **GLRY-03**: Gallery cards respond to cursor position with 3D tilt parallax (perspective transform) — like holding physical art
- [ ] **GLRY-04**: 3D tilt replaces compound hover on desktop; compound hover remains as mobile/touch fallback

### Lightbox

- [ ] **LBOX-01**: Lightbox backdrop displays subtle grain and vignette — images feel lit from a darkroom, not floating on flat black

### Page Experience

- [ ] **PAGE-01**: About page elements entrance with staggered vertical motion — precision feel
- [ ] **PAGE-02**: Contact page elements entrance with staggered vertical motion
- [ ] **PAGE-03**: Ink-bleed SVG page transitions between routes — navigation feels like ink bleeding across the screen
- [ ] **PAGE-04**: Page transitions use entrance-only pattern (no exit animations) to avoid App Router limitations

### Decorative

- [ ] **DECR-01**: SVG ink-stain blob dividers between page sections, slowly morphing between shape variants
- [ ] **DECR-02**: Ink-stain dividers are purely decorative and do not affect layout or content flow

### Accessibility & Performance

- [ ] **PERF-01**: All animations respect prefers-reduced-motion — effects disabled or simplified for users who request it
- [ ] **PERF-02**: All overlay effects use pointer-events: none — no blocking of user interaction
- [ ] **PERF-03**: Gallery scroll-reveal uses whileInView (not mount-all) to prevent GPU layer explosion on mobile
- [ ] **PERF-04**: 3D tilt and cursor effects are desktop-only — gated by @media (hover: hover) and (pointer: fine)
- [ ] **PERF-05**: Total new bundle size stays under 5KB gzip (lenis is the only new dependency)

## v1.2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Future Enhancements

- **FUTR-01**: Magnetic inertial cursor dot with elastic physics (desktop only)
- **FUTR-02**: WebGL particle system (only if SVG/CSS effects feel insufficient)
- **FUTR-03**: Sound design (only if Anna specifically requests)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| WebGL / Three.js effects | 300-500KB bundle kills mobile performance on Vercel free tier |
| Autoplay audio | Jarring on QR-scanned phone in tattoo shop; instant back-button |
| Cursor sparkles / glitter trails | Wrong brand register — Anna's work is dark and precise, not whimsical |
| Full scroll-jacking (CSS snap) | Breaks accessibility, destroys mobile UX, conflicts with masonry flow |
| Canvas confetti on click | Draws attention from artwork |
| Dark-mode toggle | Dark graphite IS the brand; toggle signals lack of conviction |
| background-attachment: fixed parallax | Causes serious jank on iOS Safari — use transform instead |
| Character-by-character type on every heading | CLS issues, annoying on return visits; reserve for intro only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ATMO-01 | Phase 4 | Complete |
| ATMO-02 | Phase 4 | Complete |
| ATMO-03 | Phase 4 | Pending |
| INTR-03 | Phase 4 | Complete |
| GLRY-01 | Phase 5 | Pending |
| GLRY-02 | Phase 5 | Pending |
| INTR-01 | Phase 5 | Pending |
| INTR-02 | Phase 5 | Pending |
| PERF-03 | Phase 5 | Pending |
| PERF-04 | Phase 5 | Pending |
| GLRY-03 | Phase 6 | Pending |
| GLRY-04 | Phase 6 | Pending |
| LBOX-01 | Phase 6 | Pending |
| PAGE-01 | Phase 6 | Pending |
| PAGE-02 | Phase 6 | Pending |
| DECR-01 | Phase 6 | Pending |
| DECR-02 | Phase 6 | Pending |
| PERF-01 | Phase 6 | Pending |
| PERF-02 | Phase 6 | Pending |
| PAGE-03 | Phase 7 | Pending |
| PAGE-04 | Phase 7 | Pending |
| PERF-05 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 — traceability complete after roadmap creation*
