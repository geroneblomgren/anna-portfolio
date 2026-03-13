# Phase 1: Foundation - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold a Next.js + Payload CMS application with Turso/SQLite database, deploy to Vercel, and establish a dark design system with verified WCAG contrast ratios. This foundation is what every subsequent phase builds on — the color tokens, typography, and layout shell are locked here.

</domain>

<decisions>
## Implementation Decisions

### Dark color palette
- Warm darks — deep charcoals with warm undertones (brown-blacks, dark umbers)
- Background: #1a1614 (warm charcoal), Surface: #252220 (dark umber), Border: #3d3633 (muted brown)
- Muted text: #8a7e76 (warm gray), Body text: #d4ccc4 (warm cream), Heading: #f0ebe6 (off-white)
- Single accent color: amber/gold (#c8956c primary, #d4a67d hover, #8b6b4a muted)
- No secondary accent — only artwork brings color to the page, UI stays warm neutrals + amber
- Functional colors only for error (#c05545) and success (#7a9a6e)
- Images presented frameless/edge-to-edge — the dark background IS the mat, no borders or shadows

### Typography
- Expressive/artistic typographic feel — this is a personal brand, not a generic portfolio
- Headings: Bodoni Moda (Google Fonts) — dramatic high-contrast serif with thick/thin strokes
- Body: DM Sans (Google Fonts) — clean geometric sans, warm character, excellent screen readability
- The pairing creates a gallery exhibition catalog feel with strong personality

### Base layout shell
- No persistent navigation — full immersive experience with floating menu button
- Navigation fades in contextually as user scrolls; floating nav anchors to sections
- Single-page scrolling architecture: Intro → Gallery → About → Contact all in one flow
- Smooth scroll between sections, no page transitions or route changes for main content
- Centered max-width container on desktop with dark space on sides (gallery wall effect)
- Mobile-first: artwork owns the full screen, maximum space for images

### Scaffolding approach
- Use Payload CMS official template: `create-payload-app --template website`
- Strip template to essentials — remove example collections (Pages, Posts, Categories, seed data)
- Replace with Anna's content model: ArtPieces collection, About global, SiteSettings global, keep/adapt Media collection
- Add Turso/SQLite adapter, Tailwind CSS 4, Vercel Blob storage, design tokens
- Vercel account exists — deploy to existing account
- Turso account needs setup — include account creation and database provisioning in phase steps

### Claude's Discretion
- Exact hex values for design tokens (previewed values are starting points, verify contrast ratios)
- Font size and spacing scale
- Heading case treatment (ALL CAPS vs mixed case for Bodoni Moda)
- ESLint/Prettier configuration details
- Environment variable naming and structure
- Floating nav button design and animation behavior
- Loading skeleton design for images

</decisions>

<specifics>
## Specific Ideas

- The warm dark palette should feel like "dim gallery lighting, leather-bound sketchbook" — not tech/digital
- Amber accent should feel like "gallery spotlight" — warm light drawing attention
- The overall vibe is a curated gallery experience, not a generic portfolio template
- Desktop layout should evoke gallery walls with art hung in the center, dark space framing
- Single-page scroll should feel cinematic — intro flows seamlessly into gallery

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes all patterns (design tokens, layout components, Payload config)

### Integration Points
- Payload CMS admin route at /admin (comes from template)
- Turso database connection via @payloadcms/db-sqlite adapter
- Vercel Blob storage via @payloadcms/storage-vercel-blob
- Tailwind CSS 4 design tokens defined in CSS (no tailwind.config.js in v4)
- Google Fonts: Bodoni Moda + DM Sans loaded via next/font

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-13*
