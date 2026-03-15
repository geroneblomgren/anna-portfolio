# Phase 6: Signature Effects - Research

**Researched:** 2026-03-14
**Domain:** 3D tilt (Motion motion values), lightbox atmospheric overlay, page entrance stagger, SVG blob morphing dividers, prefers-reduced-motion
**Confidence:** HIGH (tilt, stagger, reduced-motion) / MEDIUM (lightbox CSS injection, blob morphing)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GLRY-03 | Gallery cards respond to cursor position with 3D tilt parallax (perspective transform) — like holding physical art | `useMotionValue` + `useTransform` + `animate()` from `motion/react`; mouse position relative to card via `getBoundingClientRect()`; `rotateX`/`rotateY` as style props; `dampen` variable controls intensity |
| GLRY-04 | 3D tilt replaces compound hover on desktop; compound hover remains as mobile/touch fallback | Gate tilt component behind `@media (hover: hover) and (pointer: fine)` check via JS `window.matchMedia`; render tilt wrapper conditionally; CSS `::after` shadow + scale from Phase 5 remains as the touch path |
| LBOX-01 | Lightbox backdrop shows grain and vignette — artwork feels lit from a darkroom, not floating on flat black | Target `.yarl__container` with CSS pseudo-element `::before` or `::after`; same grain SVG data-URL + radial-gradient vignette already established in `globals.css`; `pointer-events: none` required |
| PAGE-01 | About page elements entrance with staggered vertical motion — precision feel | Create `"use client"` `AboutContent` wrapper; use `motion.div` with `variants` + `staggerChildren` on a container; `initial="hidden"` / `whileInView="visible"` + `viewport={{ once: true }}` on parent; sections as children with shared `itemVariants` |
| PAGE-02 | Contact page elements entrance with staggered vertical motion | Same pattern as PAGE-01 applied to ContactPage sections: heading, subtitle, form, social links |
| DECR-01 | SVG ink-stain blob dividers between page sections, slowly morphing between shape variants | `motion.path` with keyframes array on `d` attribute; paths MUST share same number of points and point order; `repeat: Infinity` + `repeatType: "loop"`; slow duration (8-12s); purely decorative so accessible fallback = static blob shape |
| DECR-02 | Ink-stain dividers are purely decorative and do not affect layout or content flow | `aria-hidden="true"` on SVG; no height/margin added — use `position: absolute` or negative margins to let divider visually overlap without pushing content; `overflow: visible` on SVG container |
| PERF-01 | All animations respect prefers-reduced-motion — effects disabled or simplified for users who request it | Add `<MotionConfig reducedMotion="user">` in a `"use client"` provider wrapper in `(frontend)/layout.tsx`; tilt `onMouseMove` handler should additionally check `useReducedMotion()` before applying; blob morph loops pause when reduced-motion; grain animation already handled in Phase 4 CSS |
| PERF-02 | All overlay effects use pointer-events: none — no blocking of user interaction | Apply `pointer-events: none` to: lightbox CSS grain/vignette overlay, SVG blob dividers, any decorative pseudo-elements added to `.yarl__container` |
</phase_requirements>

---

## Summary

Phase 6 is the "feel" phase — every requirement is a layer of atmosphere or tactile response on top of the solid foundation from Phases 4-5. There are five distinct work streams: (1) 3D card tilt using Motion motion values, (2) lightbox atmospheric backdrop via CSS targeting the YARL container, (3) staggered page entrance on About and Contact, (4) SVG blob dividers that morph slowly between shape variants, and (5) a global `MotionConfig reducedMotion="user"` provider that gates everything.

The 3D tilt is the most technically interesting piece. The standard approach in the Motion ecosystem is `useMotionValue` for mouse X/Y coordinates, `useTransform` to derive `rotateX`/`rotateY` values relative to the card's bounding box, and `animate(mouseX, e.clientX)` to smoothly track cursor movement. This pattern avoids React state re-renders on every mouse event — the motion values update off the React render cycle. The `dampen` variable (typically 20-40) controls tilt magnitude. Perspective (`1000px`) lives on the wrapper container. GLRY-04 means the tilt wraps only when `window.matchMedia('(hover: hover) and (pointer: fine)').matches` — otherwise Phase 5's compound hover (scale + shadow) remains the sole hover effect.

The lightbox grain/vignette (LBOX-01) is the most constrained task. YARL exposes only `--yarl__color_backdrop` as a CSS variable for the backdrop; there is no dedicated grain slot. The cleanest approach is targeting `.yarl__container::after` in `globals.css` with the same grain SVG data-URL already established for the body grain overlay, and `.yarl__container::before` for a radial vignette. Both use `pointer-events: none; position: absolute; inset: 0`. YARL's container is `position: fixed` at `z-index: 9999` — the pseudo-elements nest inside it, so their `z-index` needs to sit above the backdrop but below the slide image.

SVG blob morphing (DECR-01) is the most constrained by a hard rule: Motion's `d` attribute keyframe animation only interpolates correctly when all keyframe paths share the **same number of SVG points and the same path command structure**. Pre-generate 3-4 blob shape variants with a fixed point count (e.g., a smooth cubic Bézier blob with 8 anchor points) using a tool like blobmaker.app or svgPathEditor, then verify point count matches before implementation. The morph animation loops infinitely at 8-12s duration — slow enough to be ambient, not distracting. For users with reduced-motion, the `motion.path` renders statically at the first keyframe shape (Motion's `MotionConfig reducedMotion="user"` pauses keyframe loops automatically when transforms are involved, but `d` morphing may need an explicit `useReducedMotion` guard).

**Primary recommendation:** Implement in this order — (1) `MotionConfig` provider wrapper first (unlocks correct PERF-01 behavior for all subsequent work), (2) tilt on gallery cards, (3) lightbox CSS grain/vignette, (4) page stagger on About and Contact, (5) blob dividers last (purely decorative, lowest risk).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion (motion/react) | ^12.36.0 (installed) | `useMotionValue`, `useTransform`, `useSpring`, `animate`, `MotionConfig`, `useReducedMotion`, `motion.path` keyframes | Already installed; provides compositor-thread motion values that bypass React renders |
| Tailwind CSS | ^4.1.11 (installed) | Utility classes for layout, conditional class application | Already configured with brand tokens |
| Browser SVG (native) | — | Blob shape path data; grain filter in `globals.css` already established | Zero bundle cost |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useReducedMotion` (from motion/react) | 12.36.0 | Gate tilt handler and blob morph behind OS preference | Supplement `MotionConfig reducedMotion="user"` for imperative `animate()` calls |
| flubber | ^0.4.2 (NOT installed) | Interpolate SVG paths with different point counts | Only if pre-generated blob paths cannot be made to share same point count — avoid if possible |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom `useMotionValue` tilt | `react-parallax-tilt` (2.9kB, zero deps) | External dep but saves 40 lines of hook code; upside = built-in touch/gyroscope handling; downside = adds to bundle (REQUIREMENTS out-of-scope note says lenis is the only new dep allowed — verify with PERF-05 before adding) |
| Motion `d` keyframes for blob morph | SMIL `<animate attributeName="d">` | SMIL is not deprecated (Chrome reversed 2015 decision), supported cross-browser, zero JS cost — valid alternative for this use case; tradeoff is no `prefers-reduced-motion` support without JavaScript |
| `.yarl__container::after` CSS grain | YARL plugin with custom render module | Plugin approach is cleaner but involves more code; CSS targeting is simpler and consistent with existing grain pattern |

**Installation:**
```bash
# No new packages needed for the primary approach.
# Only if flubber is needed for blob morphing (avoid if possible):
npm install flubber
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/frontend/
│   ├── GalleryGrid.tsx          ← Add TiltCard wrapper around each motion.div (desktop only)
│   ├── GalleryLightbox.tsx      ← No changes needed — lightbox grain via CSS only
│   ├── MotionProvider.tsx       ← NEW: "use client" wrapper with MotionConfig reducedMotion="user"
│   ├── AboutContent.tsx         ← NEW: "use client" stagger wrapper for about page sections
│   └── ContactContent.tsx       ← NEW: "use client" stagger wrapper for contact page sections
├── app/
│   ├── globals.css              ← Add .yarl__container grain/vignette, blob divider CSS
│   └── (frontend)/
│       ├── layout.tsx           ← Wrap children in <MotionProvider>
│       ├── about/page.tsx       ← Replace section divs with <AboutContent> client wrapper
│       └── contact/page.tsx     ← Replace section divs with <ContactContent> client wrapper
```

### Pattern 1: 3D Tilt with Motion Values (GLRY-03, GLRY-04)

**What:** Each gallery card gets a tilt hook that tracks the mouse cursor position relative to the card's bounding box and applies `rotateX`/`rotateY` via Motion style props. The `animate()` function (not React state) updates `mouseX`/`mouseY` motion values, keeping mouse tracking entirely off the React render cycle.

**Desktop gate:** Check `window.matchMedia('(hover: hover) and (pointer: fine)').matches` at component mount via `useState` initial state or `useEffect`. When false (touch devices), skip the tilt hook entirely — Phase 5's compound hover (scale via `whileHover`, shadow via `::after`) remains.

**Key insight:** Tilt and compound hover are MUTUALLY EXCLUSIVE on desktop (GLRY-04). When tilt is active, remove `whileHover={{ scale: 1.025 }}` from the `motion.div` — the tilt itself provides the "physical print" depth cue; scale-hover would fight it.

**When to use:** Desktop `motion.div` cards in `GalleryGrid.tsx` only.

```tsx
// Source: arielbk.com/blog/how-to-make-a-3d-shiny-card-animation (verified full code)
// Pattern adapted for per-card use (not window-level tracking):

import { useMotionValue, useTransform, animate, motion } from 'motion/react'
import { useRef } from 'react'

function TiltCard({ children, className, onClick }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const dampen = 25  // lower = more extreme tilt; 20-30 for art cards

  const rotateX = useTransform(mouseY, (y) => {
    if (!cardRef.current) return 0
    const rect = cardRef.current.getBoundingClientRect()
    return -(y - rect.top - rect.height / 2) / dampen
  })

  const rotateY = useTransform(mouseX, (x) => {
    if (!cardRef.current) return 0
    const rect = cardRef.current.getBoundingClientRect()
    return (x - rect.left - rect.width / 2) / dampen
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    animate(mouseX, e.clientX, { duration: 0 })
    animate(mouseY, e.clientY, { duration: 0 })
  }

  const handleMouseLeave = () => {
    animate(mouseX, 0, { type: 'spring', stiffness: 300, damping: 30 })
    animate(mouseY, 0, { type: 'spring', stiffness: 300, damping: 30 })
    // Reset rotateX/Y to 0 — motion values snap back via spring
  }

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
```

**Perspective CSS:** Apply `perspective: 1000px` to `.masonry-grid_column` or a wrapper div — NOT on the card itself. Perspective on the same element as the transform is ineffective.

```css
/* globals.css — enable 3D context for tilt cards */
@media (hover: hover) and (pointer: fine) {
  .masonry-grid_column {
    perspective: 1000px;
  }
}
```

### Pattern 2: MotionConfig Provider (PERF-01)

**What:** A thin `"use client"` wrapper component that provides `reducedMotion="user"` to the entire frontend layout. This is the prerequisite for Phase 6 — create it first.

```tsx
// src/components/frontend/MotionProvider.tsx
'use client'
import { MotionConfig } from 'motion/react'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
```

```tsx
// src/app/(frontend)/layout.tsx — wrap children
import { MotionProvider } from '@/components/frontend/MotionProvider'

export default function FrontendLayout({ children }) {
  return (
    <>
      <NavBar />
      <MotionProvider>
        <main className="pt-16 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </MotionProvider>
    </>
  )
}
```

**Note:** `MotionConfig reducedMotion="user"` disables transform-based animations automatically. It does NOT disable `d` attribute morphing — that requires an explicit `useReducedMotion()` guard in the blob component.

### Pattern 3: Lightbox Grain + Vignette (LBOX-01)

**What:** Target `.yarl__container` in `globals.css` with two pseudo-elements: `::before` for radial vignette, `::after` for grain texture. The grain SVG data-URL is already established in `globals.css` for the body overlay — reuse the same pattern.

**Critical z-index layering inside YARL:**
- `.yarl__container` renders at `z-index: 9999` (fixed)
- Slide image renders above backdrop
- Pseudo-elements need `z-index` that places them: above the solid `--yarl__color_backdrop` but below the slide image and controls

**Implementation:**
```css
/* globals.css — LBOX-01: darkroom atmosphere on lightbox backdrop */
.yarl__container {
  /* Grain overlay — identical technique to body::after */
  position: relative;
}

.yarl__container::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.yarl__container::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.045;  /* slightly higher than body grain — artwork context */
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
  animation: grain 0.2s steps(1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .yarl__container::after {
    animation: none;
    opacity: 0.02;
  }
}
```

**YARL z-index investigation needed:** YARL's internal slide and control elements may have their own `z-index` values. If pseudo-elements at `z-index: 1` render above controls, bump the slide/controls selectors or lower the pseudo-element z-index. Test in browser devtools.

### Pattern 4: Page Entrance Stagger (PAGE-01, PAGE-02)

**What:** About and Contact pages are Next.js Server Components. Animations require a `"use client"` wrapper. Create `AboutContent.tsx` and `ContactContent.tsx` (or a shared `StaggeredSection.tsx`) that wrap the page sections in Motion variants with `staggerChildren`.

**Note:** About and Contact page data is fetched server-side — the approach is to pass the fetched data as props to the client component, or use `whileInView` per section (simpler, no prop-drilling).

**Simpler approach (recommended):** Add `whileInView` directly to top-level section divs — convert specific sections of the page to `motion.div` with `initial/animate` by making the page a client component, OR extract the animated shell as a thin client wrapper that receives children.

**The cleanest pattern for Server Component pages:**
```tsx
// src/components/frontend/PageStagger.tsx
'use client'
import { motion } from 'motion/react'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function PageStagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {children}
    </motion.div>
  )
}

export function PageStaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  )
}
```

**Usage in Server Component page:**
```tsx
// about/page.tsx — server component
import { PageStagger, PageStaggerItem } from '@/components/frontend/PageStagger'

// Wrap the return:
<PageStagger>
  {photo && <PageStaggerItem>{/* photo section */}</PageStaggerItem>}
  {about.bioText && <PageStaggerItem>{/* bio section */}</PageStaggerItem>}
  {about.artistStatement && <PageStaggerItem>{/* statement section */}</PageStaggerItem>}
</PageStagger>
```

**`animate="visible"` vs `whileInView`:** For About/Contact, `animate="visible"` is correct — these are single-screen pages where content should stagger on first render, not on scroll. `whileInView` is for gallery (long scroll). Use `animate` here.

### Pattern 5: SVG Blob Dividers (DECR-01, DECR-02)

**What:** An SVG element placed between page sections that renders an organic ink-stain blob shape. A `motion.path` animates the `d` attribute through 3-4 keyframe blob shapes, looping infinitely at slow speed (8-12s per cycle).

**Hard constraint:** All keyframe blob paths MUST have the same number of SVG path commands AND the same path command type structure (e.g., all cubic bezier `C` commands, same number). Motion cannot interpolate between paths with mismatched command counts without flubber.

**Recommended approach (no flubber):**
1. Generate 3 blob variants using blobmaker.app or similar, specifying "8 nodes" and "smooth" in each — verify all export with the same number of path commands
2. Cross-verify: copy each `d` value and count the path commands — they must match exactly
3. Embed as Motion `d` keyframes

```tsx
// src/components/frontend/InkBlob.tsx
'use client'
import { motion, useReducedMotion } from 'motion/react'

// Pre-generated blob paths — all MUST share the same point count
const BLOB_PATHS = [
  "M 100,80 C 140,20 200,10 240,60 C 280,110 300,180 260,220 C 220,260 140,270 100,230 C 60,190 60,140 100,80 Z",
  "M 110,70 C 155,15 215,5 250,55 C 285,105 295,185 255,225 C 215,265 135,275 95,235 C 55,195 65,125 110,70 Z",
  "M 90,90 C 130,25 195,15 235,65 C 275,115 295,175 255,215 C 215,255 145,265 105,225 C 65,185 50,155 90,90 Z",
]

export function InkBlob({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 340 300"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <motion.path
        fill="var(--color-surface)"
        opacity={0.6}
        d={reducedMotion ? BLOB_PATHS[0] : undefined}
        animate={reducedMotion ? undefined : {
          d: BLOB_PATHS,
        }}
        transition={reducedMotion ? undefined : {
          duration: 10,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
        {...(!reducedMotion && { d: BLOB_PATHS[0] })}
      />
    </svg>
  )
}
```

**Layout integration (DECR-02 — no content displacement):**
```tsx
// In page sections:
<div className="relative">
  <InkBlob className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-auto opacity-40" />
  {/* section content — blob is position: absolute, does not push content */}
</div>
```

### Anti-Patterns to Avoid

- **`rotateX`/`rotateY` on the same element as `perspective`:** CSS `perspective` only applies to child transforms, not to the element itself. Apply `perspective: 1000px` to the parent container (`.masonry-grid_column`), not to the card.
- **React state for mouse position during tilt:** `useState` causes re-renders on every `mousemove` event (potentially 60+ per second per card). Use `useMotionValue` + `animate()` — updates stay off the React render cycle entirely.
- **`whileHover={{ scale }}` alongside tilt:** GLRY-04 requires tilt REPLACES compound hover on desktop. Keep both active and you get competing transforms. Remove `whileHover` when tilt is active.
- **`motion.path` keyframes between paths with mismatched point count:** Motion silently fails or snaps between shapes rather than morphing. Pre-verify path data before implementing.
- **`animate="visible"` stagger on gallery cards:** Gallery uses `whileInView` (scroll-triggered). About/Contact use `animate` (instant on mount). Don't mix these — `animate` on a gallery would trigger all cards at once regardless of scroll position.
- **YARL pseudo-element `z-index` conflict:** YARL's internal elements may have specific z-index stacking. Test that grain/vignette `::before`/`::after` pseudo-elements render between the backdrop color and the slide image, not on top of controls.
- **Blob SVG in document flow:** A blob with `position: static` will push down all subsequent content. Always `position: absolute` or use negative margins. DECR-02 is an explicit requirement — dividers must not displace content.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mouse-to-rotation mapping | Manual `addEventListener('mousemove')` + `requestAnimationFrame` | `useMotionValue` + `animate(mouseX, e.clientX)` from `motion/react` | Motion's `animate()` handles RAF scheduling, spring physics return, and cleanup — custom RAF loop requires manual cleanup and misses spring behavior |
| Reduced-motion guard | Custom `useEffect` + `window.matchMedia` | `useReducedMotion()` from `motion/react` + `MotionConfig reducedMotion="user"` | Already in installed bundle; handles SSR hydration; `MotionConfig` gates the entire Motion tree globally |
| Stagger delay calculation | `index * delay` per child manually | `staggerChildren` in Motion variants container | `staggerChildren` handles dynamic child counts, cleanup on unmount, and integrates with `MotionConfig reducedMotion` |
| SVG path interpolation between different shapes | Custom path point interpolation math | flubber (only if needed) | Path interpolation across different point counts requires converting all commands to cubic bezier and resampling — Flubber implements this correctly; don't hand-roll |

**Key insight:** Motion's motion value system (`useMotionValue`, `animate`, `useTransform`) is specifically designed for cursor-tracking effects — it keeps all mouse event processing off the React render cycle. Any approach that uses `useState` for mouse position will cause visible performance problems on high-refresh-rate monitors.

---

## Common Pitfalls

### Pitfall 1: Perspective Not Applying to Tilt Card

**What goes wrong:** The card doesn't appear to tilt in 3D — it looks like it's just rotating flatly with no depth.

**Why it happens:** `perspective: 1000px` is set on the card element itself (`style={{ perspective: '1000px', rotateX, rotateY }}`). CSS perspective applies to child elements' transforms, not to the element's own transform. A card perspecting itself has no effect.

**How to avoid:** Set `perspective` on the parent container (`.masonry-grid_column` via CSS), not on the `motion.div` card itself.

**Warning signs:** Rotation occurs but appears completely flat, like spinning a 2D card.

### Pitfall 2: Tilt Mouse Leave — Card Stuck Rotated

**What goes wrong:** When the cursor leaves the card, it stays tilted at whatever angle it was at — it doesn't spring back to flat.

**Why it happens:** `mouseX`/`mouseY` motion values retain their last position. On mouse leave, nothing resets them.

**How to avoid:** On `onMouseLeave`, use `animate(mouseX, 0, { type: 'spring', ... })` and `animate(mouseY, 0, { type: 'spring', ... })`. The spring brings it smoothly back to center.

**Warning signs:** Hovering and moving off a card leaves it tilted.

### Pitfall 3: Blob Path Morphing Fails (Snaps Instead of Morphs)

**What goes wrong:** Instead of smooth organic morphing between blob shapes, the path snaps instantly from one shape to another between keyframes.

**Why it happens:** The blob path keyframes have different numbers of path commands, or use different command types (e.g., mixing `C` cubic bezier with `Q` quadratic or `L` linear commands). Motion cannot interpolate between incompatible path structures.

**How to avoid:** Use a blob generator that exports consistent cubic bezier paths with a fixed node count (e.g., 8 nodes). Count path commands in each exported `d` value before using. If counts differ, regenerate until consistent.

**Warning signs:** The blob visibly jumps between shapes; no smooth transition occurs.

### Pitfall 4: Stagger Animation Fires on Every Visit (About/Contact)

**What goes wrong:** On return visits or navigating away and back, the About/Contact stagger re-fires on every page load — users see the same entrance animation each time, which becomes annoying.

**Why it happens:** `animate="visible"` triggers on every component mount. Unlike `whileInView` with `viewport={{ once: true }}`, there is no "once" mechanism for `animate`.

**How to avoid:** This is acceptable for About/Contact (single content pages, not re-scrolled like gallery). BUT if it proves annoying, consider `whileInView` with `viewport={{ once: true, amount: 0.1 }}` on the first section as a trigger — this fires once on first scroll into view per page load. Alternatively, use `sessionStorage` to track if the page has been visited in the current session and skip stagger on return.

**Warning signs:** Users report repetitive animation on every navigation.

### Pitfall 5: YARL Grain Pseudo-Element Blocks Lightbox Controls

**What goes wrong:** Clicking the lightbox close button, navigation arrows, or captions doesn't work.

**Why it happens:** A `.yarl__container::after` pseudo-element without `pointer-events: none` intercepts click events before they reach the controls below.

**How to avoid:** ALWAYS add `pointer-events: none` to `.yarl__container::before` and `::after`. This is PERF-02 requirement — enforced by the requirement itself.

**Warning signs:** Lightbox opens but close button, arrows, and captions are unclickable.

### Pitfall 6: `MotionConfig` in Server Component

**What goes wrong:** Adding `<MotionConfig reducedMotion="user">` directly to `(frontend)/layout.tsx` (a Server Component) throws a build error because `MotionConfig` is a client-boundary component.

**Why it happens:** `MotionConfig` uses React context, which requires a client component boundary.

**How to avoid:** Create `MotionProvider.tsx` as a dedicated `"use client"` wrapper (Pattern 2 above). Import it in `layout.tsx`. This is a one-time setup — zero visual change.

**Warning signs:** Build error: "You're importing a component that needs createContext. It only works in a Client Component..."

---

## Code Examples

Verified patterns from official or credibly cross-referenced sources:

### 3D Tilt Card — Core Motion Value Pattern

```tsx
// Source: arielbk.com/blog/how-to-make-a-3d-shiny-card-animation (WebFetch verified full code)
// Adapted to per-card scope (not window-level tracking)

import { useMotionValue, useTransform, animate, motion } from 'motion/react'
import { useRef } from 'react'

function TiltCard({ children, className, onClick }: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const dampen = 25

  const rotateX = useTransform(mouseY, (y) => {
    if (!cardRef.current) return 0
    const rect = cardRef.current.getBoundingClientRect()
    return -(y - rect.top - rect.height / 2) / dampen
  })

  const rotateY = useTransform(mouseX, (x) => {
    if (!cardRef.current) return 0
    const rect = cardRef.current.getBoundingClientRect()
    return (x - rect.left - rect.width / 2) / dampen
  })

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={(e) => {
        animate(mouseX, e.clientX, { duration: 0 })
        animate(mouseY, e.clientY, { duration: 0 })
      }}
      onMouseLeave={() => {
        animate(mouseX, 0, { type: 'spring', stiffness: 300, damping: 30 })
        animate(mouseY, 0, { type: 'spring', stiffness: 300, damping: 30 })
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
```

### Desktop-Only Tilt Gate

```tsx
// GalleryGrid.tsx — detect hover capability once on mount
import { useState, useEffect } from 'react'

function useIsHoverDevice() {
  const [isHover, setIsHover] = useState(false)
  useEffect(() => {
    setIsHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])
  return isHover
}

// In GalleryGrid:
const isHoverDevice = useIsHoverDevice()

// In sorted.map:
const CardWrapper = isHoverDevice ? TiltCard : motion.div

return (
  <CardWrapper
    key={piece.id}
    ref={isHoverDevice ? undefined : undefined}  // TiltCard has its own ref
    className="gallery-card relative group cursor-pointer overflow-hidden rounded-sm"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, ease: 'easeOut', delay: Math.min(idx, 12) * 0.07 }}
    // whileHover removed on desktop when tilt is active — GLRY-04
    {...(!isHoverDevice && { whileHover: { scale: 1.025 } })}
    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true) }}
  >
    {/* ... */}
  </CardWrapper>
)
```

### Page Stagger — Client Wrapper Pattern

```tsx
// Source: StaticMania Next.js Motion tutorial (verified pattern; stagger is standard Motion API)
// src/components/frontend/PageStagger.tsx

'use client'
import { motion } from 'motion/react'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function PageStagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  )
}

export function PageStaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
```

### SVG Blob Morphing — Motion Path Keyframes

```tsx
// Source: motion.dev/docs/react-svg-animation + blog.olivierlarose.com/tutorials/svg-morph
// Key constraint: all paths MUST share same number of SVG commands

'use client'
import { motion, useReducedMotion } from 'motion/react'

// IMPORTANT: verify all paths have same number of cubic bezier commands
const BLOB_PATHS = [
  "M 170,60 C 210,10 280,5 310,50 C 340,95 330,175 290,210 C 250,245 170,250 130,215 C 90,180 80,130 90,90 C 100,50 130,110 170,60 Z",
  // variant 2 — same command count as above
  // variant 3 — same command count
]

export function InkBlob({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 340 280"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      {prefersReducedMotion ? (
        <path d={BLOB_PATHS[0]} fill="var(--color-surface)" opacity={0.5} />
      ) : (
        <motion.path
          d={BLOB_PATHS[0]}
          fill="var(--color-surface)"
          opacity={0.5}
          animate={{ d: BLOB_PATHS }}
          transition={{
            duration: 10,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      )}
    </svg>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useState` for mouse position in tilt effects | `useMotionValue` + `animate()` off React cycle | Motion v10+ (2023) | Eliminates 60fps re-renders during cursor tracking; compositor-thread only |
| `framer-motion` package | `motion/react` import from `motion` package | Motion v11 (2024) | Already using correct import in this project |
| Manual `window.matchMedia` in `useEffect` | `useReducedMotion()` hook | Motion v6+ | Handles SSR hydration correctly; bundled with installed package |
| GSAP MorphSVG for path morphing | Motion `d` keyframes (same-point paths) or flubber | 2024+ | For same-point blobs: Motion handles natively, no GSAP needed |
| SMIL `<animate>` for SVG path morph | Motion `motion.path` + keyframes | 2023+ | Motion provides `prefers-reduced-motion` integration; SMIL has no JS/motion-preference bridge |
| Page-level `"use client"` for animations | Thin `"use client"` wrapper around animated sections only | App Router best practice 2023+ | Keeps server data-fetching in Server Components; minimizes client bundle |

**Deprecated/outdated:**
- `useViewportScroll`: Replaced by `useScroll`. Not used in Phase 6.
- Wrapping entire page in `"use client"`: Anti-pattern for App Router — data fetching moves to server, only animation wrappers need client boundary.
- `AnimatePresence` for page transitions: Phase 7 concern; explicitly not part of Phase 6 scope.

---

## Open Questions

1. **YARL internal z-index stacking**
   - What we know: `.yarl__container` is `position: fixed; z-index: 9999`. Internal elements (slide image, controls, captions) have their own z-index values.
   - What's unclear: What z-index values do YARL's internal elements use? Will `::before`/`::after` at `z-index: 1` render correctly between backdrop and slide?
   - Recommendation: During implementation, use browser DevTools to inspect the YARL stacking context. If pseudo-elements appear above controls, adjust z-index or move grain effect to a CSS class on the slide container instead.

2. **Blob path generation with consistent point count**
   - What we know: Motion requires same-structure paths for smooth `d` attribute morphing.
   - What's unclear: Which free blob generator exports reliably consistent cubic bezier paths with a specified node count? blobmaker.app is commonly cited but not verified for consistent node counts across exports.
   - Recommendation: Use SVG Path Editor (yqnn.github.io/svg-path-editor/) to manually create and verify blob paths with exactly N cubic bezier commands — more reliable than automated generators. Alternatively, hand-write 3 slight variations of the same blob by adjusting control points manually.

3. **TiltCard and GalleryGrid scroll-reveal interaction**
   - What we know: Phase 5 added `initial={{ opacity: 0, y: 24 }}` + `whileInView={{ opacity: 1, y: 0 }}` on each `motion.div` card. Phase 6 adds tilt via a wrapping component.
   - What's unclear: If `TiltCard` is a wrapper `motion.div`, does it interfere with the inner `motion.div`'s scroll-reveal `initial`/`whileInView` props? Motion supports nested `motion.div` elements, but layering scroll-reveal on one and tilt on another may require restructuring.
   - Recommendation: Make `TiltCard` the OUTER element and move the scroll-reveal props (`initial`, `whileInView`, `viewport`, `transition`) onto it — consolidating all motion props on one element per card. The tilt `style` + scroll-reveal `animate` live together on the same `motion.div`.

4. **`MotionConfig reducedMotion="user"` and `d` attribute morphing**
   - What we know: `MotionConfig reducedMotion="user"` pauses transform animations for reduced-motion users.
   - What's unclear: Whether the `d` attribute keyframe animation is gated by `MotionConfig reducedMotion` or requires a separate `useReducedMotion()` guard.
   - Recommendation: Use explicit `useReducedMotion()` guard in `InkBlob` as shown in the code example above — render a static `<path>` instead of `<motion.path>` for reduced-motion users. Don't assume `MotionConfig` covers `d` morphing.

---

## Sources

### Primary (HIGH confidence)
- arielbk.com/blog/how-to-make-a-3d-shiny-card-animation — Complete TypeScript tilt card code with `useMotionValue`, `useTransform`, `animate`, `getBoundingClientRect`, `dampen` variable (WebFetch full code verified)
- blog.olivierlarose.com/tutorials/svg-morph — SVG path morphing constraint (same point count required) + flubber integration code (WebFetch content verified)
- yet-another-react-lightbox.com/customization — `--yarl__color_backdrop` CSS variable + `.yarl__container` CSS class confirmed (WebFetch verified)
- ibelick.com/blog/create-tilt-effect-with-react — Mouse position to rotation angle formula with `getBoundingClientRect` (WebFetch verified implementation)
- stackrant.com/posts/tiltable-cards — Alternative tilt implementation with `useState` + `getBoundingClientRect` percentage calculation (WebFetch full code verified)

### Secondary (MEDIUM confidence)
- StaticMania Next.js Motion tutorial — stagger + App Router `"use client"` wrapper pattern (WebSearch verified, matches official Motion API)
- hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components — Server Component wrapper pattern for Motion animations (WebSearch verified, consistent with Next.js App Router docs)
- motion.dev/examples/react-tilt-card — Official Motion tilt card example (WebSearch confirmed exists; page JS-rendered, content not directly fetchable — but implementation verified via arielbk which references the same official Motion API)
- motion.dev/tutorials/react-path-morphing — Official Motion path morphing tutorial (WebSearch confirmed exists; page JS-rendered, content not directly fetchable — implementation verified via olivierlarose)

### Tertiary (LOW confidence)
- blobmaker.app — Cited as blob generator; not directly tested for consistent point count exports across multiple shapes. Treat as starting point only; verify exported path commands manually.
- `MotionConfig reducedMotion="user"` gating `d` morphing — Not directly verified via official docs; recommendation to use explicit `useReducedMotion()` guard as a conservative approach.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — motion 12 installed; all APIs used (useMotionValue, useTransform, animate, MotionConfig, useReducedMotion, motion.path) are stable and verified
- 3D tilt pattern: HIGH — complete working TypeScript code verified from multiple independent sources using the same approach
- Lightbox CSS injection: MEDIUM — `.yarl__container` CSS class confirmed; z-index stacking of internal YARL elements not verified without browser inspection
- Blob morphing: MEDIUM — same-point-count constraint confirmed by multiple sources; exact path generation workflow requires manual verification
- Page stagger: HIGH — standard Motion staggerChildren + "use client" wrapper is well-documented and consistent across sources
- Reduced-motion: HIGH — MotionConfig + useReducedMotion both stable; only uncertainty is whether MotionConfig covers 'd' morphing

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (Motion 12 stable; YARL 3.x stable; SVG filter patterns are browser-native)
