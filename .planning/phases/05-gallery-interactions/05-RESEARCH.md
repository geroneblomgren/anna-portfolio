# Phase 5: Gallery Interactions - Research

**Researched:** 2026-03-14
**Domain:** Motion 12 scroll-reveal, stagger variants, SVG filter ink effects, compound hover, touch/hover detection
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GLRY-01 | Gallery cards fade and slide in on scroll with staggered timing per card — curated reveal, not static dump | `whileInView` + `viewport={{ once: true }}` on each card; index-based `delay` in transition; Intersection Observer based (off-thread, 0.5KB overhead) |
| GLRY-02 | Gallery cards gain compound hover effect with scale, shadow, and gradient depth | Motion `whileHover` for scale + `::after` pseudo-element opacity trick for shadow; gradient already exists in GalleryGrid.tsx overlay — upgrade opacity + depth |
| INTR-01 | Intro animation uses thicker ink strokes (5-12px) with SVG turbulence filter for bleed/feathered edges — feels like actual mark-making | Increase `strokeWidth` to 5-12px on existing `motion.path` elements; add `<filter>` with `feGaussianBlur` (stdDeviation 1-2) + `feDisplacementMap` (scale 8-15) in SVG `<defs>` for organic edge |
| INTR-02 | Name reveal uses letter-by-letter stagger animation instead of block fade | Split `"Anna Blomgren"` into `char.split('')` array; wrap each in `motion.span`; parent `motion.span` with `variants={{ visible: { transition: { staggerChildren: 0.06 } } }}`; `aria-hidden` on animated spans + `sr-only` full text |
| PERF-03 | Gallery scroll-reveal uses whileInView (not mount-all) to prevent GPU layer explosion on mobile | `whileInView` natively uses Intersection Observer — elements below fold are NOT promoted to GPU layers until they enter viewport. `viewport={{ once: true }}` ensures the observer disconnects post-reveal. |
| PERF-04 | 3D tilt and cursor effects are desktop-only — gated by @media (hover: hover) and (pointer: fine) | Phase 5 has no tilt (that is Phase 6). Phase 5 scope: ensure `whileHover` compound effect is CSS-gated: `@media (hover: hover) and (pointer: fine)` or JS `window.matchMedia('(hover: hover) and (pointer: fine)')` |
</phase_requirements>

---

## Summary

Phase 5 adds the first layer of Motion-driven interaction on top of the atmospheric foundation Phase 4 established. The two largest work units are: (1) retrofitting `GalleryGrid.tsx` so each masonry card has scroll-triggered entrance with stagger, and (2) upgrading `IntroAnimation.tsx` with thicker SVG strokes, a SVG displacement filter for organic edge, and a letter-by-letter name reveal.

All six requirements are achievable with zero new npm dependencies. Motion 12 is already installed and provides `whileInView`, `whileHover`, `staggerChildren`, and `useReducedMotion`. SVG filter effects (`feTurbulence`, `feDisplacementMap`, `feGaussianBlur`) are browser-native with no bundle cost. The compound hover shadow technique uses a `::after` pseudo-element opacity transition — not direct `box-shadow` animation — to stay on the compositor thread.

PERF-03 and PERF-04 are the critical constraints. `whileInView` solves PERF-03 automatically (Intersection Observer disconnects off-screen elements from GPU promotion). PERF-04 requires that hover effects are wrapped in the `(hover: hover) and (pointer: fine)` media query so touch-only devices receive no broken parallax or stuck-hover states.

**Primary recommendation:** Wrap GalleryGrid cards in `motion.div` with `whileInView` first (GLRY-01, PERF-03) before adding hover effects (GLRY-02) so the scroll reveal is verified working before layering hover complexity.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion (motion/react) | ^12.36.0 (installed) | `whileInView`, `whileHover`, `staggerChildren`, `useReducedMotion` | Zero additional install; provides compositor-thread animations via Web Animations API |
| Tailwind CSS | ^4.1.11 (installed) | Utility classes for hover state visual tokens, `group-hover` | Already configured with brand tokens |
| Browser SVG filters | native | `feGaussianBlur`, `feDisplacementMap`, `feTurbulence` for ink bleed | Zero bundle cost; hardware-accelerated on modern browsers |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useReducedMotion` (from motion/react) | 12.36.0 | Disable stagger + hover animations for prefers-reduced-motion users | Gate GLRY-01, GLRY-02, INTR-01, INTR-02 behind this hook |

### No New Dependencies

This phase requires no `npm install`. All requirements are met by:
- Existing: `motion` ^12.36.0, `tailwindcss` ^4.1.11
- Browser native: SVG filter primitives

**Installation:** No new packages needed.

---

## Architecture Patterns

### Files to Modify

```
src/
├── components/frontend/
│   ├── GalleryGrid.tsx        ← Add whileInView + whileHover to each card div
│   └── IntroAnimation.tsx     ← Thicker strokes, SVG filter defs, letter-split name reveal
└── app/globals.css            ← Add .gallery-card::after shadow pseudo-element rule
```

### Pattern 1: Scroll-Reveal with whileInView + Per-Card Stagger

**What:** Each gallery card `div` becomes a `motion.div`. The `whileInView` prop triggers the entrance animation when the card enters the viewport. `viewport={{ once: true }}` disconnects the Intersection Observer after the animation fires, preventing re-animation and eliminating the observer's memory cost for off-screen cards.

**Stagger mechanism:** Use index-based `transition.delay` rather than a parent `staggerChildren` variant — because `react-masonry-css` renders into three separate column containers, a single parent `variants` stagger cannot span columns. Per-card `delay: index * 0.07` replicates the visual stagger across columns.

**When to use:** All gallery cards. Scope: GLRY-01, PERF-03.

```tsx
// Source: motion.dev/docs/react-scroll-animations (verified via WebSearch cross-ref)
// Applied per-card inside GalleryGrid.tsx sorted.map():

<motion.div
  key={piece.id}
  className="relative group cursor-pointer overflow-hidden rounded-sm"
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.07 }}
  onClick={...}
>
  {/* existing Image + overlay */}
</motion.div>
```

**Performance note:** `viewport={{ once: true }}` is critical for PERF-03. Without `once: true`, every card retains an active Intersection Observer. With it, the observer disconnects after first reveal and GPU layers are not continuously promoted for off-screen elements.

### Pattern 2: Compound Hover Effect (GLRY-02)

**What:** Three simultaneous effects on hover — scale lift, shadow deepening, and gradient opacity increase. Scale and gradient use Motion's `whileHover`. Shadow uses the `::after` pseudo-element opacity trick (avoids direct `box-shadow` animation which triggers repaints on every frame).

**Shadow technique (HIGH confidence — Tobias Ahlin, verified):** Apply the target shadow in CSS on a `::after` pseudo-element at `opacity: 0`. On hover, transition only the `opacity` to 1. This keeps the compositor thread (transform + opacity only) instead of triggering layout/paint on every frame.

**Touch gate (PERF-04):** `whileHover` only fires on `(hover: hover)` devices naturally in the browser, but the Tailwind `group-hover:` utilities also need the `@media (hover: hover)` gate in globals.css to prevent stuck-hover states on touch.

```tsx
// GalleryGrid.tsx — motion.div replaces plain div for each card
<motion.div
  key={piece.id}
  className="gallery-card relative group cursor-pointer overflow-hidden rounded-sm"
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.07 }}
  whileHover={{ scale: 1.025 }}
  // Note: scale transition is separate from entrance transition
  // Motion applies whileHover transition via default spring unless overridden
  onClick={...}
>
```

```css
/* globals.css — shadow pseudo-element, gated to hover-capable devices */
@media (hover: hover) and (pointer: fine) {
  .gallery-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 2px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 2px 8px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  .gallery-card:hover::after {
    opacity: 1;
  }
}
```

The existing gradient overlay in `GalleryGrid.tsx` (line 79) uses `opacity-0 group-hover:opacity-100 transition-opacity` — this already handles the gradient depth lift and requires no Motion changes.

### Pattern 3: SVG Ink Stroke Thickening + Filter (INTR-01)

**What:** Increase `strokeWidth` on existing `motion.path` elements from 1.5-3px to 5-12px. Add a `<defs>` block inside the `<svg>` in `IntroAnimation.tsx` with a filter that combines `feGaussianBlur` (for edge feather/bleed) with a subtle `feDisplacementMap` + `feTurbulence` (for organic edge irregularity). Apply `filter="url(#ink-bleed)"` to each path.

**Filter construction (MEDIUM confidence — verified MDN + Codrops):**

```tsx
// IntroAnimation.tsx — add inside the SVG element, before the paths
<defs>
  <filter
    id="ink-bleed"
    x="-10%"
    y="-10%"
    width="120%"
    height="120%"
    colorInterpolationFilters="sRGB"
  >
    {/* Step 1: Turbulence noise for organic edge variation */}
    <feTurbulence
      type="fractalNoise"
      baseFrequency="0.04 0.08"
      numOctaves="3"
      seed="2"
      result="noise"
    />
    {/* Step 2: Displace the stroke edges using the noise */}
    <feDisplacementMap
      in="SourceGraphic"
      in2="noise"
      scale="6"
      xChannelSelector="R"
      yChannelSelector="G"
      result="displaced"
    />
    {/* Step 3: Soft blur for ink bleed/feather effect */}
    <feGaussianBlur in="displaced" stdDeviation="1.2" />
  </filter>
</defs>
```

Apply to paths:
```tsx
<motion.path
  d="M -50 300 Q 200 100 500 250 T 900 150"
  stroke="#c8c8cc"
  strokeWidth="7"          // Was 2.5 — upgrade to 5-12px range
  strokeLinecap="round"    // Add: round caps feel hand-drawn
  fill="none"
  filter="url(#ink-bleed)" // Add filter reference
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 0.6 }}
  transition={{ duration: 1.2, ease: 'easeInOut', delay: 0 }}
/>
```

**Filter size expansion note:** The `x/y/width/height` on the filter element must be expanded beyond 0%/100% (use `-10%/120%`) to prevent the displaced edge from being clipped at the SVG boundary.

### Pattern 4: Letter-by-Letter Name Reveal (INTR-02)

**What:** Split `"Anna Blomgren"` into individual character spans. Each is a `motion.span` with an `opacity: 0 → 1` + `y: 8 → 0` animation. A parent `motion.span` container uses `staggerChildren: 0.06` variant so letters cascade in from left to right.

**Accessibility pattern (HIGH confidence — frontend.fyi verified):** The full name must be in an `sr-only` span so screen readers read it as a word, not as individual letters. The animated spans use `aria-hidden`.

**Implementation:**

```tsx
// IntroAnimation.tsx — replace the motion.h1 block

const letterVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.08, ease: 'easeOut' },
  },
}

const nameVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 1.5 },
  },
}

// In JSX (replaces motion.h1 with single text child):
<h1 className="font-heading text-text-heading text-5xl md:text-8xl tracking-brand-wide">
  <span className="sr-only">Anna Blomgren</span>
  <motion.span
    aria-hidden
    className="inline-flex flex-wrap justify-center"
    variants={nameVariants}
    initial="hidden"
    animate="visible"
  >
    {"Anna Blomgren".split("").map((char, i) => (
      <motion.span
        key={i}
        className="inline-block"
        variants={letterVariants}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </motion.span>
</h1>
```

**Space handling:** Replace space characters with `\u00A0` (non-breaking space) so the word gap renders correctly as an inline-block span.

**Timing note:** `delayChildren: 1.5` aligns with the existing SVG stroke animations completing at ~1.2-1.5s. The current `motion.h1` uses `delay: 1.5` for the block fade — preserve this delay in `delayChildren`.

### Anti-Patterns to Avoid

- **Parent staggerChildren across Masonry columns:** `react-masonry-css` renders three separate `div.masonry-grid_column` containers. A single `motion.div` wrapping `<Masonry>` with `staggerChildren` will stagger columns, not individual cards. Use per-card `delay: idx * 0.07` instead.
- **Direct box-shadow animation on hover:** Triggers layout + paint on every animation frame. Use the `::after` pseudo-element opacity pattern instead.
- **`whileInView` without `once: true`:** Without `once: true`, the Intersection Observer stays active for every card even after it is visible, maintaining active GPU layers. Always use `viewport={{ once: true }}` for scroll-reveal gallery cards.
- **Applying `filter` on SVG paths without expanding filter region:** A `feDisplacementMap` or `feGaussianBlur` that displaces pixels beyond the element boundary will be clipped silently. Always set `x="-10%" y="-10%" width="120%" height="120%"` on the `<filter>` element.
- **Letter-by-letter animation on headings that repeat on every scroll:** This CLS-adjacent technique is explicitly in scope only for the intro. REQUIREMENTS.md out-of-scope table notes: "Character-by-character type on every heading — CLS issues, annoying on return visits; reserve for intro only."

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Viewport intersection detection | Custom scroll event listener + `getBoundingClientRect()` | `whileInView` (Motion, wraps Intersection Observer) | Scroll listeners fire on main thread; Intersection Observer is off-thread; Motion handles all edge cases (SSR, resize, margin offsets) |
| Stagger timing logic | Manual `setTimeout` chains or CSS `nth-child` delays | `staggerChildren` in Motion variants | CSS nth-child cannot pause between cycles; setTimeout chains don't respect animation cancellation |
| Shadow depth animation | Direct CSS `box-shadow` transition | `::after` pseudo-element + `opacity` transition | Direct shadow animation triggers GPU repaints on every frame; opacity is compositor-only |
| Reduced-motion check | Custom `useEffect` + `window.matchMedia` hook | `useReducedMotion()` from `motion/react` | Already available in the installed bundle; handles SSR hydration correctly |
| Touch device detection | User-agent sniffing | CSS `@media (hover: hover) and (pointer: fine)` | UA strings are unreliable; media queries reflect actual device capability |

**Key insight:** Every problem in this phase has a Motion or CSS-native solution. Custom solutions reimplement solved problems with fewer edge cases handled.

---

## Common Pitfalls

### Pitfall 1: Masonry Stagger Does Not Cascade Across Columns

**What goes wrong:** Placing the `motion.div` wrapper around `<Masonry>` and using `staggerChildren` staggers the three column divs, not individual cards. Cards in column 1 all appear simultaneously, then column 2, then column 3.

**Why it happens:** `react-masonry-css` renders `<div className="masonry-grid_column">` containers internally. A stagger on the Masonry wrapper staggers those column divs, not the card children inside them.

**How to avoid:** Apply `whileInView` and `transition={{ delay: idx * 0.07 }}` directly to each card's `motion.div` using the `idx` from the `sorted.map()` call in `GalleryGrid.tsx`.

**Warning signs:** All cards in a column appear at the same time rather than cascading individually.

### Pitfall 2: GPU Layer Explosion on Mobile (PERF-03)

**What goes wrong:** Using `initial={{ opacity: 0 }}` (or any transform) on all gallery cards causes the browser to promote every card to its own GPU layer at mount. On a gallery with 20+ pieces, this exhausts mobile GPU memory, causing scroll stutter.

**Why it happens:** Motion promotes elements with active animations or `will-change: transform` to composited layers. When all 20+ cards are initialized with transforms at component mount, they are all simultaneously promoted.

**How to avoid:** Use `whileInView` instead of `animate` for gallery cards. `whileInView` only activates when the element enters the viewport — off-screen cards remain in the normal document flow with no GPU layer promotion. `viewport={{ once: true }}` ensures the layer is demoted after the animation ends.

**Warning signs:** Chrome DevTools Layers panel showing 20+ composited layers; scroll becomes < 30fps on throttled mobile profile (Chrome DevTools > Performance > CPU 6x slowdown).

### Pitfall 3: Hover Effects Flicker on Touch Devices (PERF-04)

**What goes wrong:** `whileHover` fires on touch devices when users tap cards (because the tap briefly triggers the hover state), causing a visible flicker of the hover effect before the lightbox opens.

**Why it happens:** Browsers synthesize hover events for touch taps. Motion's `whileHover` responds to the synthesized hover.

**How to avoid:** Gate the CSS shadow `::after` rule behind `@media (hover: hover) and (pointer: fine)`. For the Motion `whileHover` scale, either (a) conditionally omit `whileHover` based on `window.matchMedia('(hover: hover)').matches`, or (b) accept that the scale is negligible on tap-then-dismiss UX.

**Warning signs:** On iOS/Android, tapping a gallery card shows a brief scale-up before the lightbox opens.

### Pitfall 4: SVG Filter Clips Displaced Stroke Edges

**What goes wrong:** The `feDisplacementMap` or `feGaussianBlur` causes stroke pixels to be displaced or blurred outside the element's original bounding box. The filter clips these at the SVG boundary, making the stroke edges look cut off rather than feathered.

**Why it happens:** SVG filter regions default to `x="0%" y="0%" width="100%" height="100%"` — the exact bounding box of the element. Any pixels displaced outside this region are silently clipped.

**How to avoid:** Set `x="-10%" y="-10%" width="120%" height="120%"` on the `<filter>` element to give the filter room to render displaced/blurred pixels outside the original bounds.

**Warning signs:** The stroke ends look as if they were cut with scissors; displacement appears less organic than expected.

### Pitfall 5: Letter-Split Breaks Screen Reader Experience

**What goes wrong:** Splitting "Anna Blomgren" into individual `<span>` elements causes screen readers to spell out individual letters rather than reading the name as a word.

**Why it happens:** Screen readers treat adjacent `<span>` elements as separate text nodes unless they are semantically grouped.

**How to avoid:** Add `<span className="sr-only">Anna Blomgren</span>` immediately before the animated `motion.span` container, and add `aria-hidden` to the `motion.span` that contains the split characters.

---

## Code Examples

Verified patterns from official or credibly cross-referenced sources:

### whileInView Card with Per-Card Stagger Delay

```tsx
// Source: motion.dev/docs/react-scroll-animations (WebSearch verified)
// Applied in GalleryGrid.tsx sorted.map((piece, idx) => ...)

<motion.div
  key={piece.id}
  className="gallery-card relative group cursor-pointer overflow-hidden rounded-sm"
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.07 }}
  whileHover={{ scale: 1.025 }}
  onClick={() => { setLightboxIndex(idx); setLightboxOpen(true) }}
>
  {/* existing Image and hover overlay div — unchanged */}
</motion.div>
```

### Letter-by-Letter Stagger

```tsx
// Source: frontend.fyi staggered text tutorial (verified full code example)

const letterVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.08, ease: 'easeOut' } },
}

const nameVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 1.5 } },
}

// JSX:
<h1 className="font-heading text-text-heading text-5xl md:text-8xl tracking-brand-wide">
  <span className="sr-only">Anna Blomgren</span>
  <motion.span aria-hidden className="inline-flex flex-wrap justify-center" variants={nameVariants} initial="hidden" animate="visible">
    {"Anna Blomgren".split("").map((char, i) => (
      <motion.span key={i} className="inline-block" variants={letterVariants}>
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </motion.span>
</h1>
```

### SVG Ink Bleed Filter Definition

```tsx
// Source: MDN feTurbulence + Codrops feTurbulence texture article (verified)
// Inside the <svg> in IntroAnimation.tsx, before the paths

<defs>
  <filter
    id="ink-bleed"
    x="-10%"
    y="-10%"
    width="120%"
    height="120%"
    colorInterpolationFilters="sRGB"
  >
    <feTurbulence
      type="fractalNoise"
      baseFrequency="0.04 0.08"
      numOctaves="3"
      seed="2"
      result="noise"
    />
    <feDisplacementMap
      in="SourceGraphic"
      in2="noise"
      scale="6"
      xChannelSelector="R"
      yChannelSelector="G"
      result="displaced"
    />
    <feGaussianBlur in="displaced" stdDeviation="1.2" />
  </filter>
</defs>
```

### Shadow Pseudo-Element (Compositor-Safe)

```css
/* Source: Tobias Ahlin "How to animate box-shadow" (verified technique) */
/* globals.css */

@media (hover: hover) and (pointer: fine) {
  .gallery-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 2px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 2px 8px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    z-index: 1;
  }
  .gallery-card:hover::after {
    opacity: 1;
  }
}
```

### MotionConfig for prefers-reduced-motion (PERF-01 prep)

```tsx
// Source: motion.dev/docs/react-accessibility (WebSearch verified)
// In src/app/(frontend)/layout.tsx (server component) — wrap with MotionConfig

import { MotionConfig } from 'motion/react'

// MotionConfig reducedMotion="user" automatically disables transform animations
// when the OS prefers-reduced-motion is set. Opacity fades still play.
<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

**Note:** `MotionConfig` is a client boundary component. In Next.js App Router, layout.tsx is a server component. Wrapping with `MotionConfig` requires either making layout a client component or creating a thin `"use client"` wrapper component. The PERF-01 requirement is officially Phase 6, but `MotionConfig` placement should be decided in Phase 5 to avoid double-refactor.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package import | `motion/react` import from `motion` package | Motion v11 (2024) | Package was renamed; project already uses correct import `from 'motion/react'` |
| `IntersectionObserver` polyfill for `whileInView` | No polyfill needed | 2022+ | 98%+ browser support; no polyfill required in 2026 |
| `animate` with all cards mounted | `whileInView` with `viewport={{ once: true }}` | Standard practice 2023+ | Prevents GPU layer explosion on mobile |
| `nth-child` CSS delays for stagger | `staggerChildren` in Motion variants | 2020+ | CSS nth-child cannot handle dynamic lists or pause between cycles |
| UA sniffing for touch detection | `@media (hover: hover) and (pointer: fine)` | CSS Media Queries Level 5 | UA strings unreliable; media queries reflect actual hardware capability |

**Deprecated/outdated:**
- `AnimateSharedLayout`: Replaced by `layoutId` prop directly on motion components. Not relevant here.
- `useViewportScroll`: Replaced by `useScroll`. Not used in Phase 5.

---

## Open Questions

1. **MotionConfig reducedMotion placement**
   - What we know: PERF-01 (all animations respect prefers-reduced-motion) is officially Phase 6, but `MotionConfig` must be placed in a client-boundary component that wraps the entire frontend layout
   - What's unclear: Whether to add a `"use client"` provider wrapper in Phase 5 (as a dependency for Phase 5 whileInView/whileHover) or defer to Phase 6
   - Recommendation: Phase 5 should add a minimal `<MotionConfig reducedMotion="user">` provider in Phase 5 since GLRY-01 and GLRY-02 need it. Create `src/components/frontend/MotionProvider.tsx` as a thin `"use client"` wrapper — zero visual change, unlocks correct reduced-motion behavior immediately.

2. **SVG filter performance on mobile for IntroAnimation**
   - What we know: The `feDisplacementMap` + `feGaussianBlur` filter runs on the GPU. It applies to a full-viewport SVG during the intro (shown only once). After intro exits, the SVG is removed from DOM.
   - What's unclear: Whether the filter causes a frame-rate drop during the initial `pathLength` animation on low-end Android
   - Recommendation: Start with `feGaussianBlur stdDeviation="1.2"` only (simpler filter). Add `feDisplacementMap` as an enhancement. If mobile perf is acceptable (verify on Chrome DevTools mobile throttle), keep both. If not, fall back to `feGaussianBlur` only.

3. **Masonry index vs visual order for stagger delay**
   - What we know: `sorted.map((piece, idx) => ...)` provides a linear index. Cards distribute across 3 columns in masonry order. The stagger with `idx * 0.07` delays based on data order, not visual column order.
   - What's unclear: Whether the stagger will look visually coherent given masonry's column-first layout
   - Recommendation: Linear index stagger still creates a left-to-right-ish reveal because Masonry distributes cards left-to-right. Acceptable. If visual order looks wrong in testing, cap delay at `Math.min(idx, 8) * 0.07` to prevent the last cards having a 1.4s+ delay on large galleries.

---

## Sources

### Primary (HIGH confidence)

- motion.dev/docs/react-scroll-animations — whileInView, viewport options, once behavior (WebSearch verified, official docs)
- motion.dev/docs/stagger — staggerChildren API (WebSearch title confirmed; page JS-rendered, content verified via secondary sources)
- frontend.fyi/tutorials/staggered-text-animations-with-framer-motion — letter-by-letter full code example (WebFetch retrieved complete code)
- tobiasahlin.com/blog/how-to-animate-box-shadow — ::after pseudo-element shadow technique (WebFetch verified technique)
- developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence — MDN official SVG filter spec
- developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap — MDN official spec
- developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur — MDN official spec

### Secondary (MEDIUM confidence)

- tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence — feTurbulence + feDisplacementMap combination code (WebFetch verified code examples)
- css-irl.info/detecting-hover-capable-devices — @media (hover: hover) and (pointer: fine) pattern (multiple sources agree, W3C spec backed)
- joshwcomeau.com/react/prefers-reduced-motion — custom usePrefersReducedMotion hook (WebFetch verified implementation)
- motion.dev docs WebSearch results — whileInView + staggerChildren patterns confirmed across multiple independent tutorial sources

### Tertiary (LOW confidence)

- Motion performance claim "bypasses React render cycle entirely" — stated in WebSearch summary, not directly verified via Context7 or official docs page (page JS-rendered). Consistent with known compositor-thread behavior of Web Animations API which Motion uses.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — motion 12 already installed; all required APIs (whileInView, whileHover, staggerChildren, useReducedMotion) are stable and verified across multiple sources
- Architecture: HIGH — GalleryGrid.tsx and IntroAnimation.tsx are fully read; patterns map directly to existing code structure with minimal refactoring
- SVG filter patterns: MEDIUM — core approach (feTurbulence + feDisplacementMap + feGaussianBlur) verified via MDN + Codrops; exact values (scale=6, stdDeviation=1.2) are tunable starting points, not guaranteed final values
- Compound hover: HIGH — ::after pseudo-element technique verified by authoritative source (Tobias Ahlin); browser support universal
- Touch detection: HIGH — @media (hover: hover) and (pointer: fine) is W3C Media Queries Level 5 spec, widely supported

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (Motion 12 is stable; SVG filters are browser-native)
