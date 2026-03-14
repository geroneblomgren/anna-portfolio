# Phase 3: Public Site - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors who scan the QR code experience a complete portfolio — animated intro, browsable gallery with tag filtering, full-resolution lightbox, about page, and working contact form. This phase builds everything viewers see, using real data from the admin panel (Phase 2).

</domain>

<decisions>
## Implementation Decisions

### Intro Animation
- Ink bleed style — abstract ink/charcoal strokes animate across a dark screen, forming into "Anna Blomgren" with subtitle "Artist & Illustrator" fading in below
- Duration ~3-4 seconds
- Transition: dissolve out — ink/name fades to black, then gallery fades in (cinematic cut)
- Skip control: small "Skip" text/button in the corner (explicit, like YouTube ads)
- Intro does not replay on return visits (use localStorage/cookie flag)
- `prefers-reduced-motion` skips animation entirely, goes straight to gallery

### Gallery Layout & Interaction
- Grid style: Claude's discretion — pick the best layout for a B&W artwork portfolio with mixed aspect ratios
- Tag filter UI: horizontal pill buttons above the gallery ("All", "Drawings", "Paintings", "Tattoo Designs", "Digital Art", "Mixed Media")
- Active pill highlights, tap to filter — pieces update without page reload
- Featured pieces display first, then admin-defined sort order
- Blur placeholders load first (blurDataURL from Media pipeline), no layout shift

### Lightbox
- Full-screen image initially (lightbox 2400px variant)
- Swipe/tap to reveal a details panel with title, medium, description, and tags
- Left/right swipe or arrow keys to navigate between pieces without closing
- Close button to return to gallery grid

### Navigation & Page Structure
- Separate pages: Gallery at `/`, About at `/about`, Contact at `/contact`
- Minimal top bar: "Anna Blomgren" on left, nav links (Gallery, About, Contact) on right
- Fixed nav — stays pinned to top on scroll
- Mobile: hamburger menu (collapses 3 links into overlay)

### About Page
- Full-width hero photo spanning the page (from AboutGlobal.photoId)
- Bio text (rich text from AboutGlobal.bioText) flows underneath
- Artist statement below bio
- Social links (Instagram) displayed on the about page only — not in a site-wide footer
- Contact email and phone from AboutGlobal if populated

### Contact Form
- Fields: Name, Email, Message (3 fields, no subject line)
- Email notification sent to Anna on submission
- Confirmation UX: Claude's discretion

### Claude's Discretion
- Gallery grid style (masonry vs uniform vs hybrid — pick what's best for mixed B&W art)
- Contact form submission confirmation UX (inline message vs toast)
- Ink bleed animation implementation approach (CSS animations, canvas, SVG)
- Loading skeletons and error states
- Exact spacing, typography scale, and transitions
- Email delivery service selection (Resend, SendGrid, etc.)

</decisions>

<specifics>
## Specific Ideas

- Ink bleed animation ties directly to Anna's B&W charcoal/ink art style — the intro should feel like her art medium coming to life on screen
- The cold graphite palette (#0a0a0a bg, steel grays, cold whites) is already established — everything must feel cohesive with this
- Primary entry point is phone via QR code — mobile experience is paramount
- Bodoni Moda for headings, DM Sans for body text — already configured

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Media collection**: 3 image sizes ready (thumb 400px, gallery 1200px, lightbox 2400px) + blurDataURL for placeholders
- **ArtPieces collection**: orderable, featured flag, tags (select with 5 options), title, medium, description
- **AboutGlobal**: rich text bio (Lexical editor), photoId (upload), artistStatement, contactEmail, contactPhone
- **SiteSettings**: siteName, siteDescription, socialLinks array (platform + URL), qrUrl
- **Design tokens**: full cold graphite palette in globals.css, Bodoni Moda + DM Sans font variables

### Established Patterns
- Tailwind v4 with `@theme` for design tokens — extend, don't override
- Payload CMS globals for site-wide content (About, SiteSettings)
- Vercel Blob storage for images (conditionally enabled with BLOB_READ_WRITE_TOKEN)
- Next.js route groups: `(frontend)` for public, `(payload)` for admin

### Integration Points
- Frontend layout shell at `src/app/(frontend)/layout.tsx` — currently max-w-5xl container, needs nav bar added
- Homepage at `src/app/(frontend)/page.tsx` — currently a design system smoke test, will be replaced with gallery
- New routes needed: `/about` and `/contact` under `(frontend)` route group
- Media `read: () => true` — public images already accessible via API

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-public-site*
*Context gathered: 2026-03-13*
