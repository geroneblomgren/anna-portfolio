# Roadmap: Anna Blomgren Artist Portfolio

## Overview

Three phases take the project from zero to a deployed, self-managed portfolio. Phase 1 scaffolds the stack and locks in the dark design system so no color decisions get made twice. Phase 2 builds the admin panel with image processing and all content management so Anna can load real artwork before anything public is visible. Phase 3 builds everything viewers see — gallery, animated intro, about, and contact — against real data, completing the site.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js + Payload CMS + Turso scaffolded, deploying to Vercel, dark design tokens verified for contrast
- [ ] **Phase 2: Admin + Image Pipeline** - Password-protected admin panel with image processing, full art CRUD, about/contact management, and QR code
- [ ] **Phase 3: Public Site** - Gallery, animated intro, about page, and contact form — the complete viewer experience

## Phase Details

### Phase 1: Foundation
**Goal**: A deployed Next.js + Payload CMS application with a verified dark design system that every subsequent phase builds on
**Depends on**: Nothing (first phase)
**Requirements**: INF-02, INF-03, PRES-03, PRES-04
**Success Criteria** (what must be TRUE):
  1. The app deploys to Vercel and is reachable at a public URL with zero errors in the build log
  2. The database (Turso/SQLite) is connected and Payload CMS admin route is accessible at /admin
  3. Every color token in the design system has a documented contrast ratio — body text passes 7:1, UI text passes 4.5:1 — verified against actual hex values
  4. The layout is visibly mobile-first: on a 375px viewport, content is readable and nothing overflows
**Plans**: 2 plans
Plans:
- [ ] 01-01-PLAN.md — Scaffold project, configure Turso, install Tailwind v4 design tokens, fonts, and layout shell
- [ ] 01-02-PLAN.md — Deploy to Vercel, verify design system, admin, contrast ratios, and mobile layout

### Phase 2: Admin + Image Pipeline
**Goal**: Anna can log into a secure admin panel, upload and manage all her artwork with automatic image processing, edit her bio and contact details, and download the QR code
**Depends on**: Phase 1
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, ADM-08, INF-01
**Success Criteria** (what must be TRUE):
  1. Admin login rejects wrong passwords; a valid session grants access to /admin and survives a page refresh
  2. An uploaded JPEG (any camera resolution) is stored as WebP at ≤300KB with a blur placeholder — verified by checking the stored file size and format
  3. Admin can add an art piece with title, medium, description, and tags, then see it appear in the piece list
  4. Admin can edit piece metadata, replace the image, delete a piece, and reorder pieces — all changes persist after page reload
  5. Admin can update bio text and photo, manage social links, and download a scannable QR code pointing to the production URL
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md — ArtPieces collection, Media image pipeline (WebP + blur), Vercel Blob storage, migrations
- [ ] 02-02-PLAN.md — About/Contact global extensions, QR code admin view, featured warning component
- [ ] 02-03-PLAN.md — Human verification of all Phase 2 admin functionality

### Phase 3: Public Site
**Goal**: Visitors who scan the QR code experience a complete portfolio — animated intro, browsable gallery with filtering, full-resolution lightbox, about page, and working contact form
**Depends on**: Phase 2
**Requirements**: GAL-01, GAL-02, GAL-03, GAL-04, GAL-05, PRES-01, PRES-02, PUB-01, PUB-02, PUB-03
**Success Criteria** (what must be TRUE):
  1. On first visit, a dark animated intro plays and transitions into the gallery; a skip control appears within 1 second; the intro does not replay on return visits; prefers-reduced-motion skips the animation entirely
  2. Visitor can filter gallery by category tag and see only matching pieces update without a page reload
  3. Tapping any piece opens a full-resolution lightbox showing the image, title, medium, description, and tags
  4. Gallery thumbnail images load with blur placeholders and no layout shift; a mobile Lighthouse run scores CLS ≤ 0.1
  5. About page displays Anna's bio, photo, and story; contact form submits successfully and Anna receives an email notification; Instagram link is visible and navigates correctly
**Plans**: 4 plans
Plans:
- [ ] 03-01-PLAN.md — Install dependencies, navigation shell, gallery masonry grid with tag filtering
- [ ] 03-02-PLAN.md — Ink-bleed intro animation and full-screen lightbox with piece details
- [ ] 03-03-PLAN.md — About page with CMS content and contact form with Resend email
- [ ] 03-04-PLAN.md — Human verification of complete Phase 3 public site

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-03-13 |
| 2. Admin + Image Pipeline | 2/3 | In Progress|  |
| 3. Public Site | 0/TBD | Not started | - |
