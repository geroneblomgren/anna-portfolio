# Phase 2: Admin + Image Pipeline - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Anna can log into a secure admin panel, upload and manage all her artwork with automatic image processing, edit her bio and contact details, and download a branded QR code. The public-facing gallery, intro animation, and visitor experience are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Art piece data model
- Predefined category tags based on art medium: Drawings, Paintings, Tattoo Designs, Digital Art, Mixed Media
- Each piece can have multiple tags (multi-select)
- Fields per piece: title, image, category tags (multi-select), medium/technique (text), description (text)
- No year, dimensions, or free-form tags — keep it focused

### Image processing
- Convert uploaded images to WebP at ≤300KB for gallery display
- Generate blur placeholder (blurDataURL) for loading transitions
- 20MB max upload file size
- Show preview of processed image in admin after upload so Anna can verify quality
- Accepted formats: JPEG, PNG, TIFF, WebP (any camera/scanner output)

### Gallery ordering
- Drag-and-drop reordering in the admin piece list
- Featured/pinned toggle on each piece — featured pieces always appear first in gallery
- Soft limit warning after 5+ featured pieces ("Too many featured pieces may dilute impact")
- Grid preview in admin showing current gallery order as thumbnails

### QR code
- Branded QR code matching the portfolio's dark/cold graphite aesthetic
- "Dark Arts by Anna" branding — Claude designs the layout (text placement, styling)
- QR encodes a custom domain URL (Anna plans to use a custom domain)
- Download as high-resolution PNG (1024x1024+)

### Claude's Discretion
- Original image retention strategy (keep full-res for lightbox or generate a high-quality WebP variant)
- QR code layout design — wordmark placement, font sizing, spacing
- Exact drag-and-drop implementation within Payload CMS
- Processing pipeline error handling
- Compression algorithm tuning for art (graphite drawings vs digital art)

</decisions>

<specifics>
## Specific Ideas

- Brand identity: "Dark Arts by Anna" — this is the QR code branding concept Anna wants
- QR code should feel cohesive with the cold graphite palette when printed on business cards or flyers
- Admin preview should show processed result so Anna can verify quality isn't lost in compression
- Category tags are medium-focused (not style-focused): Drawings, Paintings, Tattoo Designs, Digital Art, Mixed Media

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Media` collection (src/collections/Media.ts): Basic upload with alt text — needs image processing hooks added
- `AboutGlobal` (src/globals/AboutGlobal.ts): Already has bioText, photoId, artistStatement fields — may need contact info additions
- `SiteSettings` (src/globals/SiteSettings.ts): Has socialLinks array — extend with contact fields and QR URL
- `Users` collection with `auth: true` — Payload's built-in auth handles ADM-01
- Sharp already installed and configured in payload.config.ts

### Established Patterns
- Payload CMS collection/global pattern for data modeling
- SQLite via Turso adapter for persistence
- Tailwind v4 with custom design tokens (bg, surface, border, accent, text-heading, etc.)
- Bodoni Moda (headings) + DM Sans (body) font pairing
- Cold graphite palette: #0a0a0a bg, #141416 surface, #e0e0e0 accent

### Integration Points
- New `ArtPieces` collection needs to be created and registered in payload.config.ts
- Media collection needs upload hooks for image processing (Sharp)
- SiteSettings global needs QR URL field for custom domain
- Admin route already exists at /admin via Payload — custom components plug in here
- Custom admin components needed: drag-and-drop reorder, grid preview, QR code page

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-admin-image-pipeline*
*Context gathered: 2026-03-13*
