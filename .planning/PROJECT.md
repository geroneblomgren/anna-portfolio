# Anna Blomgren — Artist Portfolio

## What This Is

A self-managed artist portfolio web app for Anna Blomgren, a mixed-media artist seeking a tattoo apprenticeship. Features a cinematic ink-bleed intro, CMS-powered gallery with tag filtering and full-resolution lightbox, about page, contact form, and a branded QR code for in-person networking. Built with Next.js 15 + Payload CMS 3 + Turso SQLite, deployed on Vercel.

## Core Value

When someone scans Anna's QR code, the site must make an immediate, powerful visual impression that communicates: she's versatile, she has a personal voice, and she's dead serious about this career.

## Requirements

### Validated

- ✓ Dark, moody animated intro that transitions into the gallery — v1.0
- ✓ Gallery showcasing mixed/eclectic artwork with masonry layout — v1.0
- ✓ Each piece displays: title, medium/style, description, and category/tags — v1.0
- ✓ Category/tag filtering so viewers can browse by type — v1.0
- ✓ About section with bio, photo, and her story pursuing tattooing — v1.0
- ✓ Contact form that sends email notifications — v1.0
- ✓ Social media links (Instagram, etc.) — v1.0
- ✓ Password-protected admin panel for Anna to manage content — v1.0
- ✓ Admin: add, edit, delete art pieces (image + metadata) — v1.0
- ✓ Admin: edit bio/about section copy and photo — v1.0
- ✓ Admin: manage contact info and social links — v1.0
- ✓ QR code generation that links directly to the site — v1.0
- ✓ Mobile-first responsive design (QR codes → phones) — v1.0
- ✓ Fast image loading with optimized WebP + blur placeholders — v1.0

### Active

(None — next milestone requirements defined via `/gsd:new-milestone`)

### Out of Scope

- E-commerce / selling art — this is a portfolio, not a shop
- User accounts / registration — only Anna has admin access
- Blog / news section — focus is purely on the work
- Booking system — contact form is sufficient for initial outreach
- Video gallery — high bandwidth cost; keep video on Instagram/TikTok
- Multi-language support — targeting local shops, English only
- PWA / offline mode — no use case for offline portfolio viewing

## Context

Shipped v1.0 with 2,458 LOC TypeScript/TSX/CSS.
Tech stack: Next.js 15.3.9, Payload CMS 3.79.0, Turso SQLite, Tailwind v4, Vercel Blob, Resend.
Cold graphite design system (#0a0a0a bg, #e0e0e0 accent) — user-approved aesthetic.
Deployed to Vercel free tier at anna-portfolio-blush.vercel.app.

## Constraints

- **Hosting**: Vercel free tier (zero monthly cost)
- **Admin simplicity**: Anna is the only user — Payload CMS handles CRUD
- **Performance**: Images processed at upload (Sharp → WebP + blur) — no runtime optimization cost
- **Mobile-first**: QR code → phone is the primary entry path

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark/moody animated intro | Matches tattoo industry aesthetic, creates memorable first impression | ✓ Good — ink-bleed SVG animation with skip/localStorage/reduced-motion |
| Cold graphite palette (not warm browns) | User aesthetic preference — graphite & ink feel | ✓ Good — approved by Anna, consistent across all components |
| Single admin user (no user accounts) | Simplicity — only Anna needs access | ✓ Good — Payload built-in auth sufficient |
| Contact form + social links | Professional outreach + casual social connection | ✓ Good — Resend email + Instagram on About & Contact pages |
| Rich piece metadata (title, medium, description, tags) | Shows professionalism and lets viewers filter by interest | ✓ Good — tag filtering works client-side without reload |
| Next.js 15 + Payload CMS 3 + Turso | Free hosting, embedded CMS, edge-ready SQLite | ✓ Good — entire stack runs on Vercel free tier |
| Sharp image pipeline at ingest | No runtime image optimization cost; guaranteed WebP + blur | ✓ Good — 3 variants (gallery/lightbox/thumb) + 10x10 blur placeholder |
| Vercel Blob for image storage | CDN-backed, integrates with Payload storage adapter | ✓ Good — conditional plugin allows local dev without token |
| react-masonry-css for gallery | Simple masonry without CSS columns complexity | ✓ Good — 3/3/2/1 column breakpoints work responsively |
| YARL for lightbox | Full-featured with captions, keyboard nav, swipe | ✓ Good — custom next/image render for blur placeholders |

---
*Last updated: 2026-03-14 after v1.0 milestone*
