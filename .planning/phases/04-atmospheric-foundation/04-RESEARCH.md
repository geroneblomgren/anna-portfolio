# Phase 4: Atmospheric Foundation - Research

**Researched:** 2026-03-14
**Domain:** CSS texture overlays (film grain, vignette), Tailwind v4 typography customization, Motion AnimatePresence refactor
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ATMO-01 | Site displays a persistent film grain noise overlay across all pages, creating textured graphite depth instead of flat black | CSS `body::after` + inline SVG `feTurbulence` pattern fully documented; pointer-events pattern confirmed |
| ATMO-02 | Site displays a persistent vignette overlay darkening screen edges to focus the eye on central content | CSS radial-gradient `body::before` or second `::after` pseudo-element; no JS needed |
| ATMO-03 | Typography uses aggressive letter-spacing, size contrast, and strategic italic on Bodoni Moda headings — commanding, not cautious | Tailwind v4 `@theme` custom `--tracking-*` tokens + arbitrary value syntax `tracking-[0.25em]` confirmed; font already loaded in weights 400-900 with italic |
| INTR-03 | Intro maintains skip, localStorage memory, and prefers-reduced-motion support from v1.0 after AnimatePresence refactor | Refactor pattern identified: remove `AnimatePresence` from `IntroAnimation`, use single layout-level wrapper with `useState`-gated `motion.div`; all behavior preserved |
</phase_requirements>

---

## Summary

Phase 4 is the atmospheric foundation for v1.1. It must be completed before any motion effects are layered on top in Phases 5-7 — film grain and vignette are persistent full-viewport overlays that sit above all other content at `z-index: 9999`, and they will interact with every GPU compositor layer added later. Critically, this phase also contains the **AnimatePresence refactor** (INTR-03): the existing `IntroAnimation` component owns its own `AnimatePresence`, which is a landmine for every phase that follows. It must be dismantled in this phase before anything else.

All four requirements are achievable with zero new npm dependencies. Film grain and vignette are pure CSS in `globals.css`. Typography changes are Tailwind v4 `@theme` token additions plus class updates on existing headings. The `AnimatePresence` refactor is surgical: remove the wrapper from `IntroAnimation`, make `IntroAnimation` a pure render-gated component, and verify the intro-to-gallery transition still works. The project already has Motion 12, Tailwind v4, Bodoni Moda (weights 400-900 with italic), and the cold graphite palette — Phase 4 assembles these existing pieces into an atmospheric layer.

**Primary recommendation:** Start with the `AnimatePresence` refactor (INTR-03) first. It is a structural prerequisite — any layout-level wrapper added before this refactor will produce nested-`AnimatePresence` bugs that are hard to diagnose and will break Phases 5-7.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.36.0 (installed) | `AnimatePresence`, `motion.div` for intro fade | Already in bundle; `AnimatePresence` is the only correct way to orchestrate exit animations in React |
| Tailwind CSS | ^4.1.11 (installed) | Typography tokens, utility classes | `@theme` custom properties make brand letter-spacing tokens available as utilities |
| CSS `feTurbulence` | Browser native | Film grain texture overlay | Zero JS, zero bundle cost, universal browser support (Chrome 35+, Firefox 4+, Safari 9.1+) |
| CSS `radial-gradient` | Browser native | Vignette overlay | Zero JS, GPU-composited, non-blocking |
| Next.js Google Fonts | via `next/font` (installed) | Bodoni Moda variable font | Already loaded: weights 400-900, normal + italic. No additional import. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useReducedMotion` (from motion) | 12.36.0 | SSR-safe prefers-reduced-motion check | Use in `IntroAnimation` to guard skip behavior — already used correctly |

### No New Dependencies

This phase requires no new `npm install`. All four requirements are met by:
- Existing: `motion`, `tailwindcss`, `next/font`
- Browser APIs: CSS pseudo-elements, SVG filters, CSS gradients

---

## Architecture Patterns

### Recommended File Changes

```
src/
├── app/
│   ├── globals.css                   ← Add film grain + vignette CSS (::before, ::after on body)
│   └── layout.tsx                    ← No change (font config already correct)
├── app/(frontend)/
│   ├── layout.tsx                    ← Remains server component; no AnimatePresence here
│   └── page.tsx                      ← No change (IntroAnimation wrapper stays)
└── components/frontend/
    └── IntroAnimation.tsx            ← Refactor: remove AnimatePresence, use useState gate
```

### Pattern 1: Film Grain — CSS body::after with Inline SVG feTurbulence

**What:** A `body::after` pseudo-element carries an inline SVG `feTurbulence` filter as its `background-image`. A 5-step `@keyframes grain` animation shifts its position by small random offsets to create organic flicker at ~5fps.

**When to use:** Always on — persistent across every page as a full-viewport overlay.

**Non-blocking contract:** `pointer-events: none` is mandatory. `z-index: 9999` keeps it above all content visually, but `pointer-events: none` ensures it is invisible to click/tap events.

**GPU layer note:** Because this sits at `z-index: 9999` and covers the full viewport, it will promote all underlying elements to compositor layers (implicit compositing). Mitigation: keep grain `z-index` as low as it can be while still being above content (test 1 vs 9999), and apply `isolation: isolate` to the gallery container so masonry cards form their own compositing context.

```css
/* Source: .planning/research/STACK.md (verified CSS-Tricks technique) */
/* Add to src/app/globals.css */

body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
  animation: grain 0.2s steps(1) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  20%  { transform: translate(-2%, -3%); }
  40%  { transform: translate(2%,  2%); }
  60%  { transform: translate(-1%, 3%); }
  80%  { transform: translate(3%, -1%); }
}

@media (prefers-reduced-motion: reduce) {
  body::after {
    animation: none;
    opacity: 0.02;
  }
}
```

**Opacity target:** 0.03–0.04 reads as cinematic texture on most displays. On OLED screens (which have absolute black), grain is most perceptible — verify at this opacity on an OLED device or Chrome DevTools "OLED" preset. Max 0.05 before it reads as noise/dirty.

### Pattern 2: Vignette — CSS body::before with Radial Gradient

**What:** A `body::before` pseudo-element covers the full viewport with a radial gradient that is transparent at center and darkens toward the edges. No animation needed — it is static.

**When to use:** Always on — same as grain, persistent across all pages.

```css
/* Source: verified multi-source CSS pattern */
/* Add to src/app/globals.css */

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998; /* Below grain, above content */
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.45) 100%
  );
}
```

**Tuning:** The transition point (50%) and edge darkness (0.45 alpha) are starting values. For the `#0a0a0a` background, a softer gradient (50%→85%→0.35 alpha) may be more appropriate — prevents the edges from going full black-on-black undetectably. Verify visually with gallery content in the corners.

**z-index ordering:** grain (`::after`) at 9999, vignette (`::before`) at 9998. Both use `pointer-events: none`.

### Pattern 3: IntroAnimation AnimatePresence Refactor (INTR-03)

**What:** Remove the `AnimatePresence` wrapper from `IntroAnimation`. The component becomes a `useState`-gated conditional render. A single `AnimatePresence` is added at the `(frontend)` layout level (or left absent in Phase 4, added in Phase 7 when page transitions are implemented).

**Why this order matters:** The existing `IntroAnimation` wraps `children` (the gallery) inside its own `AnimatePresence`. Any outer `AnimatePresence` added later (for page transitions in Phase 7) would create nested instances, causing Motion to lose track of unmount orchestration — the confirmed bug documented in `motiondivision/motion #2387`. Fix it now so Phases 5-7 inherit a clean foundation.

**Current `IntroAnimation` problem (line 37):**
```tsx
// CURRENT — has AnimatePresence wrapping both intro and gallery
<AnimatePresence mode="wait">
  {showIntro && !done ? (
    <motion.div key="intro" ...>...</motion.div>
  ) : done ? (
    <motion.div key="gallery" ...>{children}</motion.div>
  ) : null}
</AnimatePresence>
```

**Refactored pattern (no AnimatePresence owned by IntroAnimation):**
```tsx
// Source: .planning/research/PITFALLS.md — Pitfall 1 resolution
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

export function IntroAnimation({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('intro-seen')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!seen && !reduced) {
      setShowIntro(true)
      const timer = setTimeout(() => skip(), 3500)
      return () => clearTimeout(timer)
    } else {
      setDone(true)
    }
  }, [])

  function skip() {
    localStorage.setItem('intro-seen', '1')
    setShowIntro(false)
    setDone(true)
  }

  // Null state: neither intro nor children — renders nothing during hydration
  if (!showIntro && !done) return null

  // Intro state: full-screen overlay, no AnimatePresence
  if (showIntro) {
    return (
      <motion.div
        className="fixed inset-0 bg-bg z-50 flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* SVG strokes + text reveal — unchanged from v1.0 */}
        {/* ... existing SVG and text content ... */}
        <button
          onClick={skip}
          className="fixed bottom-6 right-6 text-text-muted text-sm font-body hover:text-accent transition-colors cursor-pointer z-50"
        >
          Skip
        </button>
      </motion.div>
    )
  }

  // Done state: render children (gallery) with fade-in
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
```

**Behavior preserved:** skip button calls `skip()`, localStorage key `intro-seen` is set, `prefers-reduced-motion` check bypasses intro and goes directly to `setDone(true)` — all identical to v1.0.

**Critical:** Without an `AnimatePresence` owner, the `exit={{ opacity: 0 }}` on the intro `motion.div` will not fire until a parent `AnimatePresence` is added (Phase 7). For Phase 4, the intro simply disappears when `showIntro` flips to false. This is acceptable — the exit fade will be wired up properly when the layout-level `AnimatePresence` is added in Phase 7. Document this as a known limitation of Phase 4.

### Pattern 4: Tailwind v4 Typography Tokens (ATMO-03)

**What:** Add brand letter-spacing tokens to `@theme` in `globals.css`. Apply to all `font-heading` elements across gallery intro, about, and contact pages.

**Current state:** Bodoni Moda is loaded with weights 400-900, normal and italic, as `--font-bodoni-moda`. Headings use `font-heading` class. No custom tracking tokens exist yet.

```css
/* Source: https://tailwindcss.com/docs/letter-spacing — verified HIGH confidence */
/* Add to @theme in src/app/globals.css */

@theme {
  /* ... existing color tokens ... */

  /* Typography attitude — Bodoni Moda commanding letter-spacing */
  --tracking-brand-tight: -0.02em;   /* Tight for large display headings */
  --tracking-brand-wide:  0.12em;    /* Wide for sub-headings and labels */
  --tracking-brand-widest: 0.2em;    /* Widest for all-caps decorative labels */
}
```

**Usage pattern — commanding heading:**
```tsx
{/* Source: Tailwind v4 docs — tracking-[value] arbitrary syntax */}
<h1 className="font-heading text-text-heading text-6xl md:text-8xl tracking-[0.12em] italic">
  Anna Blomgren
</h1>
```

**Usage pattern — section label:**
```tsx
<h2 className="font-heading text-text-heading text-3xl md:text-5xl tracking-brand-wide uppercase">
  Artist Statement
</h2>
```

**Pages to update:**
- `src/app/(frontend)/contact/page.tsx` — `h1` "Get in Touch" (currently `text-4xl md:text-5xl`, no tracking)
- `src/app/(frontend)/about/page.tsx` — `h2` elements "Artist Statement" and "Contact" (currently `text-2xl`, no tracking)
- `src/components/frontend/IntroAnimation.tsx` — `h1` "Anna Blomgren" and `p` "Artist & Illustrator"

**Size contrast rule:** The visual difference between the largest heading and body text should be dramatic — minimum 3:1 size ratio. Current contact `h1` is `text-4xl` (2.25rem) against `text-base` body. Upgrade to `text-5xl md:text-7xl` to widen the contrast.

**Italic use:** Strategic, not decorative. Italicize the secondary line ("Artist & Illustrator", taglines) rather than the primary name — this creates hierarchy through contrast, not chaos.

### Anti-Patterns to Avoid

- **Nested AnimatePresence:** Never add an outer `AnimatePresence` wrapper while `IntroAnimation` still owns its own. Refactor first.
- **Grain on `z-index` that triggers implicit compositing explosion:** Test grain alone in Chrome DevTools Layers panel. If layer count doubles, apply `isolation: isolate` to gallery container.
- **`animation: grain` without `prefers-reduced-motion` guard:** The grain animation is 5fps but still runs continuously. Add `@media (prefers-reduced-motion: reduce) { body::after { animation: none; } }`.
- **Grain opacity above 0.05:** Reads as visual noise/dirty on OLED at higher opacity. The design calls for texture, not degradation.
- **Typography changes without checking RichText headings:** The `about` page uses Payload RichText with inline heading styles (`[&_h2]:text-2xl`). Custom typography tokens applied globally via utility classes will NOT propagate into `[&_h2]:` Tailwind prose selectors — those need separate updates.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Film grain texture | JavaScript canvas pixel manipulation, PNG generation on the fly | CSS `body::after` + inline SVG `feTurbulence` | Zero JS, zero bundle cost, runs on GPU paint thread not main thread |
| Vignette effect | Canvas `radialGradient` draw loop, WebGL shader | CSS `radial-gradient` on a fixed pseudo-element | Same visual result, composited off-thread, no frame budget cost |
| AnimatePresence exit sequencing | Custom `setTimeout` unmount delays, CSS transition hacks | `motion.div` with `exit` prop under single `AnimatePresence` | Motion handles React lifecycle correctly; DIY creates race conditions with React 19 concurrent rendering |
| Letter-spacing design tokens | Hardcoded `style={{ letterSpacing: '0.12em' }}` inline on every heading | Tailwind `@theme --tracking-*` + utility class | Tokens are editable in one place, work with responsive variants, compatible with arbitrary syntax |

**Key insight:** Phase 4's entire visual transformation is achievable with CSS pseudo-elements and Tailwind tokens. No JavaScript involved in rendering grain, vignette, or typography changes. The only JavaScript change is the `AnimatePresence` refactor in `IntroAnimation.tsx`.

---

## Common Pitfalls

### Pitfall 1: Nested AnimatePresence Breaks Intro-to-Gallery Transition

**What goes wrong:** Gallery renders blank after intro, or React throws `TypeError: Cannot read properties of undefined` during navigation from gallery to about.

**Why it happens:** The current `IntroAnimation.tsx` owns an `AnimatePresence`. If any outer animation wrapper (even from Phase 7's template.tsx setup) is added before this is resolved, two `AnimatePresence` instances fight over the unmount sequence — confirmed bug in `motiondivision/motion #2387`.

**How to avoid:** Refactor `IntroAnimation` as described in Pattern 3 above. This is the first task in Phase 4. Verify the intro plays and fades correctly before touching typography or CSS overlays.

**Warning signs:** Gallery blank after intro completes; white flash between intro and gallery.

### Pitfall 2: Grain Overlay Doubles GPU Layer Count (Implicit Compositing)

**What goes wrong:** After adding the `body::after` grain overlay with `z-index: 9999`, Chrome DevTools Layers panel shows 2-3x more composite layers. Gallery scroll drops from 60fps to 30fps. Phase 5 GPU budget is already blown before any animations are added.

**Why it happens:** A fixed-position element at high z-index that overlaps composite layers forces the browser to also promote every overlapping element (implicit compositing). The grain overlay covers the entire viewport — it overlaps everything.

**How to avoid:**
1. Test grain in isolation on Layers panel before combining with anything else
2. Apply `isolation: isolate` on the masonry gallery container (`<div className="masonry-grid">` parent) — contains compositing effects within that subtree
3. Keep grain `z-index` no higher than necessary; try `z-index: 100` (still above content) vs `z-index: 9999` — if either works visually, use the lower value

**Warning signs:** Layers panel shows "composited reasons: overlap" on gallery card layers after grain is added.

### Pitfall 3: RichText Heading Styles Not Updated

**What goes wrong:** Bodoni Moda aggressive letter-spacing looks commanding on the Contact `h1` and in the Intro animation, but `h2` elements inside the About page's RichText blocks look unchanged.

**Why it happens:** The `about/page.tsx` applies heading styles via Tailwind's `[&_h2]:` arbitrary variant selectors directly on the container div (`[&_h2]:text-2xl [&_h2]:font-heading`). These are static Tailwind utilities that don't inherit the new `tracking-brand-wide` token unless explicitly added to the selector chain.

**How to avoid:** When updating About page heading styles, add the tracking utility to the same `[&_h2]:` chain: `[&_h2]:tracking-brand-wide`.

**Warning signs:** About page h2 elements have no letter-spacing while contact and intro headings look aggressive.

### Pitfall 4: Exit Animation on `motion.div` Without AnimatePresence Owner

**What goes wrong:** After refactoring `IntroAnimation`, the intro overlay has `exit={{ opacity: 0 }}` but no `AnimatePresence` to trigger it. When `showIntro` becomes false, the component unmounts immediately with no fade — the intro snaps to the gallery instead of fading out.

**Why it happens:** Motion's `exit` prop only executes when the component is a descendant of `AnimatePresence`. Without it, `exit` is ignored.

**How to avoid:** Two options:
1. Accept the snap transition in Phase 4 (the exit will be wired in Phase 7 when layout-level `AnimatePresence` is added)
2. Wrap only `IntroAnimation`'s render output in a local `AnimatePresence` with `mode="sync"` — but leave no `AnimatePresence` wrapping `children` (the gallery)

Option 1 is recommended for Phase 4. Document it as a known limitation. The Phase 7 template.tsx `AnimatePresence` will be the owner.

**Warning signs:** Intro snaps to gallery with no transition.

### Pitfall 5: Grain Animation Not Disabled Under prefers-reduced-motion

**What goes wrong:** The `@keyframes grain` animation runs at ~5fps indefinitely. Even at 5fps, WCAG 2.3.3 considers any animation that the user hasn't initiated to be a potential issue for users with vestibular disorders.

**How to avoid:** Add the reduced-motion guard shown in Pattern 1. Fall back to a static grain texture (animation removed, opacity halved) — still atmospheric without motion.

---

## Code Examples

Verified patterns from project research:

### Complete Film Grain CSS Block

```css
/* Source: .planning/research/STACK.md, CSS-Tricks film grain technique */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
  animation: grain 0.2s steps(1) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  20%  { transform: translate(-2%, -3%); }
  40%  { transform: translate(2%,  2%); }
  60%  { transform: translate(-1%, 3%); }
  80%  { transform: translate(3%, -1%); }
}

@media (prefers-reduced-motion: reduce) {
  body::after {
    animation: none;
    opacity: 0.02;
  }
}
```

### Complete Vignette CSS Block

```css
/* Source: multi-source CSS vignette technique */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.45) 100%
  );
}
```

### Tailwind v4 @theme Typography Token Addition

```css
/* Source: https://tailwindcss.com/docs/letter-spacing — HIGH confidence */
/* Add inside existing @theme block in globals.css */
@theme {
  /* ... existing tokens ... */
  --tracking-brand-tight:   -0.02em;
  --tracking-brand-wide:    0.12em;
  --tracking-brand-widest:  0.2em;
}
```

### Contact Page h1 Typography Upgrade

```tsx
{/* Before */}
<h1 className="font-heading text-text-heading text-4xl md:text-5xl mb-4">
  Get in Touch
</h1>

{/* After — commanding, not cautious */}
<h1 className="font-heading text-text-heading text-5xl md:text-7xl tracking-brand-wide mb-4">
  Get in Touch
</h1>
```

### About Page RichText Heading Chain Update

```tsx
{/* Before */}
[&_h2]:text-2xl [&_h2]:font-heading

{/* After — add tracking to chain */}
[&_h2]:text-2xl [&_h2]:font-heading [&_h2]:tracking-brand-wide
```

### IntroAnimation h1 Upgrade

```tsx
{/* Before */}
<motion.h1
  className="font-heading text-text-heading text-5xl md:text-7xl"
  ...
>
  Anna Blomgren
</motion.h1>

{/* After */}
<motion.h1
  className="font-heading text-text-heading text-5xl md:text-8xl tracking-brand-wide"
  ...
>
  Anna Blomgren
</motion.h1>
<motion.p
  className="font-heading text-accent text-xl italic tracking-brand-widest mt-3 uppercase"
  ...
>
  Artist &amp; Illustrator
</motion.p>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PNG noise texture file | Inline SVG `feTurbulence` data URI in CSS | 2019+ | Zero HTTP request, no sprite management |
| `background-attachment: fixed` for parallax vignette | `position: fixed; background: radial-gradient` | CSS3 era | iOS Safari compatible; `background-attachment: fixed` is broken on iOS WebKit |
| Nested `AnimatePresence` per feature | Single `AnimatePresence` at layout level | Framer Motion v5+ | Prevents double-unmount bugs; enables coordinated exit animations |
| Hardcoded `style={{ letterSpacing }}` | Tailwind `@theme` custom tracking tokens | Tailwind v4 | Single source of truth, responsive variants work |

**Deprecated/outdated:**
- `grained.js`: jQuery-era, no TypeScript, 6+ years unmaintained — use CSS feTurbulence
- `AnimatePresence` owned by individual feature components: causes nesting conflicts — use single layout-level owner
- `background-attachment: fixed` for any fixed overlay: breaks on iOS Safari — use `position: fixed` instead

---

## Open Questions

1. **Grain z-index and implicit compositing severity**
   - What we know: Fixed z-index 9999 grain will trigger implicit compositing for all elements below it
   - What's unclear: How severe the layer count increase will be in this specific project (masonry grid with 20-40 cards)
   - Recommendation: Test with Chrome DevTools Layers panel immediately after adding grain, before Phase 5 adds any card animations. If layer count exceeds 15, apply `isolation: isolate` on gallery container.

2. **Vignette opacity on the specific #0a0a0a background**
   - What we know: `rgba(0,0,0,0.45)` is a typical vignette edge value
   - What's unclear: On an almost-black background (#0a0a0a), a 0.45 black vignette may be imperceptible — or it may be perfectly subtle
   - Recommendation: Start at 0.45, verify visually on an actual browser with content in corners. May need to increase to 0.6+ or shift to a slight warm desaturated dark to be visible against the near-black.

3. **Intro exit transition in Phase 4 (no AnimatePresence owner yet)**
   - What we know: After refactoring `IntroAnimation` to remove its `AnimatePresence`, the `exit` prop won't fire until Phase 7 adds the layout-level `AnimatePresence`
   - What's unclear: Whether the snap-cut from intro to gallery is acceptable during Phase 4 testing
   - Recommendation: Accept the snap in Phase 4. Document it explicitly. The Phase 7 `template.tsx` `AnimatePresence` will restore the fade. As a short-term alternative: wrap only the intro overlay div (not children) in a local `AnimatePresence` with no children key — but this complicates Phase 7 wiring.

---

## Sources

### Primary (HIGH confidence)

- `.planning/research/STACK.md` — v1.1 stack decisions, film grain CSS pattern, no-new-deps decision, AnimatePresence refactor guidance (project-internal research, 2026-03-14)
- `.planning/research/PITFALLS.md` — AnimatePresence conflict documentation, GPU layer explosion, implicit compositing pitfall (project-internal research, 2026-03-14)
- [https://tailwindcss.com/docs/letter-spacing](https://tailwindcss.com/docs/letter-spacing) — Tailwind v4 tracking utilities and `@theme` custom token syntax (verified 2026-03-14)
- [MDN: feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence) — universal browser support confirmed (Chrome 35+, Firefox 4+, Safari 9.1+)
- `src/app/globals.css` — existing @theme tokens, color system, font variables (project source)
- `src/app/layout.tsx` — Bodoni Moda loaded weights 400-900, normal + italic (project source)
- `src/components/frontend/IntroAnimation.tsx` — current AnimatePresence structure, behavior to preserve (project source)

### Secondary (MEDIUM confidence)

- [CSS-Tricks: Grainy Gradients](https://css-tricks.com/grainy-gradients/) — feTurbulence grain CSS technique with animation
- [freecodecamp.org: Grainy CSS Backgrounds Using SVG Filters](https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/) — inline SVG approach confirmed
- [motiondivision/motion #2387](https://github.com/framer/motion/issues/2387) — nested AnimatePresence double-unmount confirmed bug

### Tertiary (LOW confidence)

- None for this phase — all critical claims verified from primary sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tooling already installed and validated in v1.0; no new dependencies
- Architecture: HIGH — patterns derived from verified project-internal research + official Tailwind docs
- Pitfalls: HIGH — AnimatePresence issue documented against confirmed GitHub issue; GPU layer pitfall verified against web.dev and Chrome DevTools guidance
- Typography: HIGH — Tailwind v4 @theme syntax confirmed from official docs; Bodoni Moda already loaded

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain — CSS pseudo-elements, Tailwind v4 tokens, Motion AnimatePresence patterns are not fast-moving)
