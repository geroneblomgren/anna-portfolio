# Feature Research

**Domain:** Tattoo Artist Apprenticeship Portfolio Website
**Researched:** 2026-03-13
**Confidence:** MEDIUM-HIGH (verified across multiple industry sources; architecture-specific confidence noted per feature)

---

## Context

Anna is pursuing a tattoo apprenticeship. Her primary audience is tattoo shop owners evaluating her skills. The site is entered via QR code scan on mobile. The goal is not to get bookings — it is to impress a professional evaluator enough to invite Anna for a conversation. This context sharply focuses which features matter and which are irrelevant noise.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist. A tattoo shop owner scanning a QR code will bounce immediately if these are missing or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Image gallery — full-screen quality images | The work IS the portfolio; evaluators need to see technique, line work, shading, color at full resolution | MEDIUM | Lightbox essential; thumbnails are not enough for professional evaluation |
| Gallery category/tag filtering | Shop owners want to see specific styles (black & grey, color, realism, traditional, tattoo designs vs other media) — scrolling an unfiltered feed wastes their limited time | MEDIUM | Filter by style/medium is industry standard on all professional tattoo sites |
| About section with bio and photo | Establishes Anna as a person, not just an anonymous portfolio; story of pursuing tattooing signals seriousness | LOW | Bio + professional-ish photo; narrative about her artistic journey matters to evaluators |
| Contact information / contact form | Every professional portfolio must have a way to reach out; missing this = dead end | LOW | Email notification on form submission is required; evaluator won't remember to come back |
| Social media links | Instagram is the de facto standard for tattoo artists — evaluators will want to follow/verify activity | LOW | Instagram minimum; possibly TikTok/Pinterest depending on where Anna posts |
| Mobile-responsive layout | QR code → phone is the PRIMARY entry path; non-mobile site signals technical incompetence | MEDIUM | Mobile-first design is non-negotiable, not an enhancement |
| Fast image loading | Images are the product; slow loads = bounce before work is seen; Google research: 40% higher bounce rate above 3s | MEDIUM | Image optimization (WebP, lazy loading, responsive srcset) is required infrastructure |
| Individual piece detail view | Evaluators need to see title, medium, style, and description per piece — context shows professional thinking | LOW | Implemented as lightbox overlay or dedicated piece page |
| Dark/moody visual aesthetic | Tattoo industry aesthetic expectation; a light pastel portfolio signals cultural mismatch to shop owners | LOW | Theme-level decision, not a feature per se, but its absence would tank credibility |

### Differentiators (Competitive Advantage)

Features that set Anna apart from artists who just hand shop owners their phone with an Instagram grid.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Animated intro / opening sequence | Creates a memorable first impression that a static grid cannot; signals craft and attention to presentation — the kind of intentionality tattoo shops value | HIGH | GSAP or Framer Motion; must be skippable; must not delay content access on slow connections; the intro transitions into the gallery, not away from it |
| Rich piece metadata (title, medium, description, tags) | Demonstrates Anna thinks about her work analytically, not just aesthetically; shows professionalism shop owners respond to | LOW | Most artist social profiles show zero context — this is a clear differentiator |
| QR code generation built into admin | Anna can regenerate/download a QR code pointing to the site any time; print it, put it on business cards, hand it at events — the QR IS the delivery mechanism for this portfolio | LOW | Can be a static QR pointing to the domain; admin just displays/downloads it |
| Password-protected admin panel | Anna controls her own content without a developer; she can add new pieces, update her bio, and change her contact info after apprenticeship outreach evolves | MEDIUM | Single-user, simple auth — not a full CMS; just enough to manage content |
| Curated gallery experience (not Instagram grid) | Purpose-built portfolio presentation vs social media grid signals that Anna takes her professional image seriously | MEDIUM | Custom ordering, featured/hero pieces, intentional curation controls in admin |
| Piece count and variety visible at a glance | Shop owners want to see 20-50 strong pieces across styles; a well-organized gallery makes this assessment instant | LOW | Gallery overview with category counts helps evaluators see breadth quickly |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem reasonable but would be scope traps, technical debt, or category errors for this specific project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Online booking / appointment scheduling | Many tattoo websites have booking; seems professional | Anna is seeking an apprenticeship, not booking clients; a booking form signals she's already operating as a professional tattoo artist, which could undermine the "I want to learn from you" framing — and it's massive complexity for zero value | Contact form with clear apprenticeship inquiry context |
| E-commerce / print shop | Portfolio sites sometimes sell prints | Completely off-brand for this use case; adds legal/payment complexity; distracts from portfolio focus | Explicitly out of scope per PROJECT.md |
| Blog / news section | Artists share process content | High ongoing content maintenance burden; Anna needs to focus on her artwork, not writing; adds technical complexity for minimal evaluation benefit | Artist statement in About section covers her voice |
| User accounts / registration | Seems like a natural CMS feature | Only Anna needs admin access; multi-user auth is unnecessary complexity that adds attack surface | Single admin user with a strong password is sufficient |
| Real-time chat / messaging | Modern sites have live chat | No value for this audience; shop owners won't live-chat a portfolio; adds third-party complexity, privacy concerns, ongoing cost | Contact form with fast email notification |
| Comments / social features on gallery | Visitor engagement feels nice | Creates moderation burden; tattoo industry doesn't use portfolio sites for feedback; adds spam risk | Social links send people to Instagram where social interaction already exists |
| Analytics dashboard in admin | Knowing who visits sounds useful | Adds complexity to admin panel; basic analytics from a static hosting provider (Vercel, Netlify) are sufficient and free | Use hosting provider's built-in analytics or Google Analytics tag |
| Video gallery / process videos | Some tattoo artists post process videos | High bandwidth cost, complex video hosting (need YouTube/Vimeo embed or pay for CDN), mobile performance impact | Keep video content on Instagram/TikTok; link from social section |
| Multi-language support | Globalization is "best practice" | Anna is targeting local tattoo shops; adds translation maintenance burden indefinitely | Single language (English) is correct scope |
| Progressive Web App (PWA) / offline mode | PWA is modern web best practice | No use case for offline portfolio viewing; adds service worker complexity without benefit for this QR-scan audience | Standard web app with fast loads covers the need |

---

## Feature Dependencies

```
[Admin Panel — Auth]
    └──enables──> [Admin: Manage Gallery Pieces]
                       └──populates──> [Public Gallery]
                                           └──enables──> [Gallery Filtering]
                                           └──enables──> [Piece Detail / Lightbox]

[Admin: Manage Gallery Pieces]
    └──requires──> [Image Upload + Storage]
                       └──requires──> [Image Optimization Pipeline]

[Admin: Edit About Section]
    └──populates──> [Public About Page]

[Admin: Manage Contact/Social]
    └──populates──> [Contact Form]
    └──populates──> [Social Links]

[Contact Form]
    └──requires──> [Email Notification Service]

[Animated Intro]
    └──transitions-into──> [Public Gallery]
    └──conflicts-with──> [Slow connection / no skip option]

[QR Code]
    └──points-to──> [Site URL / Domain]
    └──lives-in──> [Admin Panel — display only]

[Dark Aesthetic]
    └──informs──> [Animated Intro]
    └──informs──> [Gallery Presentation]
```

### Dependency Notes

- **Gallery requires image storage infrastructure:** Choosing a storage approach (Cloudinary, Supabase Storage, local filesystem) must happen before admin image upload is built.
- **Admin auth gates all content management:** Auth must be the first admin feature built; nothing else in admin is buildable without it.
- **Animated intro must transition into gallery:** The intro is not a separate page — it resolves into the gallery. This means the gallery page and the intro must share state or be the same route.
- **Animated intro conflicts with slow connections:** Must include a skip mechanism and should not block gallery content from loading in the background.
- **Contact form requires external email service:** Sending email from a static/serverless site requires a service (Resend, SendGrid, Formspree, etc.) — this is infrastructure, not just a form.
- **Image optimization is not optional infrastructure:** It must be designed in from the start. Retrofitting image optimization after launch is painful and potentially requires re-uploading all assets.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what a shop owner needs to see when they scan Anna's QR code.

- [ ] Dark/moody visual aesthetic and layout — the aesthetic IS part of the first impression
- [ ] Animated intro sequence that transitions into gallery — core differentiator, should ship with v1 because it is the stated primary impression mechanism
- [ ] Image gallery with lightbox — the whole point of the site
- [ ] Gallery filtering by category/style — enables evaluators to find the work relevant to them
- [ ] Individual piece metadata (title, medium, description, tags) — differentiates from Instagram
- [ ] About section with bio and photo — establishes Anna as a real person pursuing this seriously
- [ ] Contact form with email notification — necessary for any follow-up
- [ ] Social media links — evaluators will want to verify/follow on Instagram
- [ ] Mobile-first responsive design — primary entry path is QR → phone
- [ ] Password-protected admin panel with content management (gallery + about + contact/social) — Anna must be able to manage content independently post-launch
- [ ] QR code display/download in admin — the delivery mechanism for the whole product

### Add After Validation (v1.x)

Features to add once the core portfolio is live and Anna is actively using it.

- [ ] Featured/hero piece designation — allow Anna to pin her best work to appear first; add when she has enough pieces to need curation priority control
- [ ] Gallery sort order control in admin — add when piece count grows large enough that ordering matters
- [ ] SEO metadata (title, description, OG image per piece) — add after domain is established and Anna wants discoverability beyond QR code use

### Future Consideration (v2+)

Features to defer indefinitely unless a clear need emerges.

- [ ] Analytics beyond hosting provider defaults — defer unless Anna actively wants to track traffic patterns
- [ ] Instagram feed embed — technically tricky (API auth), often breaks, adds third-party dependency for marginal value
- [ ] Print-ready portfolio export (PDF) — may be valuable for in-person visits; defer until Anna signals need

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Image gallery with lightbox | HIGH | MEDIUM | P1 |
| Gallery filtering | HIGH | MEDIUM | P1 |
| Animated intro (dark moody) | HIGH | HIGH | P1 |
| Mobile-first responsive | HIGH | MEDIUM | P1 |
| Admin — auth + content management | HIGH | MEDIUM | P1 |
| About section | HIGH | LOW | P1 |
| Contact form + email notification | HIGH | LOW | P1 |
| Social links | MEDIUM | LOW | P1 |
| QR code in admin | MEDIUM | LOW | P1 |
| Image optimization pipeline | HIGH | MEDIUM | P1 (infrastructure) |
| Piece metadata (title, desc, tags) | HIGH | LOW | P1 |
| Featured piece / hero control | MEDIUM | LOW | P2 |
| Gallery sort order in admin | MEDIUM | LOW | P2 |
| SEO metadata per piece | LOW | MEDIUM | P3 |
| Analytics dashboard | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Squarespace/Wix Portfolio | Raw Instagram Profile | Anna's Site |
|---------|--------------------------|----------------------|-------------|
| Animated intro | Rarely, template-dependent | No | YES — core differentiator |
| Dark/moody aesthetic | Template option | Grid only | YES — intentional design |
| Gallery filtering by style | Basic/clunky | Highlights only | YES — custom category filter |
| Piece metadata/context | Limited | Caption only | YES — rich per-piece data |
| Contact form | YES (with booking bloat) | DM only | YES — apprenticeship-focused |
| Admin / content control | YES (expensive) | YES (native) | YES — custom, simple |
| Mobile performance | Mediocre (Wix especially) | Good | YES — mobile-first priority |
| QR code integration | No | No | YES — purpose-built for this |
| Free/low cost | $17-23/month | Free | YES — self-hosted target |
| Booking system | YES (irrelevant) | No | NO — deliberate anti-feature |

---

## Sources

- [Tattoo Apprenticeship Portfolio: What to Include (Certified Tattoo Studios)](https://certifiedtattoo.com/blog/how-to-put-together-a-portfolio-for-tattoo-apprenticeships) — MEDIUM confidence (industry blog)
- [How to Create a Tattoo Apprenticeship Portfolio (Format.com)](https://www.format.com/magazine/resources/photography/tattoo-apprenticeship-portfolio) — MEDIUM confidence (platform vendor, verified multiple times)
- [Tattoo Websites: 25+ Examples (Site Builder Report)](https://www.sitebuilderreport.com/inspiration/tattoo-websites) — MEDIUM confidence (pattern analysis across 27 real sites)
- [Best Tattoo Artist Portfolio Examples (Format.com)](https://www.format.com/online-portfolio-website/tattoo-artist/best) — MEDIUM confidence
- [Apprenticeship Portfolio: What Tattoo Artists Look For (Creative Ink)](https://creativeinktattoo.com/2025/03/12/how-to-build-your-apprenticeship-portfolio/) — MEDIUM confidence (practitioner perspective)
- [Static vs Dynamic QR Codes Guide (Scanova)](https://scanova.io/blog/static-vs-dynamic-qr-codes/) — HIGH confidence (technical reference)
- [Portfolio Filter Gallery — W3Schools How To](https://www.w3schools.com/howto/howto_js_portfolio_filter.asp) — HIGH confidence (implementation reference)
- [React Image Gallery Libraries 2026 (ReactScript)](https://reactscript.com/best-image-gallery/) — MEDIUM confidence (library survey)
- [Framer Motion animation trends 2026 (Medium/Orpetron)](https://medium.com/orpetron/web-design-innovation-trends-driven-by-framer-motion-movement-5b29c24df52d) — LOW confidence (single source, community blog)
- [Artist Portfolio Website Must-Haves 2026 (Lovable)](https://lovable.dev/guides/best-art-portfolio-websites-2026) — MEDIUM confidence (aggregator, cross-referenced with other sources)

---

*Feature research for: Tattoo Artist Apprenticeship Portfolio Website*
*Researched: 2026-03-13*
