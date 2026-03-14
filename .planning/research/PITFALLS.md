# Pitfalls Research

**Domain:** Adding heavy visual effects (particles, scroll animations, parallax, page transitions, texture overlays, micro-interactions) to an existing mobile-first Next.js 15 portfolio
**Researched:** 2026-03-14
**Confidence:** HIGH — critical pitfalls verified against official Motion docs, web.dev, confirmed GitHub issues, and W3C WCAG

---

## Critical Pitfalls — v1.1 Visual Effects

These are specific to ADDING visual effects to a working production site. They are ordered by severity and likelihood.

---

### Pitfall 1: AnimatePresence Conflict with Existing IntroAnimation

**What goes wrong:**
The existing `IntroAnimation` component wraps the entire gallery inside its own `AnimatePresence`. Adding a second `AnimatePresence` at the layout level — the standard approach for page transitions — creates nested `AnimatePresence` instances. Exit animations from the inner instance get swallowed by the outer one, or trigger double-unmount errors (`TypeError: Failed to execute 'getComputedStyle'`). The gallery never fades in after the intro, or intermittently stays blank.

**Why it happens:**
Nesting `AnimatePresence` instances with overlapping keys or `mode="wait"` causes Motion to lose track of which component controls the unmount sequence. The outer `AnimatePresence` observes the inner one's children unmounting and tries to orchestrate them, while the inner one does the same. This is a confirmed, reproducible bug in motiondivision/motion issue #2387.

**How to avoid:**
- Before adding any layout-level animation wrapper, audit the existing IntroAnimation and remove its `AnimatePresence` wrapper
- Refactor `IntroAnimation` to use a `useState`-gated `motion.div` directly: `{showIntro && <motion.div exit={{...}}>...</motion.div>}`, then delegate unmounting to the layout-level `AnimatePresence`
- Maintain exactly **one** `AnimatePresence` in the component tree for page-level orchestration

**Warning signs:**
- Gallery renders blank after intro completes (state is stuck, no children passed to the new `AnimatePresence`)
- React throws "Cannot read properties of undefined" during navigation from gallery to about
- Intro animation plays but transitions to a white flash instead of gallery

**Phase to address:**
IntroAnimation Enhancement phase — audit and refactor before adding any outer wrappers.

---

### Pitfall 2: Page Transitions Silently Broken in Next.js App Router

**What goes wrong:**
`AnimatePresence` page transitions work in `next dev` but either flash or skip exit animations entirely in production (`next build && next start`). Entry animations fire; exit animations silently do nothing. The page appears to teleport rather than transition.

**Why it happens:**
The Next.js App Router does not expose a stable routing context that Motion's `AnimatePresence` can hook into. The App Router signals the new route immediately, causing React to unmount the exiting page before the `exit` variant has time to play. This is an unresolved, confirmed limitation tracked in vercel/next.js discussion #42658 and #59349 — it is not a bug that will be "fixed soon."

**How to avoid:**
- Implement page transitions as **enter-only**: fade in + slide up on arrival, no exit animation needed. This looks cinematic and works reliably.
- Use `motion.div` with `key={pathname}` wrapping page content in the `(frontend)` layout
- If exit animations are genuinely required: use `next-transition-router` library which implements the "FrozenRouter" pattern to prevent unmount until animation completes
- Never use `AnimatePresence mode="wait"` at the layout level — it blocks navigation indefinitely on some paths

**Warning signs:**
- Exit animations work in `next dev` but not after `next build`
- A single-frame white or black flash appears between pages in production
- Console warning: "AnimatePresence requires children to have a key prop"

**Phase to address:**
Page Transitions phase — must come before particles or scroll effects so failures are isolated.

---

### Pitfall 3: GPU Layer Explosion Crashing Android Tabs

**What goes wrong:**
Applying `whileHover`, `whileInView`, or `animate` to every gallery card (30-50+ elements in the masonry grid) simultaneously promotes each card to its own GPU compositor layer. Combined with a film grain overlay, a particle canvas, and a navbar with motion, total GPU memory exceeds what a mid-range Android browser allows. The tab is killed silently. The site appears to crash for no reason.

**Why it happens:**
Each compositor layer (created by `transform`, `will-change: transform`, `opacity` transitions, or Motion's animation system) requires a texture upload to the GPU. Mobile GPUs have 256MB–512MB of VRAM available to the browser. 40 animated gallery cards + 1 particle canvas + 1 grain overlay can push past this on devices with 2-3GB total RAM, which represents a large fraction of real phones viewing this portfolio.

**How to avoid:**
- Limit simultaneous Motion-animated elements to **≤10 at any time** using `whileInView` (deactivates off-screen elements) rather than animating all cards on mount
- Apply `will-change: transform` only during active animation, not statically in CSS
- Remove `will-change` after animations complete: `onAnimationComplete={() => setWillChange(false)}`
- Audit with Chrome DevTools Layers panel — target fewer than 15 composite layers during normal gallery scroll
- Test on real mid-range Android (or Chrome DevTools CPU 6x throttle + Mid-tier mobile preset)

**Warning signs:**
- Chrome DevTools Layers panel shows 40+ compositor layers
- DevTools Memory profiler shows GPU memory above 150MB during scroll
- 60fps on iPhone, 15fps or tab crash on Android devices with ≤3GB RAM
- Samsung Internet or Chrome Android kills the tab after 30 seconds on the gallery

**Phase to address:**
Gallery Interactions phase — establish GPU budget before adding scroll reveals.

---

### Pitfall 4: Canvas Particle Systems Destroying Mobile Performance

**What goes wrong:**
Canvas-based particle engines (tsParticles or custom `requestAnimationFrame` loops) run at 60fps continuously regardless of whether anything is happening on screen. On mobile this burns CPU constantly, heats the device within 30-60 seconds, drains battery, and competes with scroll event processing — causing all other animations to drop frames.

**Why it happens:**
Particle systems were designed for desktop hero sections. A standard tsParticles configuration with 80 particles runs a draw loop 60 times per second. On a mid-range Snapdragon 778G, this can consume 15-20% CPU at idle — before any user interaction.

**How to avoid:**
- Hard cap: **30 particles maximum on mobile** (`window.innerWidth < 768` check inside `useEffect`, not at render time)
- Set `fpsLimit: 30` in tsParticles config for all devices — imperceptible to users, halves CPU cost
- Use `IntersectionObserver` to pause the canvas animation loop when it scrolls out of viewport
- Use `dynamic(() => import('@tsparticles/react'), { ssr: false })` — tsParticles accesses `window` at import, causing SSR errors and hydration mismatches
- Use `loadSlim` not full tsParticles bundle — removes ~60KB of unused particle renderers
- Consider CSS-only fog/smoke alternatives: a slow-moving `linear-gradient` with `filter: blur()` is GPU-composited, costs near-zero CPU, and reads as atmospheric

**Warning signs:**
- Chrome DevTools Performance tab shows >20% scripting time per frame at idle
- Device becomes warm within 60 seconds of the gallery being open
- Scroll drops from 60fps to 30fps when particles are active (visible in DevTools Frames)

**Phase to address:**
Particles/Atmosphere phase — establish mobile budget before any particle configuration.

---

### Pitfall 5: Parallax Broken on iOS Safari (Primary Device)

**What goes wrong:**
Parallax effects that use `window.scrollY` scroll event listeners, `background-attachment: fixed`, or read `scrollTop` in a synchronous loop produce choppy or completely non-functional parallax on iOS Safari. The effect looks smooth in Chrome desktop and Android Chrome but is visibly broken on iPhone — which is the **primary device** for this portfolio (QR code → phone in a tattoo shop).

**Why it happens:**
iOS Safari fires `scroll` events asynchronously, after the scroll has already rendered, causing parallax positions to be a frame late. `background-attachment: fixed` has no hardware acceleration path in WebKit. iOS also uses momentum-based scrolling that bypasses JavaScript scroll handlers entirely during the momentum (coasting) phase.

**How to avoid:**
- Use Motion's `useScroll` + `useTransform` with `motionValue` — Motion uses passive scroll listeners that update synchronously before paint
- Always use `transform: translateY()` for parallax movement — never `top`, `margin-top`, `background-position`, or `left`
- Add `style={{ transform: 'translate3d(0,0,0)' }}` to parallax containers to force GPU layer promotion on iOS WebKit
- Gate parallax effects behind `@media (hover: hover)` — most phone users won't notice the loss; those on desktop get the full effect

**Warning signs:**
- Parallax works in Chrome DevTools Device Emulation but not on a physical iPhone
- Scroll progress bar lags 2-3 frames behind actual position on iOS during momentum scroll
- Safari console logs showing passive event listener violations

**Phase to address:**
Gallery Interactions phase — "done" definition must include a physical iPhone test.

---

### Pitfall 6: Hydration Mismatch from Browser-Dependent Animation State

**What goes wrong:**
New animation components that read browser APIs (`window.innerWidth`, `matchMedia`, `localStorage`, `navigator.hardwareConcurrency`) during render (not inside `useEffect`) cause React hydration mismatches. The server renders one state; the client renders another. In production, Next.js throws a hydration error that can blank the entire component subtree — users see no gallery.

**Why it happens:**
The existing `IntroAnimation` handles this correctly (all browser reads inside `useEffect`). But new effects frequently make the mistake of checking device type or reduced-motion preference during render. Common example: `const isMobile = typeof window !== 'undefined' && window.innerWidth < 768` at the top of a component body.

**How to avoid:**
- All browser API reads go inside `useEffect`, never in component body or default state initialization
- For reduced-motion: use Motion's `useReducedMotion()` hook (it is SSR-safe and reactive)
- For device detection: use CSS media queries via Tailwind, not JavaScript `window.innerWidth` at render time
- Wrap all canvas-based components (particles, WebGL) in `dynamic(() => import(...), { ssr: false })`
- After each new animated component: run `next build && next start`, open in a fresh private window, check for hydration errors in console

**Warning signs:**
- Next.js console error: "Hydration failed because the initial UI does not match what was rendered on the server"
- Page flickers on first load in production but works fine in `next dev`
- Random users report seeing no gallery (hydration error blanked the component tree for that render)

**Phase to address:**
Every phase — this is a non-negotiable rule for every new animated component.

---

### Pitfall 7: Reduced Motion Not Respected Across All New Effects

**What goes wrong:**
The existing `IntroAnimation` correctly checks `prefers-reduced-motion`. New effects added in v1.1 bypass this check because they are built without reviewing the existing pattern. Users with vestibular disorders who have set the OS reduced-motion preference experience nauseating parallax, spinning particles, and looping transitions — on a site that already demonstrated it can respect their preference.

**Why it happens:**
Each new effect is built in isolation. The particle author adds their own logic; the page transition author adds theirs; the parallax author skips it entirely. No shared reduced-motion gate means patchwork coverage.

**How to avoid:**
- Create a shared `useMotionPreference()` hook wrapping `useReducedMotion()` from Motion — import it in every animated component
- Define explicit fallback states: particles → static SVG texture; parallax → no movement; page transitions → instant swap with `duration: 0`; scroll reveals → content visible immediately
- WCAG 2.3.3 principle: parallax and particles are never functionally essential — they must be disableable
- Test: set `prefers-reduced-motion: reduce` in OS accessibility settings, reload site — zero movement permitted

**Warning signs:**
- Any animated component that does NOT import `useReducedMotion` or the shared hook
- Parallax movement still visible with OS reduced-motion enabled
- Particles still running with OS reduced-motion enabled

**Phase to address:**
Every phase — required in each phase's success criteria before the phase is considered done.

---

### Pitfall 8: Film Grain / Texture Overlay Causing CSS Layer Proliferation

**What goes wrong:**
A fixed-position `::after` pseudo-element with `filter: url(#turbulence)` or an animated `background-image` covering the full viewport creates a full-screen composite layer that sits above the content. Combined with gallery cards promoted to their own layers, the browser can no longer merge them — the grain overlay forces every element it overlaps to become its own layer too (implicit compositing). This doubles GPU memory use silently.

**Why it happens:**
The browser compositing model requires that any element overlapping a composite layer from a lower z-index must also be promoted to a composite layer to be correctly composited. A full-screen grain overlay with `z-index > 0` and `position: fixed` overlaps everything — triggering implicit promotion of every gallery card, navbar, and footer element simultaneously.

**How to avoid:**
- Use `mix-blend-mode: overlay` or `mix-blend-mode: multiply` on the grain layer — this allows the browser to composite it without promoting all underlying elements
- Keep grain at `pointer-events: none` and `z-index: 1` (as low as possible)
- Use `isolation: isolate` on the gallery container to contain compositing effects within that subtree
- Test grain + gallery simultaneously in Chrome DevTools Layers panel — layer count should not increase dramatically from grain's presence alone
- Alternative: use a static PNG texture (subtle, tileable grain PNG) with CSS `opacity` cycling instead of an animated filter — vastly cheaper

**Warning signs:**
- Layers panel shows 2x more layers after adding grain overlay than before
- Gallery scroll drops to 30fps as soon as grain overlay is added
- DevTools shows "composited reasons: overlap" on gallery card layers

**Phase to address:**
Texture/Grain phase — test grain overlay in isolation on the Layers panel before combining with other effects.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `will-change: transform` on all animated elements | Eliminates jank on developer's machine | GPU memory exhaustion on mobile, implicit layer promotion | Only on elements actively animating, removed after |
| Inline reduced-motion checks per component | Fast to build each effect | Five different implementations, some incomplete | Never — create shared hook from day one |
| `window.innerWidth` check during render | Simple device branching | Hydration mismatch, SSR errors in production | Never — use useEffect or CSS media queries |
| Full tsParticles bundle import | One import line | +60KB gzip, all unused renderers loaded | Never — use loadSlim |
| Nested `AnimatePresence` for intro + transitions | Both effects work independently | Double-unmount bugs, gallery stuck blank | Never — single AnimatePresence at layout level |
| Hard-coded `transition={{ duration: 0.8 }}` per component | Each component feels individually tuned | Inconsistent motion rhythm, impossible to adjust globally | Only in prototyping — replace with motion tokens |
| Animated grain via CSS `@keyframes` on full-page div | Atmospheric effect with one element | 5% extra CPU on Android during scroll | Only if measured as acceptable on target device |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Motion + existing IntroAnimation | Add layout-level AnimatePresence without refactoring IntroAnimation's own AnimatePresence | Audit IntroAnimation first, remove its AnimatePresence, delegate to layout-level wrapper |
| Motion `useScroll` + YARL lightbox | YARL applies `overflow: hidden` on body during lightbox open, breaking `useScroll` scroll tracking | Read `lightboxOpen` state and pause/skip scroll-linked animations while lightbox is open |
| tsParticles + Next.js SSR | Import tsParticles at module level — accesses `window` immediately | `dynamic(() => import('@tsparticles/react'), { ssr: false })` |
| Film grain `::after` + Next/Image blur placeholder | Fixed grain overlay at high z-index visually obscures blur loading placeholder | Lower grain z-index below image layer, or apply grain only after `onLoadingComplete` |
| Layout-level Motion wrappers + Payload `/admin` routes | Motion `<motion.div>` in root layout wraps admin routes unexpectedly | Scope all Motion wrappers to `(frontend)` route group layout only, never root `layout.tsx` |
| Tailwind v4 + Motion inline styles | Motion writes inline `transform` that conflicts with Tailwind transform utilities | Use Motion values for all transform-based animation; use Tailwind for static layout only |
| Parallax + `react-masonry-css` | Masonry column layout uses flexbox; parallax `translateY` shifts items out of column flow | Apply parallax to image element only, not to the masonry cell wrapper div |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Testing only on MacBook + Chrome DevTools | Effects smooth in dev, janky or crashing on real phones | Test on real mid-range Android (or CPU 6x throttle) from day one | Immediately on real mid-range Android |
| `whileHover` on all gallery cards at once | Looks fine with 6 cards visible | Limit with `whileInView` — only cards in viewport get GPU layers | 20+ simultaneous cards in view |
| Particle system always running (no IntersectionObserver pause) | Fine at launch, drains battery continuously | Pause canvas loop when container scrolls out of viewport | Continuous on any mobile device |
| Scroll event listeners for parallax instead of Motion `useScroll` | Smooth on desktop, choppy on iOS momentum scroll | Use Motion `useScroll` motionValue | iOS Safari immediately |
| `motion.div` wrapping every element without `layout` audit | CLS score degrades — motion.div adds anonymous div wrappers that change document height | Keep motion wrappers structurally transparent; `layout="preserve-aspect"` where needed | Reported in Lighthouse CLS audit |
| Multiple `layoutId` transitions simultaneously | One shared-element transition looks great | Only one active `layoutId` transition allowed at a time | Any concurrent open/close interaction |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Transitions blocking gallery access | Shop owner scans QR, waits 2s for transition to finish before seeing art | All transitions under 400ms; `prefers-reduced-motion` gets instant swap |
| Parallax shifting artwork titles out of alignment | Title overlays move at different rate from artwork, become unreadable | Parallax only on image layer, never on text overlays |
| Particles obscuring gallery artwork thumbnails | User cannot evaluate the art they came to see | Particles confined to negative space — never over gallery image bounds |
| Film grain too opaque | Portfolio looks dirty/degraded rather than cinematic | Max 15% grain opacity; test on OLED (grain most visible on high-contrast OLED) |
| Hover micro-interactions on touch devices | `hover` state sticks after tap on iOS, showing overlay permanently | Guard all hover effects with `@media (hover: hover)` |
| Page exit animation on contact form submit | User submits, sees exit animation, thinks something went wrong | Disable transitions on programmatic navigation (form submits), only on user-initiated link clicks |

---

## "Looks Done But Isn't" Checklist

- [ ] **Reduced motion:** OS `prefers-reduced-motion: reduce` enabled — reload site — zero movement except optional opacity fades
- [ ] **iOS Safari parallax:** Physical iPhone test (not DevTools emulation) — parallax smooth during momentum scroll phase
- [ ] **Android mid-range:** CPU 6x throttle in Chrome Performance panel — 30fps minimum during gallery scroll with all effects active
- [ ] **Single AnimatePresence:** Confirm React DevTools component tree shows exactly one AnimatePresence for page-level transitions
- [ ] **GPU layer count:** Chrome DevTools Layers panel during gallery scroll — fewer than 15 compositor layers
- [ ] **Particle tab stability:** Enable particles, leave gallery open on mobile for 60 seconds — tab should not crash
- [ ] **Hydration clean:** `next build && next start`, fresh private window — zero hydration warnings in browser console
- [ ] **Lightbox + scroll coexistence:** Open YARL lightbox while scroll animations are active — no conflicts, scroll lock works correctly
- [ ] **Touch hover states:** Tap a gallery card on iOS — hover overlay does not persist after tap
- [ ] **Admin route isolation:** Navigate to `/admin` — no particles, no scroll effects, no frontend motion wrappers
- [ ] **Grain on OLED:** Film grain on an OLED display — reads as cinematic texture, not visual noise or dirty degradation

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| AnimatePresence conflict breaks intro or gallery | MEDIUM | Remove AnimatePresence from IntroAnimation, replace with useState-gated motion.div, verify intro → gallery transition |
| GPU layer explosion crashing Android | LOW | Add `style={{ willChange: 'auto' }}` to static cards; run Layers audit; remove will-change from non-animating elements |
| Particle system tanking mobile perf | LOW | Set `fpsLimit: 30` and reduce particle count to ≤30 for mobile in tsParticles config; confirm with Performance tab |
| Hydration mismatch blanking page | LOW-MEDIUM | Move all browser API reads into useEffect; use Motion's `useReducedMotion()`; use `dynamic({ ssr: false })` for canvas components |
| iOS parallax completely broken | MEDIUM | Replace scroll event listener with Motion `useScroll` motionValue; add `translate3d(0,0,0)` to container; verify on physical iPhone |
| Page transition skipping exit animations | MEDIUM | Remove exit animations (enter-only pattern); or adopt `next-transition-router` library for frozen router support |
| Film grain doubling layer count | LOW | Switch to static PNG texture + CSS opacity transition; or apply `isolation: isolate` to gallery container |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| AnimatePresence conflict with IntroAnimation | Phase 1 (IntroAnimation Enhancement) | Single AnimatePresence in tree, intro plays and gallery fades in correctly |
| Page transitions broken in App Router | Phase 2 (Page Transitions) | All 3 pages navigated in production build — no flicker, no stuck states |
| GPU layer explosion | Phase 3 (Gallery Interactions) | Layers panel during scroll shows <15 composite layers |
| Particle system mobile perf | Phase 4 (Particles/Atmosphere) | 6x CPU throttled trace — <20% scripting at idle with particles running |
| iOS Safari parallax jank | Phase 3 (Gallery Interactions) | Physical iPhone: parallax smooth during momentum scroll |
| Hydration mismatch | Every phase | `next build` console — zero hydration warnings |
| Reduced motion not respected | Every phase | OS reduced-motion: reload — zero movement |
| Touch hover states sticking | Phase 3 (Gallery Interactions) | iOS tap test — hover overlay does not persist |
| Film grain layer explosion | Phase 5 (Texture/Grain) | Layers panel before + after grain — no significant layer increase |
| Particles over artwork | Phase 4 (Particles/Atmosphere) | Visual audit: particles never overlap gallery image bounds |

---

## Mobile Performance Budget

Concrete limits for the Vercel free tier, mobile-first (QR code → phone) target.

| Metric | Target | Danger Zone | Test Method |
|--------|--------|-------------|-------------|
| LCP (gallery load) | < 2.5s on 4G | > 4s | Lighthouse mobile throttled |
| INP (tap to response) | < 200ms | > 500ms | Chrome DevTools Performance |
| CLS | < 0.1 | > 0.25 | Lighthouse — watch for motion.div height changes |
| Animation frame rate | 30fps minimum mobile | < 24fps | DevTools Performance → Frames |
| Active compositor layers | < 15 | > 30 | Chrome DevTools Layers panel |
| Particle count (mobile, <768px) | ≤ 30 | > 60 | tsParticles config audit |
| Particle FPS cap | 30fps on mobile | 60fps (unnecessary) | tsParticles `fpsLimit` option |
| JS bundle addition for all v1.1 effects | < 60KB gzip total | > 150KB gzip | `next build` output analysis |
| Simultaneous active Motion components | ≤ 10 | > 25 | Code audit + DevTools Layers |

---

## Sources

- [Motion Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list) — HIGH confidence, official Motion documentation
- [Motion React Scroll Animations docs](https://motion.dev/docs/react-scroll-animations) — HIGH confidence, official
- [Next.js App Router AnimatePresence — Discussion #42658](https://github.com/vercel/next.js/discussions/42658) — HIGH confidence, confirmed ongoing issue
- [Next.js App Router Page Transitions — Discussion #59349](https://github.com/vercel/next.js/discussions/59349) — HIGH confidence, confirmed
- [Nested AnimatePresence bug — motiondivision/motion #2387](https://github.com/framer/motion/issues/2387) — HIGH confidence, confirmed bug
- [Solving Framer Motion Page Transitions in Next.js App Router](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) — MEDIUM confidence
- [Performant Parallaxing — Chrome Developers](https://developer.chrome.com/blog/performant-parallaxing) — HIGH confidence, official Chrome guidance
- [Stick to Compositor-Only Properties and Manage Layer Count — web.dev](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) — HIGH confidence, official
- [CSS GPU Animation: Doing It Right — Smashing Magazine](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) — MEDIUM confidence (older but principles unchanged)
- [WCAG 2.3.3 Animation from Interactions — W3C](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) — HIGH confidence, official specification
- [C39: Using prefers-reduced-motion — W3C](https://www.w3.org/WAI/WCAG21/Techniques/css/C39) — HIGH confidence, official
- [Animation and Motion Accessibility — web.dev](https://web.dev/learn/accessibility/motion) — HIGH confidence, official
- [tsParticles React — npm](https://www.npmjs.com/package/@tsparticles/react) — HIGH confidence, official package
- [Core Web Vitals 2025 Standards — web.dev](https://web.dev/articles/vitals) — HIGH confidence, official

---
*Pitfalls research for: Adding dark & dangerous visual effects (ink/smoke particles, scroll animations, parallax, page transitions, texture overlays, micro-interactions) to existing Next.js 15 mobile-first artist portfolio*
*Researched: 2026-03-14*
