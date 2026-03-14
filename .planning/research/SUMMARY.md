# Project Research Summary

**Project:** Anna Portfolio — v1.1 Dark & Dangerous Visual/UX Overhaul
**Domain:** Artist portfolio — cinematic dark experience for a tattoo/fine-art portfolio
**Researched:** 2026-03-14
**Confidence:** MEDIUM-HIGH

## Executive Summary

This milestone is a transformation layer, not a feature addition. v1.0 already delivers a working portfolio with Next.js 15, Payload CMS, Motion, Tailwind v4, masonry gallery, lightbox, and contact form. v1.1's job is to turn that functional product into a dark, textured, kinetic experience that reads as a deliberate creative statement — the difference between "someone applied a dark theme" and "someone built a dark experience." Research confirms the approach: nearly every atmospheric effect needed (film grain, parallax, scroll reveals, SVG ink transitions, page transitions) is achievable using the existing stack plus one new dependency (`lenis` at ~3KB gzip). The total new bundle cost for all v1.1 effects is approximately 3KB — a remarkable constraint given the visual ambition.

The recommended implementation order is strict. CSS-only effects (film grain, vignette, typography tightening) ship first because they immediately transform the entire site and require zero Motion complexity. Gallery interactions come next because the gallery is the product — scroll-reveal stagger and parallax hover establish the kinetic feel viewers expect from a high-craft dark portfolio. Signature and cinematic effects (3D card tilt, ink-bleed page transitions, magnetic cursor) build last because they depend on everything else being stable and carry the highest implementation risk. This is not a preference ordering; it is a dependency ordering enforced by the architecture.

The primary risks are not visual ambition — they are invisible technical traps. Three require explicit up-front attention: (1) a confirmed nested-AnimatePresence bug that will silently break the intro-to-gallery flow if existing `IntroAnimation.tsx` is not refactored before any layout-level animation wrappers are added; (2) a confirmed Next.js App Router limitation that makes exit animations unreliable in production (entrance-only transitions is the correct pattern, not a workaround); and (3) GPU layer explosion on mid-range Android — adding effects naively to 40+ gallery cards simultaneously will crash mobile browser tabs. Every phase must be tested on a throttled mobile profile before it is called done.

---

## Key Findings

### Recommended Stack

The v1.0 stack is unchanged and validated. For v1.1, only one new npm dependency is warranted: `lenis ^1.3.18` for smooth scroll normalization. Everything else — particles, grain, parallax, page transitions, hover micro-interactions, stagger sequences — is built using Motion 12.36.0 (already installed), browser Canvas 2D API, and inline SVG filters.

All major alternatives were rejected on bundle cost grounds. The site's primary user arrives via QR code on a phone. This makes bundle size a hard constraint, not a preference: Three.js (658KB parsed) and tsParticles (~150–500KB parsed) are categorically excluded. GSAP duplicates Motion already in the bundle. grained.js is unmaintained jQuery-era code with no TypeScript. The custom Canvas + CSS SVG-filter approach delivers the same atmospheric quality at zero additional KB.

**Core technologies:**
- `lenis ^1.3.18`: Smooth scroll engine — the only new npm dep; normalizes scroll across pointer/touch/trackpad; pairs with Motion's `useScroll`
- `motion/react` (existing, v12.36.0): Handles all animation — `whileInView`, `useScroll`, `useSpring`, `AnimatePresence`, `layoutId`, springs
- CSS `feTurbulence` + `@keyframes grain`: Film grain overlay — zero JS, zero bundle cost, browser-composited
- Canvas 2D API (browser built-in): Custom `<ParticleCanvas>` — ~50 lines, zero npm cost, full aesthetic control
- Inline SVG `<filter>` / `<feTurbulence>`: Fog, ink-bleed, atmospheric distortion — GPU-composited, no library

**Critical version notes:** `template.tsx` (not `layout.tsx`) is required for page transitions in Next.js 15 App Router. `lenis` must be imported from the `lenis/react` sub-path, not the deprecated `@studio-freight/lenis`.

See `.planning/research/STACK.md` for full alternatives analysis, bundle impact table, and version compatibility notes.

### Expected Features

This milestone has no new pages, no new data models, and no new admin flows. Every feature is a visual or interaction enhancement applied to existing components.

**Must have (table stakes — portfolio reads as unfinished without these):**
- Film grain overlay — every premium dark site uses it; absence is felt as "too digital"
- Vignette overlay — frames artwork, focuses eye on content center
- Scroll-reveal stagger on gallery cards — flat render of 30 images reads as a directory, not a curated gallery
- Gallery card hover depth (compound scale + shadow + gradient) — static cards feel inert against the work
- Enhanced intro animation — current thin SVG strokes are competent but not ink; needs weight and letter-stagger
- Typography with attitude — Bodoni Moda must be used aggressively, not cautiously

**Should have (differentiators — what makes the site memorable):**
- Gallery card 3D tilt parallax — simulates handling physical art; deeply satisfying on desktop
- Ink-bleed SVG page transition — brand-coherent cinematic navigation
- Magnetic inertial cursor dot — signature of high-end creative studios (desktop-only)
- Lightbox atmospheric backdrop — art feels lit from a darkroom, not flat black
- About/Contact entrance stagger reveals — communicates precision and intent
- Ink-stain decorative section dividers — brand texture without competing with artwork

**Defer to v1.2+:**
- WebGL / Three.js particles — catastrophic bundle cost on mobile; CSS/SVG approach covers the need
- Sound design — jarring on a QR-scanned phone in a tattoo shop

**Explicit anti-features:**
- Scroll-jacking (CSS snap) — breaks accessibility, destroys mobile UX
- Dark-mode toggle — the graphite palette is the brand; a toggle communicates design indecision
- `background-attachment: fixed` parallax — iOS Safari long-standing jank bug, unacceptable on primary device
- Character-by-character heading animations on every page — CLS, slow on mobile, annoying on return visits

See `.planning/research/FEATURES.md` for full feature table, complexity estimates, and the complete dependency graph.

### Architecture Approach

The effect layer sits entirely within the `(frontend)` route group and does not touch admin, CMS, or server page components. Two new globally-mounted components — `TextureOverlay` (pure CSS grain + vignette) and `ParticleCanvas` (Canvas RAF loop) — are mounted in `(frontend)/layout.tsx` as `position: fixed; pointer-events: none` siblings. A new `(frontend)/template.tsx` provides entrance-only page transitions. `GalleryCard` is extracted from `GalleryGrid` as a dedicated client component that owns `whileInView`, parallax hover via a `useParallaxHover` hook, and a single `motion.div` that composes all three effects without nesting wrappers.

Z-index stacking is managed through CSS custom properties in the `@theme` block (particles: 1, texture: 2, content: 10, gallery overlays: 20, nav: 40, intro: 50, lightbox: 60). All new fixed overlays carry `pointer-events: none` as a non-negotiable requirement — omitting it silently breaks all interactivity with no console error.

**Major components:**
1. `TextureOverlay.tsx` (NEW) — `position: fixed`, CSS grain animation, zero JS, `pointer-events: none`
2. `ParticleCanvas.tsx` (NEW) — Canvas RAF loop, `prefers-reduced-motion` gated, mobile-capped at 30 particles
3. `GalleryCard.tsx` (NEW, extracted) — single `motion.div` composing `whileInView` + `layout` prop + spring parallax
4. `(frontend)/template.tsx` (NEW) — entrance-only page fade, remounts per route to enable page transitions
5. `useParallaxHover.ts` (NEW hook) — `useMotionValue + useSpring` pattern, reusable, returns spring values + handlers
6. Modified: `IntroAnimation`, `GalleryGrid`, `NavBar`, `TagFilter`, `ContactForm`, `GalleryLightbox`, `globals.css`

See `.planning/research/ARCHITECTURE.md` for full component diagram, data flow, z-index table, build order, and six documented anti-patterns.

### Critical Pitfalls

See `.planning/research/PITFALLS.md` for full detail, recovery steps, and the "Looks Done But Isn't" verification checklist.

1. **Nested AnimatePresence conflict** — Existing `IntroAnimation.tsx` has its own `AnimatePresence` wrapper. Adding a layout-level `AnimatePresence` creates nested instances that cause double-unmount errors and a gallery that renders blank after intro completes. Fix: audit and refactor `IntroAnimation` to remove its own `AnimatePresence` before adding any outer wrapper. This is Phase 1's prerequisite gate.

2. **Page transitions broken in production** — Exit animations that work in `next dev` are silently skipped in `next build` because the App Router unmounts the old page before `AnimatePresence` can intercept. This is a confirmed, unresolved Next.js limitation (GitHub discussions #42658, #59349). Fix: entrance-only animations — fade in on arrival, no exit. Never use `AnimatePresence mode="wait"` at layout level.

3. **GPU layer explosion crashing Android tabs** — Motion on 40+ gallery cards simultaneously can push GPU memory past the limit of mid-range Android browsers, silently killing the tab. Fix: use `whileInView` to deactivate off-screen cards, avoid static `will-change: transform`, keep simultaneous active Motion components at 10 or fewer. Verify with Chrome DevTools Layers panel (target under 15 composite layers during scroll).

4. **CSS grain overlay causing implicit layer promotion** — A `position: fixed` grain overlay at `z-index > 0` can force every overlapping element into its own GPU compositor layer, doubling GPU memory use silently. Fix: use `mix-blend-mode: overlay` on the grain layer, keep z-index at 1, add `isolation: isolate` to the gallery container. Test in Layers panel immediately after adding grain in isolation.

5. **iOS Safari parallax broken on primary device** — The primary user arrives via QR code on an iPhone. iOS Safari fires scroll events asynchronously and has no hardware acceleration for `background-attachment: fixed`. Fix: use Motion `useScroll` + `useTransform` exclusively; never scroll event listeners for parallax; gate all parallax behind `@media (hover: hover)`. Physical iPhone test required before any gallery phase is closed.

---

## Implications for Roadmap

Based on combined research, a 4-phase structure is strongly recommended, aligned with the dependency graph from FEATURES.md and the build-order specification from ARCHITECTURE.md. Effects have hard dependencies that create a fixed ordering — this is not a suggestion.

### Phase 1: Atmospheric Foundation

**Rationale:** CSS-only effects with no Motion complexity. Highest impact-to-effort ratio in the entire milestone. Transforms the baseline feel of every page immediately and gives subsequent phases a better visual canvas to build on. Also contains the mandatory AnimatePresence audit that must precede all animation work.
**Delivers:** Film grain overlay (`TextureOverlay` component), vignette overlay, typography tightening (letter-spacing, size contrast, strategic italic), z-index CSS variable system, `IntroAnimation.tsx` refactored to remove its own `AnimatePresence`.
**Addresses features:** Film grain (P1), vignette (P1), typography tightening (P1).
**Avoids:** Nested AnimatePresence conflict — IntroAnimation is audited and refactored here before any outer wrappers exist anywhere in the tree.
**Research flag:** Standard patterns. CSS grain and z-index are well-documented. No additional research needed.

### Phase 2: Gallery Interactions

**Rationale:** The gallery is the product. Scroll-reveal and parallax hover make artwork feel earned and curated rather than dumped. `GalleryCard` extraction is the structural prerequisite for all subsequent per-card effects — it must be stable before Phase 3 extends it. Enhanced intro ships here because it builds on the same animation patterns and shares the IntroAnimation file scope.
**Delivers:** `GalleryCard.tsx` extracted and standalone, `useParallaxHover.ts` hook, scroll-reveal stagger (`whileInView` + stagger delay), compound hover depth (scale + shadow + gradient), `TagFilter` layoutId shared pill animation, enhanced intro animation (thicker SVG strokes, letter-stagger), ink turbulence filter on intro SVG paths.
**Addresses features:** Scroll-reveal (P1), gallery hover depth (P1), enhanced intro (P1), intro turbulence filter (P1).
**Avoids:** GPU layer explosion — `whileInView` keeps active layers bounded; single `motion.div` per card; translate-only parallax (not rotateX/Y) avoids masonry height calculation issues.
**Avoids:** iOS Safari parallax failure — all parallax via Motion `useSpring`, gated behind hover media query.
**Research flag:** Standard patterns (Motion `whileInView`, `useSpring`, `layoutId` are official documented APIs). Physical iPhone and 6x CPU throttle tests are required before phase closes.

### Phase 3: Signature Effects

**Rationale:** These are the differentiators that make reviewers remember the site. They require Phase 2 to be visually validated on a real device before building — 3D tilt extends the hover system built in Phase 2; lightbox enhances the gallery flow; stagger reveals complete the content pages. Lower risk than Phase 4 but higher complexity than Phases 1–2.
**Delivers:** Gallery card 3D tilt parallax (replaces compound hover), YARL lightbox cinematic CSS entrance override, About/Contact entrance stagger, NavBar Motion entrance + AnimatePresence mobile menu.
**Addresses features:** 3D tilt parallax (P2), lightbox atmospheric backdrop (P2), about/contact stagger reveals (P2).
**Avoids:** 3D tilt applied to masonry card container (translate-only on image element, overflow hidden on card wrapper — ARCHITECTURE.md anti-pattern 3). If tilt does not pass mobile performance QA, compound hover from Phase 2 is reinstated and tilt is deferred — do not ship both simultaneously.
**Research flag:** YARL CSS override API is well-documented. 3D tilt hover is a standard pattern. No additional research needed.

### Phase 4: Cinematic Layer

**Rationale:** Highest complexity, highest implementation risk. Built last so all simpler effects are stable, the AnimatePresence architecture is proven, and the gallery performance budget is understood. Page transitions require the `template.tsx` structural change — a mistake here could break all three pages simultaneously. Particles add performance variables that could interact with gallery effects if not isolated and validated last.
**Delivers:** `(frontend)/template.tsx` entrance-only page transitions, `ParticleCanvas` ambient ink/smoke (30-particle mobile cap, `fpsLimit: 30`, `prefers-reduced-motion` gated), magnetic inertial cursor dot (desktop-only, `@media (hover: hover)` gated), ink-stain decorative SVG section dividers.
**Addresses features:** Page transitions (P2), cursor dot (P3), ink-stain dividers (P3), ambient particles (differentiator).
**Avoids:** Exit animations in App Router production (entrance-only is the confirmed correct pattern). Particle system destroying mobile performance — hard cap, fps limit, IntersectionObserver pause, `dynamic({ ssr: false })` import. Grain layer proliferation — test Layers panel before and after particle canvas is added.
**Research flag:** Page transitions warrant a validation branch against the live `(frontend)/layout.tsx` structure before the phase is fully planned — the App Router exit-animation limitation is documented but the exact entrance-only implementation should be smoke-tested in our specific layout first.

### Phase Ordering Rationale

- CSS-only effects have no dependencies and immediate site-wide impact — they must come first to establish the visual baseline every subsequent QA session builds on.
- The AnimatePresence refactor of `IntroAnimation` is a hard prerequisite for all animation phases — it must occur in Phase 1, before any outer wrappers exist.
- `GalleryCard` extraction is a structural prerequisite for 3D tilt and all per-card animation composition — it belongs in Phase 2, making Phase 2 the dependency enabler for Phase 3.
- Page transitions require the `template.tsx` structural change — placing it in the last phase means all other layout behavior is proven stable before this structural change is introduced.
- Particles add performance uncertainty — isolating them in Phase 4 means GPU budget issues discovered there do not contaminate Phase 2/3 QA results.

### Research Flags

Phases needing targeted research during planning:
- **Phase 4 (page transitions):** App Router + AnimatePresence is a confirmed friction point. A quick validation branch testing the entrance-only `template.tsx` pattern against the specific `(frontend)` route group layout should precede full phase design.

Phases with standard patterns (no additional research needed):
- **Phase 1:** CSS grain, vignette, and typography are industry-standard, well-documented techniques with official browser support.
- **Phase 2:** Motion `whileInView`, `useSpring`, `layoutId` are official documented APIs with high-quality reference examples.
- **Phase 3:** YARL CSS override, 3D tilt hover, and stagger reveals are documented patterns with multiple reference implementations.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | One new dependency (lenis) with official docs confirmed. Alternatives rejected on verifiable bundle data. Existing stack is production-validated in v1.0. |
| Features | MEDIUM-HIGH | Table-stakes and differentiator categories grounded in award-winning portfolio patterns and CSS/Motion official docs. Tattoo industry guidance is inferred from practitioner sources rather than first-hand — resolves cleanly with general portfolio UX guidance. |
| Architecture | HIGH | Component structure, build order, and anti-patterns are based on official Motion and Next.js docs. All hard dependencies are documented with confirmed sources. |
| Pitfalls | HIGH | All critical pitfalls confirmed against official sources (Motion docs, web.dev, W3C WCAG) or confirmed GitHub issues (Next.js #42658, #59349; Motion #2387). Recovery strategies are concrete and low-cost. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Exit animations on page transitions:** The entrance-only recommendation is correct but the exact implementation needs smoke-test validation against the live `(frontend)/layout.tsx` structure before committing to Phase 4 design. This is a known-complexity area with confirmed open issues, not pure uncertainty.
- **Grain opacity calibration:** Research recommends 3–6% opacity. The right value for Anna's specific graphite palette (`#0a0a0a` background, `#e0e0e0` accent) needs real-device calibration during Phase 1 — not a blocker, but must be on the Phase 1 QA checklist. OLED displays make grain most visible.
- **Particle aesthetics:** The custom Canvas approach is correct. The specific particle behavior (velocity curves, alpha falloff, ink drip profile) is a design/feel question research cannot answer. Budget iteration time in Phase 4.
- **3D tilt vs compound hover conditional:** If 3D tilt fails mobile performance QA in Phase 3, compound hover from Phase 2 must be reinstated. This conditional should be explicit in Phase 3 success criteria so the rollback is not a surprise.

---

## Sources

### Primary (HIGH confidence)
- [motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations) — useScroll, useTransform, whileInView
- [motion.dev/docs/react-use-spring](https://motion.dev/docs/react-use-spring) — useSpring API
- [motion.dev/docs/stagger](https://motion.dev/docs/stagger) — staggerChildren pattern
- [motion.dev/magazine/web-animation-performance-tier-list](https://motion.dev/magazine/web-animation-performance-tier-list) — GPU compositing budget guidance
- [github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) — lenis v1.3.18, React sub-path, syncTouch option
- [MDN: SVG feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence) — browser support, filter types
- [vercel.com/docs/functions/limitations](https://vercel.com/docs/functions/limitations) — Vercel function limits
- [web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) — GPU layer management
- [developer.chrome.com/blog/performant-parallaxing](https://developer.chrome.com/blog/performant-parallaxing) — iOS Safari parallax constraints
- [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) — reduced-motion requirements
- [vercel/next.js discussion #42658](https://github.com/vercel/next.js/discussions/42658) — AnimatePresence + App Router confirmed limitation
- [vercel/next.js discussion #59349](https://github.com/vercel/next.js/discussions/59349) — Page transition exit animation confirmed limitation
- [motiondivision/motion issue #2387](https://github.com/framer/motion/issues/2387) — Nested AnimatePresence double-unmount bug confirmed
- [yet-another-react-lightbox.com/customization](https://yet-another-react-lightbox.com/customization) — YARL CSS override API

### Secondary (MEDIUM confidence)
- [imcorfitz.com — Framer Motion page transitions in Next.js App Router](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) — template.tsx pattern confirmed
- [css-tricks.com/grainy-gradients](https://css-tricks.com/grainy-gradients/) — grain CSS technique
- [frontendmasters.com/blog/grainy-gradients](https://frontendmasters.com/blog/grainy-gradients/) — animated grain implementation
- [awwwards.com portfolio winners](https://www.awwwards.com/websites/winner_category_portfolio/) — dark portfolio pattern benchmarking
- [certifiedtattoo.com — apprenticeship portfolio guidance](https://certifiedtattoo.com/blog/how-to-put-together-a-portfolio-for-tattoo-apprenticeships) — tattoo industry context
- [cssscript.com/parallax-tilt-hover-effect-card](https://www.cssscript.com/parallax-tilt-hover-effect-card/) — 3D tilt hover pattern
- [builder.io/blog/nextjs-14-layouts-templates](https://www.builder.io/blog/nextjs-14-layouts-templates) — layout.tsx vs template.tsx distinction

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
