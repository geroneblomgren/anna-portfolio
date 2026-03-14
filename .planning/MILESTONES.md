# Milestones

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

