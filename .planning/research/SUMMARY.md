# Project Research Summary

**Project:** Anna Blomgren Tattoo Artist Portfolio
**Domain:** Mobile-first artist portfolio web app with admin CMS, image gallery, QR code delivery
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

Anna's portfolio is a purpose-built apprenticeship credential — not a generic artist website. The primary audience is tattoo shop owners evaluating her work after scanning a QR code on mobile. This context drives every architectural and feature decision: the site must load fast on cellular, present images at professional quality, and make a memorable first impression. The recommended approach is a Next.js 16 app (with Payload CMS embedded inside it) deployed to Vercel's free Hobby tier, using Turso (SQLite) for content storage and Vercel Blob for image storage. This is the tightest path from zero to a self-managed portfolio with no monthly service fees and no separate backend to operate.

The single biggest technical risk is image performance. Raw camera uploads served through Vercel's built-in optimizer will exhaust the free tier's 1,000-image optimization quota almost immediately for an image-heavy gallery, and unprocessed images will destroy mobile load times. Image processing must be designed in at the start — at upload time, not at delivery time — using Sharp to convert and compress before storage. A secondary risk is the animated intro: it is a genuine differentiator but will become a liability if it requires heavy JavaScript to hydrate before any visual appears on cellular connections. Animate only `transform` and `opacity`, keep it under 2.5 seconds total, and include a skip mechanism from day one.

The dark/moody aesthetic is industry-appropriate and non-negotiable for credibility with the target audience. However, dark designs routinely fail accessibility contrast minimums in ways that are invisible on a calibrated developer monitor and catastrophic on a budget Android phone in fluorescent light. Color tokens must be established with verified contrast ratios before any UI components are built. All three of these risks (images, animation, contrast) are cheapest to prevent at the start and expensive to recover from post-launch.

---

## Key Findings

### Recommended Stack

The full stack runs inside a single Next.js 16 application deployed to Vercel. Payload CMS 3.x is embedded in the same app, eliminating a separate backend service. Turso (remote SQLite) is recommended over Vercel Postgres for database: the content model is simple (art pieces, about content, one admin user), SQLite handles it trivially, and Turso avoids connection pooling configuration. Vercel Blob stores images; `next/image` serves them. Auth.js v5 (credentials provider) handles single-user admin authentication with an HttpOnly session cookie.

**Core technologies:**
- **Next.js 16 + App Router**: Full-stack framework — Server Components for data fetching, Server Actions for mutations, no separate API layer needed
- **Payload CMS 3.x**: Embedded admin panel; generates TypeScript types from schema; manages art pieces, about content, and media — zero custom admin UI to build
- **Tailwind CSS 4.x**: Styling — v4 removes config file, 5-10x faster builds, arbitrary dark/moody values with no runtime overhead
- **Turso (SQLite)**: Content database — simpler than Postgres for a single-artist portfolio, no connection pooling, free tier is ample
- **Vercel Blob**: Image file storage — 1 GB free, integrates natively with Payload and `next/image`
- **Framer Motion 11.x**: Page transitions and gallery animations; `AnimatePresence` for the intro-to-gallery transition
- **Resend**: Contact form email delivery — free tier (3,000/month), Next.js Server Action integration in ~10 lines
- **Auth.js (next-auth) 5.x**: Admin session authentication — credentials provider, HttpOnly cookie, single-user
- **Sharp 0.33.x**: Server-side image processing at upload time — WebP conversion, resize, blur placeholder generation
- **react-qr-code 2.0.18**: SVG QR code component in admin panel for download/print

See `.planning/research/STACK.md` for full alternatives analysis and version compatibility table.

### Expected Features

The feature set is tightly scoped by the apprenticeship context. Everything a shop owner needs to evaluate Anna must ship in v1. Booking, e-commerce, blog, and multi-user features are deliberate non-goals.

**Must have (table stakes — v1):**
- Image gallery with lightbox at full resolution — the entire reason the site exists
- Gallery filtering by style/category — shop owners need to find specific work fast
- Individual piece metadata (title, medium, description, tags) — differentiates from Instagram
- Dark/moody visual aesthetic — industry credibility signal
- Mobile-first responsive layout — QR scan → phone is the primary entry path
- About section with bio and photo — establishes Anna as a person pursuing this seriously
- Contact form with email notification — required for any follow-up action
- Social media links (Instagram minimum) — evaluators will verify activity
- Fast image loading (WebP, lazy load, responsive srcset) — mandatory infrastructure

**Should have (differentiators — v1):**
- Animated intro sequence transitioning into gallery — core memorable differentiator; must be skippable
- Password-protected admin panel (Payload CMS) — Anna manages content independently post-launch
- QR code display/download in admin — the delivery mechanism for the entire product
- Curated gallery ordering (custom piece order in admin) — signals professional curation over Instagram dump

**Add after launch (v1.x):**
- Featured/hero piece designation — pin best work first; add when piece count warrants it
- Gallery sort order control — add when volume makes ordering matter
- SEO metadata per piece — add after domain is established and discoverability becomes a goal

**Defer indefinitely (v2+):**
- Analytics dashboard — hosting provider defaults are sufficient
- Instagram feed embed — technically fragile, API auth complexity, marginal value
- Print-ready PDF export — defer until Anna signals need

**Explicit anti-features (do not build):**
- Online booking — wrong framing for an apprenticeship application; significant complexity for zero value
- E-commerce / print shop — out of scope
- Blog / news section — ongoing content burden with minimal evaluation benefit
- User accounts / registration — only Anna needs admin access

See `.planning/research/FEATURES.md` for full prioritization matrix and competitor feature analysis.

### Architecture Approach

The app uses Next.js App Router's native Server/Client Component split: Server Components fetch data from the database directly, Client Components own interactive state (gallery filters, forms, animations). All mutations go through Server Actions marked `'use server'` — no dedicated API routes for CRUD operations. Payload CMS handles the admin UI, content schema, and media management out of the box, substantially reducing custom admin code.

Authentication uses a dual-layer pattern: `middleware.ts` redirects unauthenticated users away from `/admin/*`, AND every Server Action that writes data independently calls `requireAuth()`. This is mandatory — CVE-2025-29927 (March 2025) demonstrated middleware-only protection can be bypassed via header manipulation.

Image uploads go browser → Cloudinary directly (or Vercel Blob), bypassing the Next.js server entirely. This avoids the 4.5MB serverless function body limit on Vercel, which would cause large art photo uploads to fail. The server action receives only the resulting URL, not the binary file.

**Major components and build order (from ARCHITECTURE.md):**
1. **Database schema + Payload CMS setup** — everything depends on the data model
2. **Authentication (middleware + requireAuth)** — must exist before any admin feature is testable safely
3. **Image upload pipeline (Sharp processing)** — art CRUD depends on images being storable; processing must be in place before the first upload
4. **Art CRUD Server Actions** — needed before gallery displays real data
5. **Public Gallery (Server Component + Client filter)** — displayable once real data exists
6. **Animated Intro (AnimatedIntro Client Component)** — standalone, no data dependencies; can slot in any time after setup
7. **About page + Admin About Editor** — simpler than art CRUD, no image resize complexity
8. **Contact Form + Resend** — isolated feature, no dependencies on gallery or admin art
9. **QR Code display in admin** — trivial Client Component, build last

See `.planning/research/ARCHITECTURE.md` for full component diagram, data flow diagrams, and anti-pattern documentation.

### Critical Pitfalls

1. **Vercel image optimization quota exhaustion** — The free Hobby plan allows only 1,000 source image optimizations per month. A 50+ image gallery viewed across screen sizes burns through this instantly. Prevention: route all image delivery through Cloudinary (or process to WebP at upload time via Sharp), never through Vercel's built-in optimizer. Decide this before writing a single `next/image` component.

2. **Raw camera uploads stored and served** — Anna's phone uploads 12-48MP JPEGs (5-15MB each). Without processing, gallery visitors download raw files on mobile cellular. Prevention: Sharp must process every upload at ingest time — resize to ≤2400px, convert to WebP, target ≤300KB, generate a blur placeholder. Store the processed file, not the original.

3. **Cumulative Layout Shift (CLS) on QR scan** — Images without explicit dimensions cause layout to jump as they load, ruining the first impression on the primary entry path. Prevention: every `next/image` gets explicit `width`/`height` or is wrapped in a fixed `aspect-ratio` container; use `placeholder="blur"` with generated `blurDataURL` for all gallery images.

4. **Animated intro blocking mobile entry on cellular** — Heavy JavaScript animation (GSAP timelines, canvas, complex CSS keyframes) appearing as a black screen for 2-5 seconds on slow connections is the single most likely way the main differentiator becomes a liability. Prevention: animate only `transform` and `opacity`; keep total intro under 2.5 seconds; include a visible skip after 1 second; respect `prefers-reduced-motion`; test on CPU-throttled Chrome before finalizing.

5. **Dark aesthetic failing accessibility contrast** — Muted gray text on near-black backgrounds is the default failure mode for dark designs; fails WCAG minimum (4.5:1) and is worse on budget Android screens in typical lighting. Prevention: establish design tokens with verified contrast ratios before building any UI components. Use `#111111` or `#141414` base (not `#000000`); target 7:1 for body text.

6. **Admin auth relying only on middleware** — Frontend route guards and middleware-only protection leave Server Actions publicly callable via direct HTTP. Prevention: dual-layer auth — middleware for UX redirect plus `requireAuth()` at the top of every write Server Action. Hash admin password with bcrypt, never store plaintext.

See `.planning/research/PITFALLS.md` for full pitfall detail, UX anti-patterns, security checklist, and recovery cost analysis.

---

## Implications for Roadmap

Based on combined research, the natural phase structure follows the architectural build order with pitfall prevention grouped into the phases where they are cheapest to address.

### Phase 1: Foundation — Project Setup + Design System

**Rationale:** Color tokens must be verified for contrast before any component is built (Pitfall 3). The database schema and Payload CMS setup must exist before anything else compiles. This phase has no deliverable UI — it exists so every subsequent phase builds on a safe foundation.
**Delivers:** Verified design token system (dark palette with documented contrast ratios), Next.js + Payload CMS + Turso project scaffolded and deploying to Vercel, Tailwind CSS configured, TypeScript strict mode on, ESLint + Prettier + Husky configured.
**Addresses:** Dark aesthetic (FEATURES.md table stakes), design system establishment
**Avoids:** Pitfall 3 (contrast failures), technical debt from unverified color choices
**Research flag:** Standard patterns — Next.js + Payload CMS official template exists (`create-payload-app --template website`); follow official Payload + Turso guide. Skip phase research.

### Phase 2: Image Infrastructure + Admin Authentication

**Rationale:** Image processing pipeline must be in place before the first image is uploaded (Pitfalls 1, 2, 6). Admin auth must exist before admin features can be built safely. These two are co-dependencies that block everything else — build them together.
**Delivers:** Working admin login (Auth.js v5, bcrypt, HttpOnly cookie, middleware + requireAuth dual-layer), Sharp image processing pipeline (upload → WebP → ≤300KB → blur placeholder → Vercel Blob), Cloudinary or Vercel Blob integration decision finalized and implemented.
**Uses:** Auth.js 5.x, Sharp 0.33.x, Vercel Blob, Payload media collection
**Implements:** Authentication flow (ARCHITECTURE.md), Admin upload flow (ARCHITECTURE.md)
**Avoids:** Pitfall 1 (Vercel optimization quota), Pitfall 2 (raw uploads), Pitfall 5 (admin API without auth), Pitfall 6 (middleware-only auth bypass)
**Research flag:** Review current Payload 3.x + Vercel Blob official integration guide during implementation; the storage adapter API may have minor changes from what the architecture research captured.

### Phase 3: Admin Content Management (Art CRUD + About)

**Rationale:** With auth and image storage working, Payload CMS admin UI can be configured for full content management. This phase gives Anna the ability to populate the site with real content before the public gallery is built.
**Delivers:** Payload collections for Art Pieces (title, medium, description, tags, image, order) and About (bio text, photo); admin can add/edit/delete pieces and update bio; gallery ordering control; QR code display in admin (react-qr-code component pointing to production domain).
**Uses:** Payload CMS 3.x collections, react-qr-code 2.0.18, react-hook-form 7.x, Zod 3.x
**Implements:** Art CRUD panel, About Editor, QR Code display component (ARCHITECTURE.md components)
**Addresses:** Admin content management, QR code generation (FEATURES.md differentiators)
**Avoids:** QR code integration pitfall (PITFALLS.md — must point to production domain, not preview URL)
**Research flag:** Standard patterns — Payload collection configuration is well-documented. Skip phase research.

### Phase 4: Public Gallery

**Rationale:** Real data now exists. Build the public-facing gallery with CLS prevention baked in from the start — this is the cheapest moment to establish correct image dimensions, blur placeholders, and consistent aspect ratio treatment. This is the core deliverable of the entire project.
**Delivers:** Gallery Server Component fetching art pieces from Payload; GalleryGrid Client Component with category/tag filter (client-side state, no reload); individual piece lightbox (full-resolution image + metadata); consistent aspect ratio treatment for thumbnails; `placeholder="blur"` with generated `blurDataURL` on all images; mobile-first responsive layout.
**Uses:** Next.js Server Components, Framer Motion 11.x (gallery reveal animations), GalleryGrid + ArtCard + FilterBar components
**Implements:** Public Gallery Request Flow (ARCHITECTURE.md), gallery filtering pattern
**Addresses:** Image gallery, gallery filtering, piece metadata, mobile-first responsive (FEATURES.md P1 items)
**Avoids:** Pitfall 2 (CLS — explicit dimensions + blur placeholders from day one), performance trap (no client-side `useEffect` data fetch), gallery images without consistent aspect ratio (PITFALLS.md UX section)
**Research flag:** Standard patterns — Next.js Server Component + Client Component split for gallery is well-documented. Skip phase research.

### Phase 5: Animated Intro

**Rationale:** The intro is a standalone Client Component with no data dependencies (ARCHITECTURE.md build order item 6). Building it after the gallery means the transition target (gallery) already exists and the intro-to-gallery transition can be built correctly. Animation constraints must be applied from the start.
**Delivers:** Full-screen dark animated intro on root route (`/`), transitions into `/gallery` on completion or skip; skip mechanism visible after 1 second; `prefers-reduced-motion` respected; animates only `transform`/`opacity`; tested on CPU-throttled Chrome at 4x; CLS score ≤0.1 verified; `sessionStorage` skip on return visits.
**Uses:** Framer Motion 11.x (AnimatePresence), CSS animations for compositor-thread elements
**Implements:** Animated Intro component (ARCHITECTURE.md), root page pattern
**Addresses:** Animated intro / opening sequence (FEATURES.md top differentiator)
**Avoids:** Pitfall 4 (animation blocking mobile entry — animation constraints applied from design, not discovered after build)
**Research flag:** May benefit from targeted research on Framer Motion AnimatePresence patterns for intro-to-gallery transitions before implementation, especially around page transition state management in Next.js App Router. Flag for phase research if roadmapper identifies this as a new pattern for the team.

### Phase 6: Supporting Public Pages (About + Contact)

**Rationale:** About and Contact are simpler than gallery and have no inter-dependencies. Building them after gallery means the site aesthetic is established and component patterns can be reused consistently.
**Delivers:** About page (bio, photo, artist statement) populated from Payload; Contact form (react-hook-form + Zod validation) with Resend email delivery to Anna's inbox, inline success/error confirmation, honeypot spam protection, rate limiting; social media links; email delivery verified from real phone on cellular.
**Uses:** Resend SDK, react-hook-form 7.x, Zod 3.x, Payload About collection
**Implements:** Contact Form flow (ARCHITECTURE.md), About page (Server Component)
**Addresses:** About section, contact form + email notification, social links (FEATURES.md P1 table stakes)
**Avoids:** Contact form spam flood (honeypot + rate limiting from day one), "send copy to sender" relay exploit (PITFALLS.md security section), no confirmation message UX pitfall
**Research flag:** Standard patterns — Resend + Next.js Server Actions integration has official documentation. Skip phase research.

### Phase 7: Launch Preparation

**Rationale:** Pre-launch verification catches the "looks done but isn't" category of failures that are invisible in development. This phase exists to run the checklist from PITFALLS.md against a production-like environment with a full gallery of images.
**Delivers:** All PITFALLS.md "Looks Done But Isn't" checklist items verified; Vercel image optimization quota usage confirmed acceptable; QR code scanning to production domain confirmed; contact form email delivery confirmed from cellular; CLS score ≤0.1 on mobile Lighthouse; all text/background color pairs contrast-checked; admin API routes verified to reject unauthenticated requests independently of middleware.
**Addresses:** QR code pointing to correct URL, full-gallery performance verification, cross-device testing
**Avoids:** All 6 critical pitfalls through final verification before any physical materials are printed or QR codes distributed
**Research flag:** No research needed — this is a verification/testing phase against a defined checklist.

### Phase Ordering Rationale

- **Foundation before everything** because design tokens verified for contrast are cheaper to establish now than to audit and fix across a built component system
- **Image infrastructure before gallery** because raw images stored at MVP speed would require a migration script to re-process all stored assets (HIGH recovery cost per PITFALLS.md)
- **Auth before admin features** because any admin functionality built without working auth would need security review before it could safely go to production
- **Gallery before intro** because the intro transitions into the gallery — the transition target must exist first, and having the gallery's aesthetic established makes the intro transition design decisions concrete
- **About/Contact after gallery** because they are simpler, independent, and reuse established patterns — there is no technical reason to sequence them earlier
- **Dedicated launch prep phase** because the pitfall research identified multiple categories of failures that are invisible in development and only surface against a full production dataset

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Animated Intro):** Framer Motion AnimatePresence + Next.js App Router page transitions can have non-obvious state management requirements, especially around `sessionStorage` skip logic across route changes. If this pattern is unfamiliar, run a targeted research spike before implementation.
- **Phase 2 (Image Infrastructure):** Payload 3.x + Vercel Blob storage adapter integration should be cross-checked against the current official Payload docs during implementation; the integration is moving quickly and the research reflects the state as of March 2026.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Official `create-payload-app --template website` scaffolds the entire Next.js + Payload + Vercel setup. Follow the Payload + Turso deployment guide directly.
- **Phase 3 (Admin Content Management):** Payload collection configuration is core Payload CMS functionality with thorough official documentation.
- **Phase 4 (Public Gallery):** Server Component data fetch → Client Component filter state is the canonical Next.js App Router gallery pattern; multiple reference implementations exist.
- **Phase 6 (About + Contact):** Resend + Server Actions has official Next.js documentation; react-hook-form + Zod is a standard pairing with extensive community documentation.
- **Phase 7 (Launch Prep):** Checklist-driven verification against PITFALLS.md — no new patterns to research.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core recommendations (Next.js, Payload, Turso, Vercel Blob, Resend) verified against official documentation and official Vercel/Payload templates. Version compatibility table cross-referenced. One MEDIUM-confidence note: Next.js 16 version number was search-verified, not confirmed against nextjs.org release page directly. |
| Features | MEDIUM-HIGH | Industry sources (Format.com, Certified Tattoo Studios, Site Builder Report) consistently agree on what a tattoo apprenticeship portfolio needs. The competitive framing (vs Instagram, vs Squarespace) is well-supported. Confidence is not HIGH because tattoo industry practitioner sources are limited and some recommendations rely on general portfolio research extended to the tattoo domain. |
| Architecture | HIGH | Core patterns (Server Components for fetch, Server Actions for mutations, dual-layer auth, direct browser-to-Cloudinary upload) are verified against Next.js official docs and corroborated by multiple independent sources. CVE-2025-29927 middleware bypass is HIGH confidence (multiple sources). Cloudinary direct upload pattern has official community library support. |
| Pitfalls | HIGH | Critical pitfalls verified against official Vercel limits documentation, web.dev CLS documentation, WCAG official sources, and multiple independent developer sources. Vercel 1,000 image optimization quota is confirmed official. The animation and contrast pitfalls are based on well-established performance and accessibility research. |

**Overall confidence:** HIGH

### Gaps to Address

- **Payload CMS 3.x + Turso SQLite exact configuration:** The Payload + Turso guide was referenced at HIGH confidence, but the exact adapter version and environment variable names should be verified against the current Payload docs at implementation time. Payload 3.x is actively developed and minor breaking changes in adapter configuration are possible.
- **Vercel Blob vs Cloudinary final decision:** STACK.md recommends Vercel Blob for simplicity, but ARCHITECTURE.md references Cloudinary patterns. PITFALLS.md recommends routing all delivery through Cloudinary to avoid the 1,000-optimization quota. Recommendation: use Vercel Blob for storage + configure `next/image` with a Cloudinary loader for delivery, OR process everything to WebP via Sharp at upload time and serve directly from Vercel Blob without next/image optimization. This decision should be finalized in Phase 2 and documented in architecture notes.
- **Framer Motion AnimatePresence + App Router session skip pattern:** This specific combination (intro that does not replay on return visits, managed via sessionStorage, with App Router navigation) has limited battle-tested reference implementations. Flag for a targeted spike if the team is unfamiliar.
- **Contact form spam protection level:** PITFALLS.md recommends a honeypot field plus Cloudflare Turnstile or reCAPTCHA v3. For a portfolio with low expected traffic, a honeypot alone may be sufficient. This is a judgment call for Phase 6 implementation — the right answer depends on how quickly the domain gets indexed and attracting bots.

---

## Sources

### Primary (HIGH confidence)
- [Payload CMS official Turso/SQLite guide](https://payloadcms.com/posts/guides/how-to-set-up-payload-with-sqlite-and-turso-for-deployment-on-vercel)
- [Vercel Blob pricing and limits](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Vercel platform limits (image optimization quota)](https://vercel.com/docs/limits)
- [Tailwind CSS v4.0 official announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Resend official Next.js documentation](https://resend.com/nextjs)
- [next-cloudinary GitHub (official community library)](https://github.com/cloudinary-community/next-cloudinary)
- [WorkOS — Next.js App Router Authentication Guide 2026](https://workos.com/blog/nextjs-app-router-authentication-guide-2026) — CVE-2025-29927 middleware bypass documentation
- [web.dev CLS documentation](https://web.dev/articles/cls)
- [WebAIM contrast checker and WCAG documentation](https://webaim.org/articles/contrast/)

### Secondary (MEDIUM confidence)
- [Certified Tattoo Studios — Tattoo Apprenticeship Portfolio Guide](https://certifiedtattoo.com/blog/how-to-put-together-a-portfolio-for-tattoo-apprenticeships)
- [Format.com — Tattoo Artist Portfolio examples and best practices](https://www.format.com/magazine/resources/photography/tattoo-apprenticeship-portfolio)
- [Site Builder Report — 25+ Tattoo Website Examples](https://www.sitebuilderreport.com/inspiration/tattoo-websites) — pattern analysis across real sites
- [SoftwareMill — Modern Full Stack App Architecture with Next.js 15](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)
- [Pagepro — Common Next.js Image Optimization Mistakes](https://pagepro.co/blog/common-nextjs-mistakes-core-web-vitals/)
- [ReactScript — React Image Gallery Libraries 2026](https://reactscript.com/best-image-gallery/)
- [Payload vs Sanity CMS comparison](https://www.reactlibraries.com/blog/payload-cms-vs-sanity-for-next-js-15-a-technical-comparison)

### Tertiary (LOW confidence)
- [Medium/Orpetron — Framer Motion animation trends 2026](https://medium.com/orpetron/web-design-innovation-trends-driven-by-framer-motion-movement-5b29c24df52d) — single community source; animation trend observations only, not technical guidance
- [marmelab — GSAP In Practice: Avoid The Pitfalls](https://marmelab.com/blog/2024/05/30/gsap-in-practice-avoid-the-pitfalls.html) — 2024 source; GSAP specifics may have changed but general animation performance guidance is stable

---

*Research completed: 2026-03-13*
*Ready for roadmap: yes*
