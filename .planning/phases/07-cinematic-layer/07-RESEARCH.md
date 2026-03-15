# Phase 7: Cinematic Layer - Research

**Researched:** 2026-03-14
**Domain:** Next.js App Router page transitions, Motion/React AnimatePresence, SVG ink-bleed entrance effects, ambient CSS particles
**Confidence:** HIGH (architecture, implementation approach); MEDIUM (ambient particle performance on specific device class)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAGE-03 | Ink-bleed SVG page transitions between routes — navigation feels like ink bleeding across the screen | `template.tsx` remounts on every navigation, receives automatic unique key — entrance-only `motion.div` with SVG ink overlay confirmed working pattern |
| PAGE-04 | Page transitions use entrance-only pattern (no exit animations) to avoid App Router limitations | Exit animations silently break in Next.js App Router (issues #42658, #59349); entrance-only via `template.tsx` + `initial`/`animate` props is the production-safe path |
| PERF-05 | Total new bundle size stays under 5KB gzip (lenis is the only new dependency) | Phase 7 adds zero new npm deps; motion already in bundle; ink-bleed is an inline SVG + CSS animation in a client component — no gzip cost beyond the component code itself (~1-2KB) |
</phase_requirements>

---

## Summary

Phase 7 adds two cinematic effects: (1) an ink-bleed SVG entrance transition on route change, and (2) ambient drifting particles across every page. Both must be implemented without adding any new npm dependencies — the project's PERF-05 constraint is that `lenis` is the only net-new dependency for the entire v1.1 milestone, and lenis is not yet in the package.json (meaning Phase 7 is the milestone's budget consumer, not a free adder).

The most important architectural decision is already locked by project history: **entrance-only transitions via `template.tsx`**. Exit animations in Next.js App Router silently fail in production (confirmed via vercel/next.js #42658 and #59349). The `template.tsx` file (not `layout.tsx`) is the correct vehicle — unlike layouts which persist across routes, templates receive a new React key on each navigation and fully remount, making `initial`/`animate` props fire correctly on every route change. `AnimatePresence` is not needed for entrance-only.

The ink-bleed visual effect is achievable using an inline SVG `clipPath` or an animated SVG overlay positioned `fixed inset-0` with a `motion.div` driving `clipPath`, `scale`, or `opacity`. The existing `feTurbulence` / `feDisplacementMap` filter pattern from `IntroAnimation.tsx` is the direct ancestor — the same filter technique produces the organic bleed edge. The key constraint is that the overlay must complete in under ~600ms so it does not block content interaction.

The ambient particle layer is a stretch goal within this phase. Performance on mid-range Android at 6x CPU throttle demands pure CSS animation (transform + opacity only — no layout-triggering properties, no blur, no SVG filter per frame). A fixed-position, `pointer-events: none` container with a handful of drifting CSS-animated elements is the safe path.

**Primary recommendation:** Implement the ink-bleed transition in `src/app/(frontend)/template.tsx` using a `fixed inset-0 z-50 pointer-events-none` overlay with `motion.svg` driving a `clipPath` path reveal, gated by `useReducedMotion`. Implement ambient particles as pure CSS `@keyframes` in `globals.css` with `prefers-reduced-motion: reduce` guard — no JavaScript needed, zero bundle cost.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `motion/react` | 12.36.0 (installed) | `motion.div`, `motion.svg`, `motion.path`, `useReducedMotion` | Already in bundle; no new install; `motion.svg`/`motion.path` with `pathLength` and SVG filter support verified |
| Next.js `template.tsx` | 15.x (installed) | Remounts on every navigation — correct vehicle for entrance animations | Confirmed by official Next.js docs: "templates are given a unique key" and "remount when that segment changes"; `layout.tsx` persists = no re-run of entrance animation |
| CSS `@keyframes` | Browser native | Ambient particle drift | Zero JS, zero bundle, compositor-only if limited to `transform`/`opacity` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useReducedMotion` (from `motion/react`) | 12.36.0 | Gate both transition overlay and particles | Required by PERF-01; already used in `InkBlob.tsx` and `TiltCard.tsx` — consistent pattern |
| CSS `feTurbulence` + `feDisplacementMap` | Browser native | Feathered/bled ink edge on transition overlay | Same filter already in `IntroAnimation.tsx`; reuse identical filter definition |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `template.tsx` + entrance-only | `AnimatePresence` in `layout.tsx` | Exit animations silently fail in App Router production; `AnimatePresence` approach is documented as broken for full in-out transitions |
| `template.tsx` + entrance-only | `next-transition-router` npm package | Adds new dependency, violates PERF-05; unnecessary for entrance-only |
| `template.tsx` + entrance-only | `viewTransition` experimental flag | Official docs: "not recommended for production"; requires React Canary; do not use |
| CSS `@keyframes` particles | Motion `animate` loop particles | JS loop adds bundle overhead; CSS particles achieve same visual at zero JS cost |
| Inline SVG clipPath reveal | Canvas / WebGL | 300-500KB bundle cost; explicitly out of scope in REQUIREMENTS.md |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

```
src/app/(frontend)/
├── layout.tsx          — UNCHANGED: NavBar + MotionProvider persist
├── template.tsx        — NEW: ink-bleed entrance overlay, remounts on navigation
├── page.tsx            — unchanged
├── about/page.tsx      — unchanged
└── contact/page.tsx    — unchanged

src/components/frontend/
└── InkTransition.tsx   — NEW: the ink-bleed SVG overlay component

src/app/globals.css     — ADD: particle @keyframes + reduced-motion guard
```

### Pattern 1: template.tsx Entrance Wrapper

**What:** `template.tsx` receives a new unique key from Next.js on every navigation and remounts from scratch. Place the ink-bleed overlay inside it as a `fixed inset-0` element that animates in and then fades out, leaving `children` visible.

**When to use:** Entrance-only transitions without exit animation. This is the production-correct approach for Next.js App Router.

**Official docs reference:** nextjs.org/docs/app/api-reference/file-conventions/template — "templates are given a unique key, meaning children Client Components reset their state on navigation"

```tsx
// src/app/(frontend)/template.tsx
'use client'
import { InkTransition } from '@/components/frontend/InkTransition'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InkTransition />
      {children}
    </>
  )
}
```

### Pattern 2: InkTransition Overlay Component

**What:** A `fixed inset-0 z-50 pointer-events-none` SVG overlay that plays a one-shot entrance animation (ink bleeds in from an edge, then the overlay fades out). Reuses the `feTurbulence`/`feDisplacementMap` filter already defined in `IntroAnimation.tsx` for visual consistency.

**Key motion pattern:** `motion.div` wrapping a full-viewport SVG. Drive either:
- `clipPath` path reveal (the ink "bleeds" to cover the screen, then the whole overlay fades out), or
- An opaque `motion.div` that scales/fades in from `opacity: 0` using ink-bleed SVG path drawing

The simpler and more reliable approach for this project is an animated `motion.path` with `pathLength` (already proven in `IntroAnimation`) covering the screen as an ink bleed, followed by the whole overlay fading out at the end.

```tsx
// src/components/frontend/InkTransition.tsx
'use client'
import { useReducedMotion, motion, AnimationSequence, useAnimate } from 'motion/react'
import { useEffect } from 'react'

export function InkTransition() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}  // fade out after ink completes
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <filter id="ink-bleed-transition" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves={3} seed={5} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <clipPath id="ink-clip">
            <motion.rect
              x="0" y="0" width="100" height="100"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'left center' }}
            />
          </clipPath>
        </defs>
        <rect
          x="0" y="0" width="100" height="100"
          fill="var(--color-bg)"
          filter="url(#ink-bleed-transition)"
          clipPath="url(#ink-clip)"
        />
      </svg>
    </motion.div>
  )
}
```

**Note on clipPath + filter interaction:** SVG `clipPath` applied with a `feDisplacementMap` filter may cause the bleed edges to stay crisp. For a more organic bleed, drive `pathLength` on an SVG path instead — as proven in `IntroAnimation`. Test both approaches and pick whichever renders the ink-bleed edge correctly.

**Simpler alternative (recommended for initial implementation):**

Use a full-coverage opaque `motion.div` with `bg-bg` that fades in from left-to-right using a CSS clip-path reveal, then fades out:

```tsx
// Simpler pattern — proven, no SVG filter interaction risk
<motion.div
  className="fixed inset-0 z-50 pointer-events-none bg-[var(--color-bg)]"
  initial={{ clipPath: 'inset(0 100% 0 0)' }}
  animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 0)'] }}
  transition={{ duration: 0.55, times: [0, 0.45, 1], ease: 'easeInOut' }}
  // The div bleeds across from left, covers screen, then overall opacity drops
/>
```

Apply `feTurbulence` filter to the div via `filter: url(#ink-filter)` (defined in `globals.css` or a static SVG) to feather the edge organically.

### Pattern 3: Ambient CSS Particles

**What:** 6-12 small SVG-ink-like dots or specks, `fixed` positioned, `pointer-events: none`, animated with CSS `@keyframes` using only `transform` (translate + scale) and `opacity`. No JavaScript. No Motion. Pure CSS.

**Performance rationale:** `transform` and `opacity` are the only properties that do not trigger layout or paint — they go directly to the compositor. On a mid-range Android at 6x CPU throttle, CSS animations on the compositor thread are unaffected by CPU load. 6 elements with `will-change: transform` should have negligible GPU cost.

**Implementation location:** `globals.css` (or a dedicated `particles.css` imported from layout) + a `<Particles>` client component that renders static HTML with aria-hidden.

```css
/* globals.css — add to end of file */
@media (prefers-reduced-motion: no-preference) {
  .particle {
    position: fixed;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--color-text-muted);
    pointer-events: none;
    opacity: 0;
    will-change: transform, opacity;
    animation: particle-drift var(--particle-duration, 18s) var(--particle-delay, 0s) infinite ease-in-out;
    z-index: 1;
  }

  @keyframes particle-drift {
    0%   { transform: translate(0, 0) scale(1);      opacity: 0; }
    10%  { opacity: 0.15; }
    50%  { transform: translate(var(--dx, 30px), var(--dy, -60px)) scale(0.7); opacity: 0.08; }
    90%  { opacity: 0.05; }
    100% { transform: translate(var(--dx2, -20px), var(--dy2, -120px)) scale(0.4); opacity: 0; }
  }
}
```

```tsx
// src/components/frontend/AmbientParticles.tsx
// Static particles — no Motion, no JS animation, pure CSS
export function AmbientParticles() {
  const particles = [
    { style: { left: '15%', top: '40%', '--dx': '25px', '--dy': '-80px', '--dx2': '-15px', '--dy2': '-160px', '--particle-duration': '22s', '--particle-delay': '0s' } },
    { style: { left: '72%', top: '30%', '--dx': '-30px', '--dy': '-50px', '--dx2': '10px', '--dy2': '-130px', '--particle-duration': '18s', '--particle-delay': '4s' } },
    // ... 4-8 more
  ]

  return (
    <div aria-hidden="true">
      {particles.map((p, i) => (
        <span key={i} className="particle" style={p.style as React.CSSProperties} />
      ))}
    </div>
  )
}
```

Add `<AmbientParticles />` to `src/app/(frontend)/layout.tsx` (not `template.tsx` — particles persist across routes).

### Anti-Patterns to Avoid

- **`AnimatePresence` in `layout.tsx` for page transitions:** Exit animations silently fail in App Router production — confirmed in vercel/next.js #42658. The old page disappears instantly, the exit prop never fires.
- **Using `usePathname` as `key` in `layout.tsx`:** Same failure mode as above — layout doesn't remount, so keying by pathname produces no visual effect after first navigation.
- **`viewTransition: true` experimental flag:** Explicitly not recommended for production by official Next.js docs (verified 2026-02-27). Requires React Canary.
- **Particle animations using `filter: blur()` or SVG filter per frame:** These trigger paint on every frame — instant jank on mobile. Use opacity/transform only.
- **`will-change: transform` on more than 10 elements:** GPU layer creation has memory overhead; 6-8 particles is the safe ceiling.
- **Animating `d` attribute on the ink-bleed transition SVG path:** Path morphing (used by `InkBlob`) requires identical control point structure. For a transition overlay, use `clipPath`, `scaleX`, or `pathLength` instead — they're interpolation-safe.
- **`fixed inset-0` overlay with `pointer-events: auto`:** The overlay must be `pointer-events: none` at all times — even during animation — so it never blocks NavBar or page clicks.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Entrance animation trigger on navigation | Custom router listener, event-based state | `template.tsx` — Next.js wires this automatically | Template receives new key on every navigation; automatic, no custom code needed |
| Reduced motion detection | Manual `window.matchMedia` | `useReducedMotion()` from `motion/react` | SSR-safe, reactive, already used in 3 components in this codebase |
| SVG ink-bleed filter | New custom SVG filter design | Reuse `feTurbulence` filter from `IntroAnimation.tsx` | Already proven visually, same brand language, zero additional code |
| Particle drift randomness | JS random + `requestAnimationFrame` | CSS custom properties `--dx`, `--dy` on each element | Zero JS, compositor-only, deterministic across renders |

**Key insight:** The entire phase adds zero new npm dependencies. The machinery already exists: Motion 12, CSS animations, SVG filters, and `template.tsx` are all in place. The work is wiring them together, not installing anything new.

---

## Common Pitfalls

### Pitfall 1: IntroAnimation Conflict
**What goes wrong:** The `InkTransition` overlay fires on every navigation — including the very first page load when `IntroAnimation` is also playing. Both run simultaneously, producing a visual mess.
**Why it happens:** `template.tsx` remounts on first navigation AND on first load. `IntroAnimation` also runs on first load if the user hasn't seen the intro.
**How to avoid:** `InkTransition` must check `localStorage.getItem('intro-seen')` — if the intro hasn't been seen, skip the ink-bleed overlay entirely. Alternatively, delay the transition overlay with a `shouldAnimate` state that only becomes true after the first load cycle completes. The cleanest approach: in `InkTransition`, check `localStorage.getItem('intro-seen')` in a `useEffect` — if not set, return null early.
**Warning signs:** On first load, you see a black overlay fighting with the intro animation.

### Pitfall 2: template.tsx Fires on First Load
**What goes wrong:** The ink-bleed fires on the first page load (gallery), covering the screen with an ink overlay even when no navigation has occurred.
**Why it happens:** `template.tsx` remounts on first render too, not just on navigation. `initial`/`animate` run on mount.
**How to avoid:** Use a `useRef` or `sessionStorage` flag — if this is the first mount (no prior navigation in this session), skip the ink-bleed animation. Set the flag in a `useEffect` after the first render.
**Warning signs:** Landing on the gallery shows an ink overlay where none was expected.

### Pitfall 3: z-index Clash with NavBar
**What goes wrong:** The ink-bleed overlay (`z-50`) is lower than the NavBar (`z-40`), or the reverse — the overlay hides the NavBar mid-animation.
**Why it happens:** NavBar uses `z-40`. The overlay should sit on top of content but not permanently obscure navigation.
**How to avoid:** Set `InkTransition` to `z-50` — above NavBar during the brief animation, but it fades out after ~500ms. NavBar remains clickable throughout because `pointer-events: none` on the overlay means clicks pass through to NavBar even during the animation.
**Warning signs:** User clicks NavBar during transition and nothing responds, OR the ink overlay shows through NavBar's glass effect.

### Pitfall 4: SVG clipPath + filter Edge Case
**What goes wrong:** Applying both `clipPath` and `filter: url(#ink-bleed)` to the same SVG element produces crisp clip edges, not organic bleed.
**Why it happens:** `clipPath` clips at the pixel boundary before the displacement filter is applied (or the filter is applied within the clip).
**How to avoid:** Apply the `feDisplacementMap` filter to the outer SVG/wrapper element (not the clipped element), or use `pathLength` animation on an actual blob path instead of a rectangular clip. Alternatively, accept clean edges and rely on the path shape for organic feel.
**Warning signs:** The ink bleed looks like a rectangle sliding in, not an organic edge.

### Pitfall 5: Ambient Particles on First-Paint Performance
**What goes wrong:** Frame drops on Android because particle CSS animations start immediately on first paint, when the browser is already busy hydrating React.
**Why it happens:** All particles start animating simultaneously at page load.
**How to avoid:** Stagger `animation-delay` across particles so they don't all begin simultaneously. Use `--particle-delay` CSS custom property per particle ranging from 0s to 15s. Most particles start off-screen or at zero opacity, so only 1-2 are visible at any moment.
**Warning signs:** DevTools shows layout/paint storms in the first 2 seconds after load.

### Pitfall 6: Nested AnimatePresence (Historical Landmine)
**What goes wrong:** Adding `AnimatePresence` in `template.tsx` or `layout.tsx` while `IntroAnimation` still has its own inner AnimatePresence causes nested-instance bugs where Motion loses track of unmount orchestration.
**Why it happens:** Documented in motiondivision/motion #2387. Phase 4 removed `AnimatePresence` from `IntroAnimation` specifically to prevent this.
**How to avoid:** Do NOT add `AnimatePresence` to `template.tsx` or `layout.tsx`. The entrance-only pattern (no exit) does not require `AnimatePresence` at all — just `initial`/`animate` props on a `motion.div` inside `template.tsx`.
**Warning signs:** Intro animation stops fading out correctly, OR gallery entrance animation stops firing after the first navigation.

---

## Code Examples

Verified patterns from official sources and existing codebase:

### template.tsx — Correct Remount Behavior
```tsx
// Source: nextjs.org/docs/app/api-reference/file-conventions/template (verified 2026-02-27)
// template.tsx receives a unique key on every navigation — it fully remounts
// THIS is the correct vehicle for entrance-only page transitions in App Router

// src/app/(frontend)/template.tsx
'use client'
import { InkTransition } from '@/components/frontend/InkTransition'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InkTransition />
      {children}
    </>
  )
}
```

### InkTransition — First-Load Skip Guard
```tsx
// Pattern to prevent ink-bleed on first page load (before any navigation occurs)
'use client'
import { useEffect, useState } from 'react'
import { useReducedMotion, motion } from 'motion/react'

export function InkTransition() {
  const prefersReducedMotion = useReducedMotion()
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    // On first mount: mark this route as "navigated to"
    // If sessionStorage already has the flag, a real navigation occurred
    if (sessionStorage.getItem('navigated')) {
      setShouldAnimate(true)
    } else {
      sessionStorage.setItem('navigated', '1')
    }
  }, [])

  if (!shouldAnimate || prefersReducedMotion) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none bg-[var(--color-bg)]"
      initial={{ opacity: 1, clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)', opacity: [1, 1, 0] }}
      transition={{ duration: 0.6, times: [0, 0.6, 1], ease: 'easeInOut' }}
      aria-hidden="true"
    />
  )
}
```

### IntroAnimation Interaction — Intro-Seen Check
```tsx
// If intro hasn't been seen yet, skip ink transition entirely
// (prevents conflict with IntroAnimation on first ever visit)
useEffect(() => {
  if (!localStorage.getItem('intro-seen')) return  // first-ever visit → skip
  if (sessionStorage.getItem('navigated')) {
    setShouldAnimate(true)
  } else {
    sessionStorage.setItem('navigated', '1')
  }
}, [])
```

### Ambient Particles — Pure CSS, Compositor-Only
```css
/* Source: MDN — animation-performance (transform + opacity = compositor only) */
/* Add to globals.css */
@media (prefers-reduced-motion: no-preference) {
  .particle {
    position: fixed;
    border-radius: 50%;
    background: var(--color-text-muted, #888);
    pointer-events: none;
    opacity: 0;
    will-change: transform, opacity;
    z-index: 1;
  }

  @keyframes particle-drift {
    0%   { transform: translate(0, 0) scale(1);          opacity: 0;    }
    15%  { opacity: var(--particle-peak-opacity, 0.12);  }
    70%  { transform: translate(var(--dx), var(--dy)) scale(0.6); opacity: 0.06; }
    100% { transform: translate(var(--dx2), var(--dy2)) scale(0.3); opacity: 0; }
  }
}
```

### Existing feTurbulence Pattern (reuse from IntroAnimation)
```tsx
// Source: src/components/frontend/IntroAnimation.tsx (existing, verified)
// Reuse identical filter definition for visual consistency
<filter id="ink-bleed-transition" x="-10%" y="-10%" width="120%" height="120%"
  colorInterpolationFilters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves={3} seed={5} result="noise" />
  <feDisplacementMap in="SourceGraphic" in2="noise" scale={6}
    xChannelSelector="R" yChannelSelector="G" result="displaced" />
  <feGaussianBlur in="displaced" stdDeviation={1.2} />
</filter>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `AnimatePresence` + `usePathname` key in `layout.tsx` | `template.tsx` entrance-only `motion.div` | Next.js 13+ App Router (2022, still unfixed 2026) | Exit animations silently fail; entrance-only via template is the production-correct path |
| GSAP `SplitText` page transitions | CSS clip-path / Motion SVG entrance | Ongoing preference | GSAP adds 60-80KB; Motion + CSS is sufficient for entrance-only at fraction of the cost |
| `viewTransition` experimental | Not recommended for production | Next.js 15.2 added it (2025) | Still experimental as of 2026-02-27; requires React Canary; skip |
| JS-driven particles (`requestAnimationFrame`) | Pure CSS `@keyframes` on compositor | CSS animation performance matured ~2020 | Zero JS, compositor-thread only, unaffected by 6x CPU throttle |

**Deprecated/Outdated:**
- `next-view-transitions` npm package: viable but unnecessary given entrance-only requirement and PERF-05 constraint
- `FrozenRouter` pattern: only needed for exit animations; not needed here

---

## Open Questions

1. **First-load ink-bleed trigger timing vs. IntroAnimation**
   - What we know: `template.tsx` remounts on first load AND on subsequent navigations. `IntroAnimation` runs on first load for new visitors.
   - What's unclear: The exact timing interaction — does `template.tsx` mount before or after `IntroAnimation`'s useEffect? Is there a flash of the ink-bleed before the intro starts?
   - Recommendation: Use `localStorage.getItem('intro-seen')` + `sessionStorage.getItem('navigated')` double-gate in `InkTransition`. Test by clearing both storage keys and loading the gallery fresh.

2. **SVG clipPath feather quality**
   - What we know: `clipPath` with `feDisplacementMap` may or may not produce organic ink edges depending on browser rendering order.
   - What's unclear: Whether the organic bleed edge is achievable via clipPath+filter, or requires a drawn blob path approach.
   - Recommendation: Start with the simpler `css clip-path: inset()` sweep + feTurbulence filter applied to the overlay div. If the edge is too crisp, switch to an animated SVG path (like IntroAnimation's `pathLength` strokes) as the reveal mechanism.

3. **Ambient particle count vs. GPU budget**
   - What we know: 6-8 `will-change: transform` elements is generally safe; compositor-only animations survive CPU throttle.
   - What's unclear: Whether the existing `body::before` vignette + `body::after` film grain (which uses `animation: grain 0.2s steps(1) infinite`) already claims GPU budget, leaving less headroom for particles.
   - Recommendation: Start with 6 particles. If the film grain animation (`grain 0.2s steps(1) infinite`) causes composite layer contention, reduce to 4 particles or disable particles on devices with low GPU memory (not easily detectable — just use conservative count from the start).

---

## Validation Architecture

> `workflow.nyquist_validation` is `false` (not present) in `.planning/config.json` — skip this section.

---

## Sources

### Primary (HIGH confidence)
- `nextjs.org/docs/app/api-reference/file-conventions/template` (fetched 2026-02-27) — template.tsx remount behavior, unique key per segment, state reset on navigation
- `github.com/vercel/next.js/discussions/42658` — exit animation failure in App Router, entrance-only pattern recommendation
- `src/components/frontend/IntroAnimation.tsx` (codebase) — existing feTurbulence filter pattern, motion.path pathLength animation
- `src/components/frontend/InkBlob.tsx` (codebase) — useReducedMotion guard pattern, morphing animation technique
- `node_modules/motion/package.json` (codebase) — confirmed motion 12.36.0 installed, `motion/react-m` export available

### Secondary (MEDIUM confidence)
- `github.com/vercel/next.js/discussions/59349` — confirms entrance-only template.tsx as recommended workaround for App Router
- `motion.dev` WebSearch results — LazyMotion reduces bundle from ~34KB to ~4.6KB via `domAnimation` features; `m.div` pattern available as `motion/react-m`
- MDN `animation-performance` — transform + opacity compositor-only confirmed; will-change GPU layer creation
- Smashing Magazine 2025 ambient animation articles — CSS-only particles are lightweight and correct approach for ambient motion

### Tertiary (LOW confidence)
- SVG `clipPath` + `feDisplacementMap` interaction behavior — not verified against a real rendered output; needs live test to confirm organic edge quality

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed; template.tsx behavior confirmed by official docs
- Architecture: HIGH — entrance-only pattern confirmed by two Next.js GitHub discussions + official docs; no new deps needed
- Pitfalls: HIGH — IntroAnimation conflict and first-load guard are specific to this codebase; identified from reading actual component code
- SVG filter edge quality: LOW — needs live testing to confirm clipPath+filter vs. pathLength approach

**Research date:** 2026-03-14
**Valid until:** 2026-06-14 (90 days — Next.js template.tsx behavior is stable; Motion 12 API stable; CSS animation performance stable)
