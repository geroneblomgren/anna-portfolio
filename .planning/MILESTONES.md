# Milestones

## v1.1 Dark & Dangerous (Shipped: 2026-03-15)

**Phases completed:** 4 phases, 8 plans, 16 tasks
**Timeline:** 2 days (2026-03-14 → 2026-03-15)
**Codebase:** 3,002 LOC TypeScript/TSX/CSS, 28 milestone commits
**Requirements:** 22/22 satisfied

**Delivered:** A complete visual/UX transformation — film grain, vignette, 3D tilt gallery, ink-bleed page transitions, ambient particles, and precision stagger animations turn the portfolio from polished-but-safe to dark, dangerous, and immersive.

**Key accomplishments:**
1. Film grain noise + vignette overlays transform every page from flat black to textured graphite depth
2. Gallery cards with scroll-reveal stagger, compound hover, and 3D cursor-tracking tilt parallax
3. Ink stroke intro animation with SVG displacement filter and letter-by-letter name reveal
4. Darkroom lightbox atmosphere with grain + vignette pseudo-elements on YARL backdrop
5. Page entrance stagger on About/Contact with morphing ink-stain SVG blob dividers
6. Ink-bleed SVG page transitions on every route change (entrance-only, App Router safe)
7. Ambient CSS particle drift across all pages — zero client JS via server component
8. Full reduced-motion coverage: 9 animation systems with CSS/MotionConfig/useReducedMotion guards

**Known tech debt:**
- IntroAnimation exit={{ opacity: 0 }} is dead code (no AnimatePresence wrapper)
- --tracking-brand-tight CSS token defined but unused
- SUMMARY frontmatter missing requirements_completed in phases 5-7

---

## v1.0 MVP (Shipped: 2026-03-14)

**Phases completed:** 3 phases, 9 plans
**Timeline:** 2 days (2026-03-13 → 2026-03-14)
**Codebase:** 2,458 LOC TypeScript/TSX/CSS, 76 files, 46 commits

**Delivered:** A complete artist portfolio with CMS-powered admin, automated image pipeline, and a cinematic public experience — from QR scan to ink-bleed intro to filterable gallery.

**Key accomplishments:**
1. Next.js 15 + Payload CMS 3.x + Turso SQLite deployed to Vercel free tier
2. Cold graphite design system with WCAG AA contrast, Bodoni Moda + DM Sans typography
3. Admin panel with Sharp image pipeline (JPEG → WebP variants + blur placeholders), full art CRUD, drag-drop reorder
4. About/contact CMS globals, branded QR code admin view with "Dark Arts by Anna" SVG wordmark
5. Public gallery with masonry grid, tag filtering, full-resolution YARL lightbox with captions
6. Ink-bleed SVG intro animation with skip/localStorage/prefers-reduced-motion support
7. Contact form with Zod validation, React 19 useActionState, and Resend email delivery

**Known tech debt:**
- Resend sender domain upgrade needed for production delivery to non-account-owner emails
- CLS <= 0.1 unconfirmed by Lighthouse (structural code correct)
- Vercel env vars (BLOB_READ_WRITE_TOKEN, RESEND_API_KEY, ANNA_EMAIL) must be confirmed set

---

