# Feature Research

**Domain:** Dark & Dangerous Visual/UX Overhaul — Tattoo Artist Portfolio (v1.1)
**Researched:** 2026-03-14
**Confidence:** MEDIUM-HIGH (visual/UX patterns well-established in award-winning portfolios; tattoo-industry specifics inferred from practitioner guidance + portfolio-design community)

---

## Context

This milestone is a transformation, not a feature addition. v1.0 delivered all functional requirements. v1.1 is purely a visual and UX overhaul. Every feature below is a visual/interaction enhancement applied to existing components — no new pages, no new data models, no new admin flows.

**Existing hooks to build on:**
- `IntroAnimation.tsx` — Framer Motion (`motion/react`) already imported; 4 animated SVG paths + fade text reveal
- `GalleryGrid.tsx` — masonry grid with `group` hover overlay; no scroll or motion behavior yet
- `GalleryLightbox.tsx` — YARL; currently default styled
- `NavBar.tsx` — fixed top, backdrop-blur-sm, mobile overlay; purely CSS/state today
- `globals.css` — Tailwind v4 `@theme`; cold graphite tokens defined (`#0a0a0a` bg, `#e0e0e0` accent)
- `motion/react` — already a project dependency (imported in IntroAnimation.tsx)

---

## Feature Landscape

### Table Stakes (Viewers Expect These on a Dark Artist Site)

Features a dark, high-craft portfolio must have or it reads as "someone applied a dark theme" rather than "someone built a dark experience." Tattoo masters and art-curious viewers who click from an Instagram QR code have calibrated eyes. Missing these makes the site feel half-finished.

| Feature | Why Expected | Complexity | Existing Hook | Notes |
|---------|--------------|------------|---------------|-------|
| Film grain / noise overlay | Every premium dark site uses it; smooths harsh OLED blacks, adds analog depth; viewers feel its absence as "too digital" | LOW | `globals.css` pseudo-element | CSS-only: `::before` on `<body>` with SVG `feTurbulence` filter, `fixed`, `pointer-events-none`, `mix-blend-mode: overlay`, opacity ~0.04–0.06. Zero JS. |
| Vignette overlay | Darkens screen edges, focuses eye on artwork center; standard in photography/film dark UIs; absence makes the page feel like an app not a gallery | LOW | `globals.css` or layout wrapper | Radial gradient from transparent center to `rgba(0,0,0,0.45)` at edges, `fixed`, `pointer-events-none`. One CSS rule. |
| Scroll-reveal on gallery items | Users expect cards to "arrive" — flat render of 30 images simultaneously reads as a directory, not a curated gallery | MEDIUM | `GalleryGrid.tsx` — wrap each card in `motion.div` | `whileInView={{ opacity:1, y:0 }}` with staggered delay per column index. Use `viewport={{ once:true, amount:0.15 }}`. Framer Motion already in project. |
| Hover depth on gallery cards | Static cards feel inert; cursor should feel like it has gravity over artwork; current hover is plain opacity change | MEDIUM | `GalleryGrid.tsx` — existing `group` class | Replace plain opacity overlay with compound scale + shadow + gradient. Foundation for 3D tilt if that ships later. |
| Enhanced intro animation | Current intro (4 thin SVG strokes + fade text) is competent but safe — thin lines are not ink; name fades in as a block rather than arriving | HIGH | `IntroAnimation.tsx` — rewrite SVG paths and timing | Thicker strokes (5–12px), SVG turbulence filter for bleed texture, splatter scatter marks, letter-by-letter stagger on name reveal. Still pure Framer Motion + SVG. |
| Typography with attitude | Bodoni Moda is chosen — table stakes is using it aggressively (large tracking, uppercase, weight contrast) not cautiously; currently nav and headers are timid | LOW | `NavBar.tsx`, page headers | Add `letter-spacing`, strategic `italic`, size contrast between heading and body labels. Zero new dependencies. |

### Differentiators (What Makes It Stop-You-in-Your-Tracks)

These are the effects tattoo masters and design-aware people will actually remember. None are required by convention — they are what separates "polished dark portfolio" from "experience."

| Feature | Value Proposition | Complexity | Existing Hook | Notes |
|---------|-------------------|------------|---------------|-------|
| Ink-bleed SVG page transition | Navigation between pages feels like ink bleeding across the screen — brand-coherent and cinematic; rare enough that people screenshot it | HIGH | `(frontend)/layout.tsx` — requires converting to `template.tsx` | Use Next.js `template.tsx` (not `layout.tsx`) so it remounts per route. Framer `AnimatePresence` exit animation: SVG flood fill with morphing blob paths. Key challenge: App Router + AnimatePresence requires `template.tsx` — this is a known footgun. |
| Magnetic / inertial cursor dot | Cursor gains a trailing ink-dot that lags behind with elastic physics — communicates craft and control; signature of high-end creative studios | HIGH | None — new `<CursorDot>` component in frontend layout | `motion.div` with `useSpring` for smooth lag. Must be `pointer-events-none`, desktop-only (gate with `@media (hover: hover) and (pointer: fine)`), and `prefers-reduced-motion` safe. |
| Gallery card 3D tilt parallax | Each artwork card tilts on its Z-axis toward cursor, inner image shifts in opposite direction — simulates holding physical art; deeply satisfying on desktop | HIGH | `GalleryGrid.tsx` — replace plain hover with mouse-tracked CSS perspective transforms | CSS `perspective: 800px` on container, `rotateX`/`rotateY` driven by mouse offset from card center. Shine radial-gradient overlay tracks cursor. Pure CSS + small vanilla event listener. No new library needed. |
| Ink-bleed / turbulence filter on intro SVG paths | Intro strokes gain ink weight and bleed edges — not clean beziers but actual mark-making feel; transforms the intro from "animation" to "drawing" | MEDIUM | `IntroAnimation.tsx` — add `<filter>` defs to SVG | Define `<filter id="ink">` with `feTurbulence baseFrequency="0.04"` + `feDisplacementMap scale="8"`. Apply to path group. Stays in SVG. GPU-composited. |
| Lightbox atmospheric backdrop | When a piece opens in YARL, the backdrop isn't flat black — it has subtle animated grain + vignette making the image feel lit from a darkroom | MEDIUM | `GalleryLightbox.tsx` — YARL custom styles | YARL exposes a `styles` prop and CSS variables. Override backdrop opacity and layer grain pseudo-element over `.yarl__root`. Inherits body grain if grain is on `body::before`. |
| About/Contact page stagger reveals | Bio text and contact elements entrance from slight vertical offset — communicates precision and intent; currently pages render instantaneously | MEDIUM | `about/page.tsx`, `contact/page.tsx` — wrap elements in motion components | Framer Motion `variants` with stagger on a container. Line-level animation (not character-level) — enough drama, cheaper computation. |
| Ink-stain decorative dividers | SVG blob shapes (asymmetric ink-stain silhouettes) between sections, slowly morphing between states — adds brand texture without competing with artwork | MEDIUM | Page layout — decorative `<svg>` inserts | Animate SVG `d` attribute between 3–4 stored path variants using Framer `animate`. 8–12s loop, subtle and slow. Paths must have identical node count for morphing. |

### Anti-Features (Avoid These)

| Feature | Why Requested | Why Problematic | Better Approach |
|---------|---------------|-----------------|-----------------|
| WebGL / Three.js particle system | "Ink particles floating across screen" sounds impressive | 300–500KB bundle on Vercel free tier; kills mobile performance; competes visually with the actual artwork | CSS `feTurbulence` SVG filters + Framer spring physics — same mood, zero extra KB |
| Autoplay ambient sound / music | Immersive sites use sound design | Jarring on a QR-scanned phone in a tattoo shop; immediately divisive; no mute = instant back-button | No audio. Visual design carries atmosphere entirely. |
| Cursor sparkle / glitter trails | Adds playfulness and movement | Wrong brand register — Anna's work is dark and precise, not whimsical; sparkles read as a portfolio template | Single ink-dot cursor with inertial lag instead |
| Full scroll-jacking (CSS snap sections) | Creates dramatic cinematic feel | Breaks accessibility, destroys mobile UX, conflicts with masonry gallery's natural scroll flow | Scroll-triggered reveals (`whileInView`) not scroll-jacking |
| Canvas confetti / ink splatter on click | Click interactions feel reactive | Draws attention away from artwork | Subtle `scale` press + ripple on click is sufficient |
| Loading spinner / progress bar | Signals assets are heavy | Contradicts the image optimization already built (WebP + blur placeholders are instant); adds waiting psychology | Trust the blur placeholder + fade-in already in Next.js Image |
| Dark-mode toggle | Users might prefer light | The dark graphite palette IS the brand; a toggle communicates lack of design conviction | Respect `prefers-color-scheme` at system level but never expose a toggle in UI |
| Parallax background-attachment: fixed | Makes bg image scroll at different speed | Causes serious jank on iOS Safari — long-standing known bug; mobile-first site cannot accept this | Use `transform: translateY` driven by Framer `useScroll` — desktop only, skipped on mobile |
| Heavy type animations (character-by-character on every heading) | Looks like award-winning sites | Causes cumulative layout shift; reads as slow on mobile; becomes annoying on return visits | Reserve letter-stagger for the intro only; body text uses line-level reveals |

---

## Feature Dependencies

```
[Film grain overlay]
    └── no dependencies — pure CSS, ships first
    └── implicitly enhances: [Lightbox atmospheric backdrop] (inherits body grain)

[Vignette overlay]
    └── no dependencies — pure CSS, ships first

[Typography tightening]
    └── no dependencies — CSS/className changes only

[Scroll-reveal on gallery cards]
    └── requires: motion/react (confirmed present)
    └── is prerequisite for: [Gallery card 3D tilt parallax]

[Gallery card hover depth (compound)]
    └── conflicts-with: [Gallery card 3D tilt parallax] — tilt subsumes lift; ship one not both
    └── ship this as P1 fallback; replace with tilt if tilt ships

[Enhanced intro animation]
    └── requires: existing motion/react in IntroAnimation.tsx
    └── is prerequisite for: [Ink-bleed / turbulence filter on intro SVG paths]

[Ink-bleed / turbulence filter on intro SVG paths]
    └── requires: enhanced intro (same file, same SVG canvas, same animation timing)

[Ink-bleed SVG page transition]
    └── requires: converting (frontend)/layout.tsx to template.tsx pattern
    └── requires: AnimatePresence wrapping route content
    └── warning: Next.js App Router + AnimatePresence has known lifecycle challenges; build last

[Magnetic cursor dot]
    └── requires: desktop detection — @media (hover: hover) and (pointer: fine)
    └── requires: prefers-reduced-motion check
    └── enhances: [Gallery card 3D tilt parallax] — cursor dot + card tilt compound the depth illusion

[Gallery card 3D tilt parallax]
    └── requires: [Scroll-reveal on gallery cards] complete first
    └── conflicts-with: [Gallery card hover depth (compound)] — choose tilt OR compound hover, not both

[Lightbox atmospheric backdrop]
    └── requires: YARL styles prop / CSS variable override API
    └── enhances: implicitly from [Film grain overlay] if grain is on body

[About/Contact page stagger reveals]
    └── requires: motion/react (confirmed present)
    └── no conflicts

[Ink-stain section dividers]
    └── requires: SVG path morphing (Framer Motion d attribute animation)
    └── note: source and target paths must have identical node count
```

### Dependency Notes

- **Film grain + vignette first.** These are CSS-only and foundational — they transform the baseline feel of every page immediately. Every subsequent effect layers on a better canvas.
- **Scroll-reveal before tilt.** Tilt physics only make sense once cards are visible in DOM; building reveal first also validates the Framer integration pattern before adding complexity.
- **Compound hover is the fallback for tilt.** If 3D tilt ships, remove the simpler compound hover. If tilt is deferred, keep compound hover. Do not ship both simultaneously.
- **template.tsx is a structural change.** Page transitions require the frontend layout to switch from `layout.tsx` (persistent, does not remount) to `template.tsx` (remounts per navigation). This is a deliberate architectural change — build it deliberately after simpler animations are stable, as it can break other layout behavior if done wrong.
- **Cursor dot is desktop-only.** No cursor exists on mobile/touch. Must be entirely absent from the DOM on touch devices, not merely invisible.

---

## MVP Definition (v1.1 Dark & Dangerous)

### Phase 1 — Atmospheric Foundation (Ship First)

Highest impact-to-effort ratio. These CSS effects transform the baseline feel of the entire site. Build order: grain → vignette → typography → done with phase.

- [ ] Film grain overlay — CSS only, site-wide, always visible. Turns flat OLED black into textured graphite.
- [ ] Vignette overlay — CSS only, site-wide. Pulls focus to center, frames artwork naturally.
- [ ] Typography tightening — Letter-spacing, size contrast, strategic italic in nav + page headers.

### Phase 2 — Gallery Comes Alive (Ship Second)

The gallery IS the product. These effects make the artwork feel earned.

- [ ] Scroll-reveal stagger on gallery cards — Framer `whileInView`, staggered delay per card index.
- [ ] Gallery card hover depth (compound scale + shadow + gradient) — Replaces plain opacity overlay.
- [ ] Enhanced intro animation — Thicker SVG strokes, letter-stagger on name, extended drama arc.
- [ ] Ink-bleed turbulence filter on intro SVG paths — SVG `<filter>` defs in IntroAnimation.tsx.

### Phase 3 — Signature Effects (Ship Third)

These are the differentiators. Build after phases 1–2 are visually validated on a real device.

- [ ] Gallery card 3D tilt parallax (replaces compound hover) — Mouse-tracked perspective transform.
- [ ] Lightbox atmospheric backdrop — YARL styles override.
- [ ] About + Contact page entrance stagger — Framer variants on text blocks.

### Phase 4 — Cinematic Layer (Ship Last)

High complexity, high reward. Build last so simpler effects can be QA'd before investing here.

- [ ] Ink-bleed SVG page transition — template.tsx pattern, AnimatePresence, SVG flood morph.
- [ ] Magnetic inertial cursor dot — useSpring, desktop-only, reduced-motion-safe.
- [ ] Ink-stain decorative section dividers — SVG path morphing, purely decorative.

### Defer to v1.2+ (Only If Needed)

- [ ] WebGL/Three.js particles — Only if SVG/CSS effects feel insufficient after v1.1 ships. Unlikely.
- [ ] Sound design — Only if Anna specifically requests. Low probability of adding value.

---

## Feature Prioritization Matrix

| Feature | Viewer Impact | Implementation Cost | Priority |
|---------|--------------|---------------------|----------|
| Film grain overlay | HIGH | LOW | P1 |
| Vignette overlay | HIGH | LOW | P1 |
| Typography tightening | HIGH | LOW | P1 |
| Scroll-reveal on gallery cards | HIGH | MEDIUM | P1 |
| Gallery card hover depth (compound) | MEDIUM | LOW | P1 |
| Enhanced intro animation | HIGH | HIGH | P1 |
| Ink-bleed turbulence filter on intro SVG | MEDIUM | MEDIUM | P1 |
| Gallery card 3D tilt parallax | HIGH | HIGH | P2 |
| Lightbox atmospheric backdrop | MEDIUM | MEDIUM | P2 |
| About/Contact stagger reveals | MEDIUM | LOW | P2 |
| Ink-bleed SVG page transition | HIGH | HIGH | P2 |
| Magnetic cursor dot | MEDIUM | HIGH | P3 |
| Ink-stain section dividers | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must ship — transformation reads as incomplete without it
- P2: Should ship in v1.1; add when P1 stable
- P3: Nice to have; can slip to v1.2 without loss

---

## Tattoo Industry Context

Research from practitioner guidance and portfolio-design community (MEDIUM confidence) reveals a tension worth resolving explicitly:

**What masters say they want:** Clean, professional, focused. Work quality over presentation flash. Easy to scroll on mobile.

**What the site must actually do:** When a master scans a QR code at an event, they see dozens of portfolios. "Clean and professional" is the baseline — everyone has it. The visual experience must communicate that Anna has a point of view and craft precision that extends beyond the artwork itself. A dead gallery grid is instantly forgettable. A site that opens with an ink-bleed intro and a gallery that feels like walking into a dark studio is memorable.

**The resolution:** Effects must serve the work, not compete with it. Film grain, vignette, scroll-reveals — these frame the artwork. They make each piece feel deliberate and curated. 3D card tilt makes handling the portfolio feel like holding physical drawings. None of these draw the eye away from the art; they contextualize it.

**What to avoid from the industry guidance:** Messy navigation, autoplay audio, heavy loading, anything that obscures the work or slows the scroll. The tattoo master is time-constrained and unimpressed by technical novelty for its own sake.

---

## Competitor Feature Analysis

| Feature | Generic Squarespace Dark Template | Awwwards Creative Portfolio | Our Approach |
|---------|----------------------------------|----------------------------|--------------|
| Background | Flat #000 or dark image | Animated gradient or textured dark | CSS grain + vignette on graphite base |
| Gallery interaction | Static grid, hover caption | Scroll-triggered reveals, magnetic hover | Scroll-reveal stagger + 3D tilt |
| Page transition | Instant / browser default | Custom WebGL or CSS clip-path | SVG ink flood (brand-coherent, no WebGL) |
| Intro | Fade-in logo | Custom WebGL scene or text morph | Enhanced ink-stroke SVG (already built, push further) |
| Cursor | Browser default | Custom trailing dot or morph | Inertial ink dot, desktop only |
| Typography | Template default sizing | Aggressive type hierarchy | Bodoni Moda pushed harder — size, tracking, italic weight |

---

## Sources

- Motion for React official docs — [whileInView / useScroll](https://motion.dev/docs/react-scroll-animations) — HIGH confidence
- Awwwards dark portfolio patterns — [awwwards.com portfolio winners](https://www.awwwards.com/websites/winner_category_portfolio/) — MEDIUM confidence (examples, not prescriptive)
- CSS film grain implementation — [Grainy Gradients, CSS-Tricks](https://css-tricks.com/grainy-gradients/) + [Frontend Masters Blog](https://frontendmasters.com/blog/grainy-gradients/) — HIGH confidence
- SVG feTurbulence ink bleed — [Andy Jakubowski tutorial](https://andyjakubowski.com/tutorial/ink-bleed-effect-with-svg-filters) — HIGH confidence
- Next.js App Router + Framer Motion page transitions — [imcorfitz.com](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) — MEDIUM confidence (known complexity, needs testing in our layout)
- Tattoo apprenticeship portfolio guidance — [Certified Tattoo Studios](https://certifiedtattoo.com/blog/how-to-put-together-a-portfolio-for-tattoo-apprenticeships), [Creative Ink Tattoo](https://creativeinktattoo.com/2025/03/12/how-to-build-your-apprenticeship-portfolio/) — MEDIUM confidence
- 3D parallax hover cards — [CSS Script card3d](https://www.cssscript.com/parallax-tilt-hover-effect-card/), [CodePen parallax gallery](https://codepen.io/cs13/pen/jOyPGNw) — MEDIUM confidence
- Gooey/drip SVG performance warning — [SVG Animation Encyclopedia 2025, SVG AI](https://www.svgai.org/blog/research/svg-animation-encyclopedia-complete-guide) — MEDIUM confidence
- CSS noise generator + pointer-events pattern — [emile.sh](https://emile.sh/blog/how-to-add-noise-to-element-css), [Frontend Hero noise tool](https://frontend-hero.com/css-noise-generator) — HIGH confidence
- Animated film grain CodePen — [CodePen ooblek animated grain](https://codepen.io/ooblek/pen/vYxYomx) — MEDIUM confidence

---

*Feature research for: Dark & Dangerous Visual/UX Overhaul — Anna Blomgren Artist Portfolio*
*Researched: 2026-03-14*
