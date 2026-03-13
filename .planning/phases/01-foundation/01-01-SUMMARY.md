---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [next.js, payload-cms, turso, sqlite, tailwind-v4, google-fonts, typescript]

# Dependency graph
requires: []
provides:
  - Next.js 15.3.9 + Payload CMS 3.79.0 project scaffold
  - @payloadcms/db-sqlite adapter configured for Turso/SQLite
  - Tailwind v4 CSS-first design tokens (@theme block in globals.css)
  - Bodoni Moda + DM Sans Google Fonts via next/font with CSS variables
  - Mobile-first frontend layout shell with centered max-width container
  - Media, Users collections; AboutGlobal, SiteSettings globals
  - .env.local with TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, PAYLOAD_SECRET placeholders
affects: [02-admin-image-pipeline, 03-public-site]

# Tech tracking
tech-stack:
  added:
    - next@15.3.9
    - payload@3.79.0
    - "@payloadcms/next@3.79.0"
    - "@payloadcms/db-sqlite@3.79.0"
    - "@payloadcms/richtext-lexical@3.79.0"
    - tailwindcss@4.1.11
    - "@tailwindcss/postcss@4.1.11"
    - sharp@0.34.5
    - graphql@16.13.1
  patterns:
    - Payload CMS admin at /admin via (payload) route group
    - Frontend pages at / via (frontend) route group
    - Tailwind v4 CSS-first — all tokens in @theme block, no tailwind.config.js
    - next/font for Google Fonts with CSS variables consumed by @theme font tokens
    - sqliteAdapter falls back to local file:./payload-dev.db when TURSO_DATABASE_URL unset

key-files:
  created:
    - src/payload.config.ts
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/(frontend)/layout.tsx
    - src/app/(frontend)/page.tsx
    - src/collections/Media.ts
    - src/collections/Users.ts
    - src/globals/AboutGlobal.ts
    - src/globals/SiteSettings.ts
    - src/app/(payload)/admin/[[...segments]]/page.tsx
    - src/app/(payload)/admin/[[...segments]]/not-found.tsx
    - src/app/(payload)/admin/importMap.ts
    - src/app/(payload)/api/[...slug]/route.ts
    - next.config.ts
    - postcss.config.mjs
    - tsconfig.json
    - package.json
    - .gitignore
  modified: []

key-decisions:
  - "Used Next.js 15.3.9 (matches @payloadcms/next peer dep range >=15.3.9 <15.4.0) instead of 16.x which is not yet published"
  - "Scaffolded project manually due to create-payload-app TTY failure in non-interactive Claude Code environment"
  - "importMap.ts is an empty object stub — Payload auto-generates the full map on first dev run"
  - "PAYLOAD_SECRET generated via Node crypto.randomBytes(32) and stored in .env.local"
  - "text-muted-on-surface token (#9a8e86) added alongside text-muted (#8a7e76) to achieve AA contrast on surface backgrounds"

patterns-established:
  - "Route groups: (frontend) for public pages, (payload) for CMS admin — keeps layouts separate"
  - "Design tokens: all in @theme block in globals.css, referenced via CSS var() in Tailwind utilities"
  - "Font loading: next/font with variable mode, CSS var names matching @theme font tokens"
  - "Payload globals: skeleton fields defined now, Phase 2 populates with real data"

requirements-completed: [INF-03, PRES-03, PRES-04]

# Metrics
duration: 16min
completed: 2026-03-13
---

# Phase 1 Plan 01: Scaffold Foundation Summary

**Next.js 15.3.9 + Payload CMS 3.79.0 scaffolded with Turso SQLite adapter, Tailwind v4 @theme design tokens, Bodoni Moda + DM Sans fonts, and a centered mobile-first layout shell — build passes with zero errors**

## Performance

- **Duration:** 16 min
- **Started:** 2026-03-13T20:52:42Z
- **Completed:** 2026-03-13T21:09:17Z
- **Tasks:** 3
- **Files modified:** 18

## Accomplishments

- Full Payload CMS 3.79.0 + Next.js 15.3.9 project structure built from scratch (create-payload-app blocked in non-TTY environment; manually scaffolded equivalently)
- Payload config uses sqliteAdapter with TURSO_DATABASE_URL / TURSO_AUTH_TOKEN env vars with local file fallback for development; admin panel route at /admin works
- Tailwind v4 CSS-first design system: all warm dark palette tokens, accent amber, functional colors, and font references in a single @theme block — no tailwind.config.js
- Google Fonts (Bodoni Moda + DM Sans) loaded via next/font with CSS variables; root layout applies dark background and body font
- Frontend layout shell with gallery-wall dark sides effect; smoke-test home page demonstrates all design tokens

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Payload CMS project and configure Turso database adapter** - `ac664e9` (feat)
2. **Task 2: Install Tailwind v4 with dark design tokens and contrast-verified color palette** - `fe5aa6c` (feat)
3. **Task 3: Set up Google Fonts and mobile-first layout shell** - `90067dd` (feat)

**Plan metadata:** (docs commit — this summary)

## Files Created/Modified

- `src/payload.config.ts` — Payload config with sqliteAdapter, Media/Users collections, AboutGlobal/SiteSettings globals
- `src/app/globals.css` — Tailwind v4 @theme with full dark design token system
- `src/app/layout.tsx` — Root layout with Bodoni Moda + DM Sans, dark body, metadata
- `src/app/(frontend)/layout.tsx` — Centered max-w-5xl container with responsive padding
- `src/app/(frontend)/page.tsx` — Design system smoke test page (replaced in Phase 3)
- `src/collections/Media.ts` — Media upload collection with alt text
- `src/collections/Users.ts` — Payload auth users collection
- `src/globals/AboutGlobal.ts` — About skeleton: bioText (richText), photoId (upload), artistStatement
- `src/globals/SiteSettings.ts` — Site settings: siteName, siteDescription, socialLinks array
- `src/app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin page handler
- `src/app/(payload)/admin/importMap.ts` — Empty import map stub for Payload
- `src/app/(payload)/api/[...slug]/route.ts` — Payload REST API routes
- `next.config.ts` — withPayload() wrapper
- `postcss.config.mjs` — @tailwindcss/postcss plugin
- `tsconfig.json` — TypeScript config with @payload-config path alias
- `package.json` — Project deps: Next.js, Payload, Tailwind v4, sharp

## Decisions Made

- Used Next.js 15.3.9 — the latest version satisfying `@payloadcms/next@3.79.0` peer dep range (`>=15.3.9 <15.4.0`); Next.js 16 is not yet a published release
- Scaffolded manually instead of using `create-payload-app` — the CLI requires TTY input which is unavailable in the Claude Code non-interactive shell environment; manual scaffold produces equivalent structure
- `importMap.ts` is an empty object stub — Payload's withPayload() plugin auto-generates the full client import map on `next dev` / `next build`
- `--legacy-peer-deps` required for npm install due to peer dep range strictness in Payload 3.79.0

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-payload-app TTY failure — manual scaffold**
- **Found during:** Task 1 (scaffold Payload CMS project)
- **Issue:** `create-payload-app` requires interactive TTY for project setup; fails with "TTY initialization failed: uv_tty_init returned EBADF" in Claude Code's non-interactive shell
- **Fix:** Manually created equivalent project structure — package.json, tsconfig.json, next.config.ts, payload.config.ts, route handlers, collections, globals — matching what the website template would produce
- **Files modified:** All initial project files
- **Verification:** `npm run build` completes with zero errors, all routes present
- **Committed in:** ac664e9 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed not-found.tsx and page.tsx TypeScript signatures**
- **Found during:** Task 1 (build verification)
- **Issue:** `generatePageMetadata` requires `searchParams` argument; `NotFoundPage` requires `importMap`, `params`, and `searchParams` — initial implementation was missing required props
- **Fix:** Updated both admin route files to pass all required props with correct types
- **Files modified:** `src/app/(payload)/admin/[[...segments]]/page.tsx`, `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- **Verification:** TypeScript type check passes on build
- **Committed in:** ac664e9 (Task 1 commit, same iteration)

---

**Total deviations:** 2 auto-fixed (1 blocking - TTY scaffold, 1 bug - TypeScript signatures)
**Impact on plan:** Both fixes necessary for functionality. No scope creep. Final result is equivalent to what create-payload-app would have produced.

## Issues Encountered

- `@payloadcms/payload-cloud` plugin referenced in initial payload.config.ts draft was not installed — removed it (not required for local dev or this phase)
- `npm install` required `--legacy-peer-deps` flag due to Payload's strict peer dep declarations for Next.js version ranges

## User Setup Required

External services require manual configuration before `npm run dev` can fully work:

1. **Turso database** (for production — dev falls back to `payload-dev.db` local file):
   - Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
   - Login: `turso auth login`
   - Create database: `turso db create anna-portfolio`
   - Get URL: `turso db show --url anna-portfolio` → set as `TURSO_DATABASE_URL` in `.env.local`
   - Get token: `turso db tokens create anna-portfolio` → set as `TURSO_AUTH_TOKEN` in `.env.local`

2. **Dev server works without Turso** — SQLite local file (`payload-dev.db`) is used as fallback when `TURSO_DATABASE_URL` is empty.

## Next Phase Readiness

- Project builds cleanly; `npm run dev` starts the dev server at localhost:3000
- Payload admin panel at /admin renders (shows create-first-user on first visit)
- All design tokens locked — Phase 2 and 3 should import directly from Tailwind utilities
- Font CSS variables `--font-bodoni-moda` and `--font-dm-sans` available globally
- About and SiteSettings globals are skeleton fields — Phase 2 fills in real content

---
*Phase: 01-foundation*
*Completed: 2026-03-13*
