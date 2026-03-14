# Architecture Research

**Domain:** Visual/UX effects integration — Next.js 15 App Router + Motion + Tailwind v4
**Researched:** 2026-03-14
**Confidence:** HIGH (Motion official docs + Next.js docs + verified patterns)

> v1.1 update: This file replaces the v1.0 general architecture with a focused integration
> map for the Dark & Dangerous milestone. The v1.0 architecture (auth, CMS, image pipeline,
> admin) is unchanged and not repeated here.

## Standard Architecture

### System Overview — v1.1 Effect Layer Integration

```
┌──────────────────────────────────────────────────────────────────┐
│                    GLOBAL EFFECT LAYER (new)                      │
│  ┌──────────────────┐  ┌──────────────────┐                       │
│  │  TextureOverlay  │  │  ParticleCanvas  │  (fixed, z-0/1, no ptr) │
│  └──────────────────┘  └──────────────────┘                       │
├──────────────────────────────────────────────────────────────────┤
│                   NAVIGATION LAYER (modified)                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  NavBar.tsx — add Motion entrance + link micro-interactions │   │
│  └────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│               PAGE TRANSITION LAYER (new)                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  template.tsx — (frontend) route group — Motion entrance   │   │
│  └────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│                   PAGE CONTENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  HomePage    │  │  AboutPage   │  │  ContactPage │            │
│  │  (server)    │  │  (server)    │  │  (server)    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                  │                    │
├─────────┴─────────────────┴──────────────────┴────────────────────┤
│                  CLIENT COMPONENT LAYER                           │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ IntroAnimation │  │  GalleryGrid    │  │  GalleryLightbox │   │
│  │  (MODIFIED)    │  │  (MODIFIED)     │  │  (MODIFIED)      │   │
│  └────────────────┘  └────────┬────────┘  └──────────────────┘   │
│                               │                                   │
│                      ┌────────┴────────┐                          │
│                      │  GalleryCard    │  (NEW — extracted)       │
│                      │  w/ parallax    │                          │
│                      └─────────────────┘                          │
├──────────────────────────────────────────────────────────────────┤
│                   DESIGN TOKEN LAYER (modified)                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  globals.css — @theme tokens + grain keyframe + z-index    │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Status | Responsibility | Modification Scope |
|-----------|--------|----------------|-------------------|
| `globals.css` | MODIFIED | Design tokens, grain animation keyframe, z-index scale | Add `@keyframes grain`, z-index CSS vars |
| `(frontend)/layout.tsx` | MODIFIED | Frontend shell — add TextureOverlay, ParticleCanvas as siblings to NavBar | Mount global effect components |
| `(frontend)/template.tsx` | NEW | Page transition wrapper — remounts on every navigation | `motion.div` with fade/slide entrance |
| `IntroAnimation.tsx` | MODIFIED | Cinematic intro — enhance SVG strokes, more dramatic exit | More dramatic exit, particle trigger on skip() |
| `GalleryGrid.tsx` | MODIFIED | Masonry gallery — extract GalleryCard, add stagger, AnimatePresence on filter | Use GalleryCard, keep filter/lightbox state |
| `GalleryCard.tsx` | NEW | Single gallery item — owns parallax hover, whileInView entrance | Extracted from GalleryGrid for isolation |
| `GalleryLightbox.tsx` | MODIFIED | Lightbox — cinematic open animation via CSS override on `.yarl__portal` | CSS-only entrance scale + opacity |
| `NavBar.tsx` | MODIFIED | Navigation — Motion entrance, AnimatePresence mobile menu, active indicator | Wrap menu in AnimatePresence |
| `TagFilter.tsx` | MODIFIED | Filter pills — layoutId shared background for active pill sliding animation | `motion.button` with `layoutId` |
| `ContactForm.tsx` | MODIFIED | Contact form — field focus micro-interactions, submit feedback animation | Local `motion.div` on submit state |
| `TextureOverlay.tsx` | NEW | Fixed grain + vignette layer — CSS animated noise, pointer-events none | Pure CSS, zero JS animation |
| `ParticleCanvas.tsx` | NEW | Canvas-based ambient ink/smoke particles — useRef + requestAnimationFrame | Client component, reduced-motion aware |
| `useParallaxHover.ts` | NEW | Reusable hook — useMotionValue + useSpring for mouse parallax | Used by GalleryCard |

## Recommended Project Structure

```
src/
├── app/
│   ├── globals.css               # MODIFIED — add @keyframes grain, z-index CSS vars
│   ├── layout.tsx                # root layout (unchanged)
│   └── (frontend)/
│       ├── layout.tsx            # MODIFIED — add TextureOverlay, ParticleCanvas
│       ├── template.tsx          # NEW — page transition AnimatePresence wrapper
│       ├── page.tsx              # unchanged (server component)
│       ├── about/page.tsx        # unchanged (server component)
│       └── contact/page.tsx      # unchanged (server component)
├── components/
│   └── frontend/
│       ├── IntroAnimation.tsx    # MODIFIED — more dramatic ink reveal
│       ├── GalleryGrid.tsx       # MODIFIED — use GalleryCard, AnimatePresence on filter
│       ├── GalleryCard.tsx       # NEW — whileInView, parallax hover, overlay animation
│       ├── GalleryLightbox.tsx   # MODIFIED — cinematic CSS entrance override
│       ├── NavBar.tsx            # MODIFIED — Motion entrance, animated mobile menu
│       ├── TagFilter.tsx         # MODIFIED — layoutId shared pill background
│       ├── ContactForm.tsx       # MODIFIED — field focus micro-interactions
│       ├── TextureOverlay.tsx    # NEW — fixed grain + vignette
│       └── ParticleCanvas.tsx    # NEW — canvas ink particle loop
└── hooks/
    └── useParallaxHover.ts       # NEW — reusable mouse parallax spring hook
```

### Structure Rationale

- **`template.tsx` over `layout.tsx` for transitions:** `layout.tsx` persists between routes and does NOT remount, so AnimatePresence exit animations never fire. `template.tsx` remounts on every navigation, giving each page a fresh key — the App Router pattern for page transitions (HIGH confidence — Next.js official docs confirmed this).
- **`GalleryCard.tsx` extracted:** Parallax hover requires `useMotionValue` + `useSpring` + mouse event handlers. That is too much local state to inline in a `.map()` inside GalleryGrid. Extraction also lets `whileInView` live at card level instead of wrapping masonry columns.
- **`TextureOverlay.tsx` separate component:** Film grain runs as a CSS `@keyframes` animation — no JS. Isolating it in its own component keeps the `position: fixed` stacking context out of layout.tsx and makes it trivially removable or adjustable.
- **`ParticleCanvas.tsx` separate from TextureOverlay:** Canvas RAF loop requires cleanup via `cancelAnimationFrame`. A dedicated component with its own `useEffect` is safer than combining with CSS overlay. Also allows disabling particles independently on low-power devices.
- **`hooks/useParallaxHover.ts`:** The `useMotionValue` / `useSpring` / `useTransform` parallax pattern is reusable. Extract once, reference in GalleryCard.

## Architectural Patterns

### Pattern 1: Global Fixed Overlay (Texture and Grain)

**What:** A client component mounted in `(frontend)/layout.tsx` renders a `div` with `position: fixed; inset: 0; pointer-events: none; z-index: var(--z-texture)` and a CSS `@keyframes grain` animation that shifts a noise SVG background.
**When to use:** Any always-on atmospheric effect covering the full viewport regardless of scroll position and must NOT intercept clicks.
**Trade-offs:** CSS-only grain is cheaper than canvas noise. The `pointer-events: none` is mandatory — omitting it silently breaks all interactivity with no obvious error.

**Example:**
```typescript
// TextureOverlay.tsx
'use client'
export function TextureOverlay() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 'var(--z-texture)',
        backgroundImage: 'url(/noise.svg)',
        opacity: 0.04,
        animation: 'grain 0.5s steps(2) infinite',
      }}
    />
  )
}
// globals.css:
// @keyframes grain {
//   0%, 100% { transform: translate(0, 0) }
//   50%       { transform: translate(-2%, -3%) }
// }
```

### Pattern 2: Canvas Particle Loop (Ambient Ink/Smoke)

**What:** A `'use client'` component uses `useRef` to hold a `<canvas>` element and runs a `requestAnimationFrame` loop in `useEffect`. Ink-smoke particles drift upward with opacity fade. The loop is cancelled on unmount and skipped entirely when `prefers-reduced-motion` is `reduce`.
**When to use:** Ambient background particles needing organic movement — CSS cannot produce this.
**Trade-offs:** requestAnimationFrame is cheap when particle count is low (under 40). DO NOT use tsParticles here — the full library is over 200kb and cannot easily produce a custom ink aesthetic. A hand-written hook is under 50 lines and adds zero dependencies.

**Example:**
```typescript
// ParticleCanvas.tsx (structural outline)
'use client'
import { useEffect, useRef } from 'react'

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    // init particles[], start RAF loop, return cleanup cancelAnimationFrame(frameId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 'var(--z-particles)' }}
      aria-hidden="true"
    />
  )
}
```

### Pattern 3: Scroll-Triggered Stagger with whileInView (Gallery)

**What:** Each `GalleryCard` wraps its content in a `motion.div` with `initial={{ opacity: 0, y: 20 }}`, `whileInView={{ opacity: 1, y: 0 }}`, and `viewport={{ once: true, margin: '-50px' }}`. The parent `GalleryGrid` passes `index` to each card to produce a stagger delay.
**When to use:** Gallery item entrance — fires once on first scroll into view, never replays.
**Trade-offs:** `whileInView` uses Intersection Observer internally (lightweight). `once: true` means no re-animation on filter changes. For filter-change reordering, add `layout` prop to the motion.div and wrap the list in `AnimatePresence`.

**Example:**
```typescript
// GalleryCard.tsx
<motion.div
  layout
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.5, delay: index * 0.04, ease: 'easeOut' }}
>
  {/* image + hover overlay */}
</motion.div>
```

### Pattern 4: Parallax Hover via useMotionValue + useSpring

**What:** On `onMouseMove`, compute cursor offset from element center as a percentage. Feed into `useMotionValue`, pipe through `useSpring` for damping, then bind to `motion.div` style. On `onMouseLeave`, spring returns to zero.
**When to use:** GalleryCard hover parallax on desktop. Gate with `window.matchMedia('(hover: hover)')` to skip on touch devices.
**Trade-offs:** `useSpring` with `{ stiffness: 150, damping: 20 }` feels natural and not floaty. Do NOT apply `rotateX/rotateY` 3D tilt on the card container — it breaks masonry column height calculation. Translate only. Keep `overflow: hidden` on the card container to clip edge overflow.

**Example:**
```typescript
// hooks/useParallaxHover.ts
import { useMotionValue, useSpring } from 'motion/react'

export function useParallaxHover() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 20 })
  const springY = useSpring(y, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - rect.left - rect.width / 2) / rect.width
    const cy = (e.clientY - rect.top - rect.height / 2) / rect.height
    x.set(cx * 16)
    y.set(cy * 12)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { springX, springY, handleMouseMove, handleMouseLeave }
}
```

### Pattern 5: Page Transitions via template.tsx

**What:** `src/app/(frontend)/template.tsx` is a client component that wraps `children` in a `motion.div` with entrance animation. Because `template.tsx` receives a new React key on every navigation, Motion sees it as a new element and plays the entrance animation fresh on each route change.
**When to use:** All cross-page transitions in App Router. This is the correct and officially supported pattern.
**Trade-offs:** Exit animations do NOT work reliably in App Router because Next.js unmounts the old page before AnimatePresence can intercept. Use entrance-only animations (fade + subtle y slide). Complex coordinated exit+enter transitions require the View Transitions API or a page-transition context — both add fragility not worth the complexity here.

**Example:**
```typescript
// (frontend)/template.tsx
'use client'
import { motion } from 'motion/react'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

### Pattern 6: AnimatePresence for Mobile Menu (NavBar)

**What:** The mobile overlay currently uses a plain conditional render `{menuOpen && <div>}`. Wrapping it in `AnimatePresence` with a keyed `motion.div` child enables a proper exit animation when the menu closes.
**When to use:** Any conditional UI needing exit animations — modal, drawer, menu.
**Trade-offs:** NavBar is already `'use client'`. This works correctly as-is. Menu backdrop animates from `opacity: 0, scale: 0.97` on open, reverses on close via `exit` prop.

### Pattern 7: Lightbox Cinematic Entrance via CSS Override

**What:** YARL renders its portal into a `div.yarl__portal`. Overriding `.yarl__portal` and `.yarl__portal_open` in globals.css with `transform: scale(0.95); opacity: 0` → `scale(1); opacity: 1` via CSS transition achieves a cinematic open without modifying the YARL JS render.
**When to use:** When the library exposes CSS class hooks but not a JS animation API for the container itself.
**Trade-offs:** CSS transition timing cannot be sequenced with Motion animations. The scale entrance (300ms ease-out) is sufficient and requires no new dependencies.

## Data Flow

### Animation State Flow

```
User Enters Viewport
       |
Intersection Observer (Motion whileInView, built-in)
       |
GalleryCard motion.div triggers animate variant
       |
opacity 0->1, y 24->0 with index * 0.04s stagger delay

Mouse Moves Over GalleryCard
       |
onMouseMove handler computes cursor offset from element center
       |
useMotionValue.set(x, y) → useSpring interpolates toward target
       |
motion.img style={ x: springX, y: springY } — GPU composited
       |
onMouseLeave → spring returns to 0

Route Change (Gallery -> About)
       |
Next.js App Router unmounts old template.tsx, mounts new instance
       |
New template.tsx gets fresh React key
       |
motion.div entrance animation plays (fade + y slide)

Tag Filter Changes
       |
GalleryGrid setState(activeTag)
       |
sorted array recomputed in memory
       |
AnimatePresence detects changed keys in children
       |
Exiting cards fade out; entering cards use whileInView
       |
layout prop on motion.div animates position changes
```

### Z-Index Stacking Order

All z-index values added as CSS variables in `globals.css` `@theme` block for single-source control.

```
--z-particles: 1    ParticleCanvas (below all content, above bg color)
--z-texture:   2    TextureOverlay grain (above particles, below content)
--z-base:     10    regular page content
--z-gallery:  20    gallery hover overlays
--z-nav:      40    NavBar (existing z-40 class)
--z-intro:    50    IntroAnimation (existing z-50 class)
--z-menu:     50    Mobile menu overlay (same level as intro — mutually exclusive)
--z-lightbox: 60    YARL lightbox portal (override --yarl__z_index in GalleryLightbox styles)
```

### Key Data Flows

1. **Texture + Particles into layout:** Both are mounted in `(frontend)/layout.tsx` as siblings before `<main>`. They use `position: fixed` and do not affect document flow. Server components (pages) are not affected.
2. **GalleryGrid to GalleryCard:** GalleryGrid retains all existing state (filter, lightbox index). GalleryCard receives `piece`, `index` (for stagger delay), and `onOpen` callback. No new state is introduced.
3. **IntroAnimation exit to page reveal:** Enhanced particle burst triggered in the existing `skip()` function before `setDone(true)`. The `done` state already controls the reveal — no structural change needed.
4. **TagFilter to GalleryGrid with layout animation:** Tag filter drives the `sorted` array. Wrapping Masonry children in `AnimatePresence` with `layout` prop on each GalleryCard produces smooth position transitions when items reorder.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single portfolio (current) | All patterns as described — no scaling concerns |
| Low-end mobile devices | Disable ParticleCanvas when `prefers-reduced-motion` is set; reduce grain opacity below 0.04 if needed |
| Many gallery items (200+) | `viewport={{ once: true }}` means Intersection Observer fires once per card and stops tracking. No cumulative performance issue. |

### Scaling Priorities

1. **Mobile GPU:** Canvas particles + CSS grain + Motion transforms compete for GPU compositing budget. Keep particle count under 30, grain opacity under 0.05, and avoid `will-change: transform` applied statically (Motion handles this internally only during active animations).
2. **Bundle size:** Motion is already installed. Adding tsParticles would be wrong. Hand-written canvas loop costs zero bytes in the npm dependency graph. TextureOverlay is pure CSS.

## Anti-Patterns

### Anti-Pattern 1: Page Transitions in layout.tsx

**What people do:** Wrap children in `AnimatePresence` inside `(frontend)/layout.tsx` expecting exit animations to fire on navigation.
**Why it's wrong:** `layout.tsx` persists between routes. Next.js does not unmount it on navigation. AnimatePresence never detects its children leaving, so exit animations never run. The first page load animates; all subsequent navigations do nothing.
**Do this instead:** Use `template.tsx`. It gets a new React key on every navigation, causing a fresh mount. Use entrance-only animations.

### Anti-Pattern 2: Fixed Overlay Without pointer-events Disabled

**What people do:** Mount a `position: fixed` grain or particle overlay and forget `pointer-events: none`.
**Why it's wrong:** The entire site becomes unclickable. Gallery cards, nav links, and form inputs are silently blocked. This fails with no error in the console.
**Do this instead:** `pointer-events: none` is a mandatory, non-negotiable class on every fixed overlay. Apply it at component definition time, not as an afterthought.

### Anti-Pattern 3: 3D Tilt on Masonry Card Container

**What people do:** Apply `rotateX` / `rotateY` 3D CSS tilt transforms to the GalleryCard container element for a parallax tilt effect.
**Why it's wrong:** `react-masonry-css` calculates column height from natural element height. `transform-style: preserve-3d` on a masonry child can trigger compositing issues that misalign column heights and cause unintended overflow clipping or layout gaps.
**Do this instead:** Translate only (`x`, `y`) on the image element inside the card. Apply `overflow: hidden` on the card container to clip any edge movement from the translate.

### Anti-Pattern 4: Using tsParticles for Custom Ink Aesthetics

**What people do:** Install `@tsparticles/react` (200kb+) and attempt to configure its preset system to approximate ink smoke behavior.
**Why it's wrong:** tsParticles is optimized for generic presets (snow, confetti, fire). Custom ink smoke requires velocity curves, alpha falloff, and opacity profiles that map awkwardly onto the preset configuration API. Result: large bundle, compromise aesthetic, less control than desired.
**Do this instead:** Write a 40-50 line canvas loop. Full control over particle behavior, zero dependency overhead, exactly the ink aesthetic the project needs.

### Anti-Pattern 5: Running Animations Without Reduced Motion Guard

**What people do:** Add `whileInView`, `whileHover`, and canvas loops without checking `prefers-reduced-motion`.
**Why it's wrong:** Vestibular disorders make motion-heavy sites inaccessible and physically uncomfortable. Ignoring this is both an accessibility failure and sends a poor professional signal.
**Do this instead:** Motion's `whileInView` and `animate` props are not automatically gated. Use `useReducedMotion()` from Motion to get a boolean, then short-circuit animated variants. Canvas loop and CSS grain animation must be manually gated in each component's `useEffect`.

### Anti-Pattern 6: Stacking Multiple motion.div Wrappers on GalleryCard

**What people do:** Add a `motion.div` for scroll entrance, another for parallax hover, and another for layout animation — all nested.
**Why it's wrong:** Each `motion.div` creates a new compositing layer. Three nested motion wrappers on every gallery card multiplies layer count by the number of images and can degrade paint performance on mobile.
**Do this instead:** One `motion.div` per card. Compose all effects onto that single element: `initial/whileInView` for entrance, `layout` for filter reordering, and the spring-based `style={{ x, y }}` for parallax. Motion supports all of these simultaneously on a single element.

## Integration Points

### Existing Component Integration Detail

| Existing Component | What to Add | What NOT to Touch |
|-------------------|-------------|-------------------|
| `IntroAnimation.tsx` | More SVG ink strokes with varied widths, particle burst on `skip()`, more dramatic exit `{ opacity: 0, scale: 0.98 }` | localStorage logic, reduced-motion skip, `AnimatePresence mode="wait"` structure |
| `GalleryGrid.tsx` | Import `GalleryCard` instead of inline div, wrap sorted array in `AnimatePresence`, add `layout` prop support | Filter state, lightbox state, Masonry breakpoints, sort logic |
| `GalleryLightbox.tsx` | CSS override on `.yarl__portal` for scale + opacity entrance, override `--yarl__z_index: 60` | Custom `render.slide` implementation, blur placeholder logic, YARL plugin config |
| `NavBar.tsx` | `motion.nav` entrance on first render, `AnimatePresence` around mobile menu div, `motion.span` with `layoutId` for active link indicator | Pathname logic, link structure, z-40 class, backdrop-blur |
| `TagFilter.tsx` | `motion.button` wrapper with `layoutId="active-pill"` shared layout background for sliding active state | Tag list, `onTagChange` callback, scroll container overflow classes |
| `ContactForm.tsx` | `motion.div` wrapping success/error states with fade-in, subtle CSS border-glow on field focus | Server action, email integration, form validation logic |

### New Component Integration

| New Component | Mounted In | Communicates With |
|---------------|------------|-------------------|
| `TextureOverlay` | `(frontend)/layout.tsx` | None — pure CSS, completely isolated |
| `ParticleCanvas` | `(frontend)/layout.tsx` | None — standalone RAF loop, no shared state |
| `GalleryCard` | `GalleryGrid.tsx` map | GalleryGrid passes `piece`, `index`, `onOpen` callback |
| `template.tsx` | Automatic by App Router | Wraps all pages in the `(frontend)` route group |
| `useParallaxHover.ts` | Consumed by `GalleryCard` | Returns `springX`, `springY`, `handleMouseMove`, `handleMouseLeave` |

### Z-Index Conflict Prevention

| Component | Z-Index | Action |
|-----------|---------|--------|
| `ParticleCanvas` | `--z-particles: 1` (new) | Must sit below all page content |
| `TextureOverlay` | `--z-texture: 2` (new) | Must sit above particles, below content |
| `NavBar` | `z-40` (existing) | Already correct — no change |
| `IntroAnimation` | `z-50` (existing) | Already correct — no change |
| `GalleryLightbox` | Override `--yarl__z_index` to `60` in styles prop | Ensures lightbox renders above NavBar |

## Build Order (Effect Dependencies)

Effects have hard dependencies that determine implementation sequence. Building out of order causes integration blockers.

```
Phase 1 — Foundation (no deps, everything else builds on this)
  - globals.css: add --z-* CSS vars and @keyframes grain
  - TextureOverlay.tsx: NEW, uses only CSS vars
  - template.tsx: NEW, uses only Motion (already installed)
  - (frontend)/layout.tsx: mount TextureOverlay

Phase 2 — NavBar + TagFilter (Motion micro-interactions, no other deps)
  - NavBar.tsx: add Motion entrance + AnimatePresence mobile menu
  - TagFilter.tsx: add layoutId shared pill background

Phase 3 — GalleryCard + parallax hook (deps: Phase 1 foundation)
  - useParallaxHover.ts: NEW hook
  - GalleryCard.tsx: NEW, deps on hook + motion
  - GalleryGrid.tsx: refactor to use GalleryCard + whileInView stagger

Phase 4 — Lightbox + ContactForm (isolated, no deps on Phase 3)
  - GalleryLightbox.tsx: CSS cinematic entrance override
  - ContactForm.tsx: field focus micro-interactions

Phase 5 — ParticleCanvas + IntroAnimation (saved last — highest complexity)
  - ParticleCanvas.tsx: NEW standalone canvas loop
  - (frontend)/layout.tsx: add ParticleCanvas mount
  - IntroAnimation.tsx: enhance SVG strokes + exit particle burst

Phase 6 — Integration QA
  - Test prefers-reduced-motion across all components
  - Mobile performance audit (particles off, grain opacity)
  - Z-index audit across all stacking contexts
  - Verify pointer-events none on all fixed overlays
```

## Sources

- [Motion useScroll documentation](https://motion.dev/docs/react-use-scroll) — HIGH confidence, official docs
- [Motion useInView documentation](https://motion.dev/docs/react-use-in-view) — HIGH confidence, official docs
- [Motion useSpring documentation](https://motion.dev/docs/react-use-spring) — HIGH confidence, official docs
- [Motion stagger documentation](https://motion.dev/docs/stagger) — HIGH confidence, official docs
- [React scroll animations — Motion](https://motion.dev/docs/react-scroll-animations) — HIGH confidence, official docs
- [Next.js Layouts vs Templates — Builder.io](https://www.builder.io/blog/nextjs-14-layouts-templates) — MEDIUM confidence, verified against Next.js discussion threads
- [App Router page transitions discussion — Next.js GitHub](https://github.com/vercel/next.js/discussions/42658) — MEDIUM confidence, community verified
- [YARL Customization docs](https://yet-another-react-lightbox.com/customization) — HIGH confidence, official docs
- [tsParticles GitHub](https://github.com/tsparticles/tsparticles) — MEDIUM confidence, used only to confirm it is the wrong choice for this use case
- [Grainy Gradients — CSS-Tricks](https://css-tricks.com/grainy-gradients/) — MEDIUM confidence, established technique

---
*Architecture research for: Anna Portfolio v1.1 Dark & Dangerous — visual/UX effects integration*
*Researched: 2026-03-14*
