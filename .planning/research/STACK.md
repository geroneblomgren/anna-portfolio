# Stack Research

**Domain:** Artist portfolio — v1.1 Dark & Dangerous visual/UX overhaul
**Researched:** 2026-03-14
**Confidence:** MEDIUM-HIGH

> **Scope note:** This document covers ONLY stack additions/changes for v1.1.
> The existing stack (Next.js 15.3.9, Payload CMS 3.79.0, Motion 12.36.0,
> Tailwind v4, Turso, Vercel Blob, Resend, Sharp, YARL, react-masonry-css)
> is validated and not re-researched here.

---

## v1.0 Validated Stack (Reference Only)

| Technology | Version | Status |
|------------|---------|--------|
| Next.js | 15.3.9 | Installed, validated |
| Payload CMS | 3.79.0 | Installed, validated |
| Motion (Framer Motion) | 12.36.0 | Installed, validated |
| Tailwind CSS | 4.1.11 | Installed, validated |
| Turso SQLite | via @payloadcms/db-sqlite 3.79.0 | Installed, validated |
| Vercel Blob | via @payloadcms/storage-vercel-blob | Installed, validated |
| Resend | 6.9.3 | Installed, validated |
| Sharp | 0.34.5 | Installed, validated |
| yet-another-react-lightbox | 3.29.1 | Installed, validated |
| react-masonry-css | 1.0.16 | Installed, validated |

---

## Recommended Stack Additions for v1.1

### Core Technologies (New — v1.1)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| lenis | ^1.3.18 | Smooth scroll engine | ~3KB gzip, zero npm dependencies, normalizes scroll input across pointer/touch/trackpad uniformly. Pairs with Motion's `useScroll` — lenis feeds virtual scroll position that Motion reads. De-facto standard at creative agencies. Renamed from @studio-freight/lenis (old package deprecated, do not use). |

**That is the complete list of new npm dependencies.** Every other v1.1 feature — particles, grain, parallax, page transitions, scroll reveals, hover micro-interactions — is built with existing stack capabilities or browser APIs. See sections below for how.

---

## Capability Map — What Existing Stack Already Handles

Motion 12.36.0 is already installed. It covers all animation and interaction requirements for v1.1 without adding a second animation system.

| v1.1 Feature | Built With | Notes |
|---|---|---|
| Scroll-triggered gallery reveals | `whileInView` prop (Motion) | Intersection Observer under the hood — hardware-accelerated, lazy-init |
| Scroll-linked parallax | `useScroll` + `useTransform` (Motion) | Runs on native `ScrollTimeline` where available (GPU path); no janky JS polling |
| Parallax on hover | `useMotionValue` + `useTransform` + `onMouseMove` (Motion) | Standard pattern, zero additional deps |
| Page transitions | `AnimatePresence` in `template.tsx` + `usePathname` key (Motion) | `template.tsx` remounts on every route, enabling proper exit animations |
| Spring micro-interactions | `whileHover`, `whileTap`, `transition: { type: "spring" }` (Motion) | Already in bundle |
| Shared element transitions | `layout` prop + `layoutId` (Motion) | Cinematic gallery → lightbox handoff |
| Stagger entrance sequences | `variants` + `staggerChildren` on parent `motion.div` (Motion) | No additional config |
| Enhanced intro animation | `AnimatePresence` + variants (Motion) | Builds on existing ink-bleed SVG animation |

---

## Particle Effects — Build, Don't Import

**Decision: Custom `<InkParticles>` Canvas component. No particle library.**

**Why not @tsparticles/react:** @tsparticles/react@3.0.0 was last published over 2 years ago. The full tsparticles engine is ~500KB+ parsed; even the slim bundle is 150KB+ parsed. A custom Canvas implementation that renders ink-drip particle physics for one specific use case is ~50 lines of code, 0KB bundle cost, and gives exact control over the aesthetic.

**Why not react-smoke:** Built on @react-three/fiber + Three.js as peer dependencies. Three.js alone is 658KB parsed / 155KB gzip. Catastrophic for a Vercel free-tier mobile-first portfolio where the primary user arrives via QR code on a phone.

**Custom Canvas approach:**
- Uses browser Canvas 2D API — no import, zero bundle cost
- Full control over ink particle physics: gravity, spread, opacity fade, drip trails
- Kill-switch: `prefers-reduced-motion` check + skip on `connection.saveData`
- Must be `'use client'` component, rendered in `useEffect` to avoid SSR
- `position: fixed; pointer-events: none; z-index: 0` — non-blocking overlay

---

## Film Grain — CSS, Not JavaScript

**Decision: CSS pseudo-element with animated inline SVG feTurbulence. No library.**

**Why not grained.js:** jQuery-era, last updated 6+ years ago, no TypeScript, generates PNG noise on the fly which is wasteful.

**Why not react-postprocessing:** Requires Three.js WebGL canvas — same catastrophic bundle problem as react-smoke.

**CSS approach:**
```css
/* body::after in globals.css — zero JS overhead */
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
  20% { transform: translate(-2%, -3%); }
  40% { transform: translate(2%, 2%); }
  60% { transform: translate(-1%, 3%); }
  80% { transform: translate(3%, -1%); }
}
```
Runs at ~5fps via `steps(1)` timing — imperceptible as individual frames, reads as organic texture. Industry-standard technique used by high-end portfolio sites. Zero JavaScript.

---

## SVG feTurbulence — Fog/Atmosphere Textures

**Decision: Inline SVG filter in JSX components, no library.**

SVG `<feTurbulence type="fractalNoise">` + `<feDisplacementMap>` creates fog, ink-bleed, and atmospheric distortion effects. The SVG `<animate>` element animates `baseFrequency` without JavaScript — browser composites off-thread.

Use for: hero section fog atmosphere, ink-bleed transitions between sections, vignette deepening on scroll.

---

## Page Transitions — template.tsx Pattern

**Use `app/template.tsx`, not `app/layout.tsx`.**

This is required for exit animations in Next.js 15 App Router. `layout.tsx` persists between routes — `AnimatePresence` never sees the unmount. `template.tsx` remounts on every navigation, which gives `AnimatePresence` the lifecycle event it needs.

```
app/
  template.tsx    ← "use client", AnimatePresence wrapper, key={pathname}
  layout.tsx      ← server component, no change
```

Confirmed issue: [vercel/next.js #49279](https://github.com/vercel/next.js/issues/49279) documents App Router friction with AnimatePresence shared layout animations. The `template.tsx` workaround is the community-validated fix as of early 2026.

---

## Lenis Integration Pattern

```
app/
  providers/
    SmoothScrollProvider.tsx   ← "use client"; ReactLenis wrapper
  layout.tsx                   ← imports SmoothScrollProvider, wraps children
```

Key options:
- `syncTouch: false` — avoids fighting native iOS momentum scroll on mobile
- `autoRaf: true` — lenis manages its own requestAnimationFrame loop
- Use `lenis/react` sub-path export: `import { ReactLenis } from 'lenis/react'`

Motion's `useScroll` integrates automatically — it reads lenis's virtual scroll position when lenis is active.

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @tsparticles/react | ~500KB+ parsed, last published 2+ years ago, no active maintenance | Custom `<InkParticles>` Canvas component |
| react-smoke | Requires Three.js peer dep: 658KB parsed / 155KB gzip | CSS `feTurbulence` SVG filter for fog; custom Canvas for particles |
| GSAP / @gsap/react | ~147KB parsed; Motion 12 already covers useScroll, whileInView, springs, timelines. Two animation systems = confusion and bundle bloat | motion (already installed v12.36.0) |
| react-spring | Separate physics system; Motion 12 covers all spring animations | motion (already installed) |
| react-transition-group | Superseded by AnimatePresence | AnimatePresence from motion |
| next-transition-router | Extra abstraction; template.tsx + AnimatePresence is sufficient | template.tsx pattern (no new dep) |
| grained.js | 6-year-old unmaintained jQuery-era library, no TypeScript | CSS feTurbulence pseudo-element |
| Three.js / @react-three/fiber (standalone) | 658KB parsed on a mobile-first QR portfolio is indefensible; no 3D use cases | CSS + Canvas 2D + SVG filters |
| particles.js | Abandoned, superseded by tsparticles then by custom solutions | Custom Canvas component |

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Custom Canvas `<InkParticles>` | @tsparticles/slim | Only if you need 20+ particle preset types and the project is desktop-only; not this project |
| CSS feTurbulence grain | react-postprocessing grain shader | Only if the site already uses Three.js (amortizes the bundle cost); not this project |
| lenis + Motion | GSAP + ScrollTrigger | If scroll animations require advanced pinning, scrub-to-scroll sequences, or clip-path reveals GSAP handles more naturally; overkill here |
| template.tsx pattern | next-view-transitions (View Transitions API) | View Transitions API is CSS-native and smaller, but browser support is still partial (no Firefox as of 2026); use once support broadens |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| lenis ^1.3.18 | Next.js 15.3.9, React 19.2.4, Motion 12.36.0 | Requires `'use client'` wrapper; `lenis/react` sub-path export confirmed. syncTouch option prevents iOS scroll conflicts. |
| motion ^12.36.0 (existing) | React 19, Next.js 15 App Router | `useScroll`, `whileInView`, `AnimatePresence` all confirmed for App Router. Exit animations require template.tsx, not layout.tsx. |
| CSS feTurbulence | Chrome 35+, Firefox 4+, Safari 9.1+ | Universal browser support; no compatibility concerns |
| Canvas 2D API | All modern browsers | Must guard with `typeof window !== 'undefined'` in Next.js SSR context; use `useEffect` for canvas init |

---

## Installation

```bash
# The only new npm dependency for v1.1
npm install lenis

# Everything else uses existing deps + browser APIs
```

---

## Bundle Impact Assessment (Vercel Free Tier)

Vercel Hobby plan: no hard JS bundle limit, but startup time correlates with function size. Frontend bundle size directly impacts mobile Time-to-Interactive for QR-code arrivals.

| Addition | Bundle Cost (gzip) | Mobile Impact |
|----------|-------------------|---------------|
| lenis | ~3KB | Negligible |
| Custom Canvas particles | ~0KB (browser API) | Low — disable via `prefers-reduced-motion` |
| CSS film grain | ~0KB (CSS + inline SVG string) | None |
| SVG feTurbulence fog | ~0KB (inline JSX) | None |
| Motion scroll APIs (already installed) | Already in bundle | Already paid |
| **Total new cost** | **~3KB gzip** | **Negligible** |

**Comparison with rejected alternatives:**
| Rejected Option | Bundle Cost | Why It Matters |
|-----------------|-------------|----------------|
| @tsparticles/react + engine | ~150–500KB parsed | Primary user is on mobile via QR code |
| react-smoke + Three.js | ~655KB+ parsed | Unacceptable for Vercel free tier mobile-first portfolio |
| GSAP + ScrollTrigger | ~147KB parsed | Duplicates Motion already in bundle |

---

## Sources

- [motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations) — useScroll, useTransform, parallax APIs (HIGH confidence, official docs)
- [motion.dev/docs/react-use-in-view](https://motion.dev/docs/react-use-in-view) — useInView hook, 0.6KB (HIGH confidence, official docs)
- [motion.dev/docs/gsap-vs-motion](https://motion.dev/docs/gsap-vs-motion) — bundle comparison, GSAP ~23KB gzip vs Motion modular (HIGH confidence, official Motion comparison)
- [github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) — v1.3.18, minzipped <10KB, React sub-path confirmed (HIGH confidence, official repo)
- [lenis.darkroom.engineering](https://lenis.darkroom.engineering) — active maintenance confirmed 2026 (HIGH confidence)
- WebSearch: @tsparticles/react v3.0.0 "last published 2 years ago" — MEDIUM confidence (npm page corroborated)
- WebSearch: react-smoke built on @react-three/fiber; Three.js 658KB parsed / 155KB gzip — MEDIUM confidence (multiple sources agree)
- [vercel/next.js #49279](https://github.com/vercel/next.js/issues/49279) — AnimatePresence + App Router exit animation issue (MEDIUM confidence, GitHub issue)
- WebSearch: template.tsx pattern for AnimatePresence in Next.js 15 — MEDIUM confidence (community-validated, multiple tutorial sources 2025)
- [MDN: SVG feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence) — browser support, noise types (HIGH confidence, official spec)
- [CSS-Tricks: Animated Grainy Texture](https://css-tricks.com/snippets/css/animated-grainy-texture/) — grain CSS technique confirmed (MEDIUM confidence)
- [vercel.com/docs/functions/limitations](https://vercel.com/docs/functions/limitations) — Vercel function 250MB uncompressed limit (HIGH confidence, official docs)

---

*Stack research for: Anna Portfolio v1.1 Dark & Dangerous visual/UX overhaul*
*Researched: 2026-03-14*
