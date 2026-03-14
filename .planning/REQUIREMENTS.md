# Requirements: Anna Blomgren Artist Portfolio

**Defined:** 2026-03-13
**Core Value:** When someone scans Anna's QR code, the site must make an immediate, powerful visual impression that communicates versatility, personal voice, and professional seriousness.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Gallery

- [x] **GAL-01**: User can view art pieces in a full-screen lightbox with high-quality images
- [x] **GAL-02**: User can filter gallery by category/style tags (drawings, paintings, tattoo designs, digital, etc.)
- [x] **GAL-03**: Each piece displays title, medium/style, description, and category tags
- [x] **GAL-04**: Gallery loads with optimized images (WebP, lazy loading, responsive srcset)
- [x] **GAL-05**: Gallery displays pieces in admin-defined sort order with featured pieces first

### Presentation

- [x] **PRES-01**: Site opens with a dark, moody animated intro that transitions into the gallery
- [x] **PRES-02**: Intro animation is skippable and respects prefers-reduced-motion
- [x] **PRES-03**: Site uses a dark/moody aesthetic with WCAG-compliant contrast ratios
- [x] **PRES-04**: Layout is mobile-first responsive (QR code → phone is primary entry)

### Admin

- [x] **ADM-01**: Admin panel is protected by password authentication with server-side validation
- [x] **ADM-02**: Admin can add new art pieces with image upload, title, medium, description, and tags
- [x] **ADM-03**: Admin can edit existing art piece metadata and replace images
- [x] **ADM-04**: Admin can delete art pieces
- [x] **ADM-05**: Admin can edit the about section (bio text, photo, artist statement)
- [x] **ADM-06**: Admin can manage contact info and social media links
- [x] **ADM-07**: Admin can reorder gallery pieces (set display order / pin favorites)
- [x] **ADM-08**: Admin can view and download a QR code pointing to the site

### Public Pages

- [x] **PUB-01**: About page displays Anna's bio, photo, and story of pursuing tattooing
- [x] **PUB-02**: Contact form sends email notification to Anna on submission
- [x] **PUB-03**: Social media links displayed (Instagram minimum)

### Infrastructure

- [x] **INF-01**: Images are processed on upload (resize, compress, convert to WebP)
- [x] **INF-02**: Site deploys on Vercel free tier with zero monthly cost
- [x] **INF-03**: Database stores art piece metadata, about content, and admin credentials

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENH-01**: SEO metadata per piece (title, description, OG image)
- **ENH-02**: Instagram feed embed on about page
- **ENH-03**: Print-ready portfolio export (PDF)
- **ENH-04**: Analytics dashboard beyond hosting provider defaults

## Out of Scope

| Feature | Reason |
|---------|--------|
| Online booking / appointments | Anna is seeking apprenticeship, not clients — booking signals wrong professional framing |
| E-commerce / print sales | Portfolio focus, not a shop — adds payment/legal complexity |
| Blog / news section | High maintenance burden; artist statement in About covers her voice |
| User accounts / registration | Only Anna needs admin access — multi-user adds attack surface |
| Real-time chat / messaging | Shop owners won't live-chat a portfolio; contact form sufficient |
| Comments / social features | Creates moderation burden; social interaction belongs on Instagram |
| Video gallery | High bandwidth cost; keep video on Instagram/TikTok, link from social section |
| Multi-language support | Targeting local shops; English only is correct scope |
| PWA / offline mode | No use case for offline portfolio viewing |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GAL-01 | Phase 3 | Complete |
| GAL-02 | Phase 3 | Complete |
| GAL-03 | Phase 3 | Complete |
| GAL-04 | Phase 3 | Complete |
| GAL-05 | Phase 3 | Complete |
| PRES-01 | Phase 3 | Complete |
| PRES-02 | Phase 3 | Complete |
| PRES-03 | Phase 1 | Complete |
| PRES-04 | Phase 1 | Complete |
| ADM-01 | Phase 2 | Complete |
| ADM-02 | Phase 2 | Complete |
| ADM-03 | Phase 2 | Complete |
| ADM-04 | Phase 2 | Complete |
| ADM-05 | Phase 2 | Complete |
| ADM-06 | Phase 2 | Complete |
| ADM-07 | Phase 2 | Complete |
| ADM-08 | Phase 2 | Complete |
| PUB-01 | Phase 3 | Complete |
| PUB-02 | Phase 3 | Complete |
| PUB-03 | Phase 3 | Complete |
| INF-01 | Phase 2 | Complete |
| INF-02 | Phase 1 | Complete |
| INF-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation — all 23 requirements mapped*
