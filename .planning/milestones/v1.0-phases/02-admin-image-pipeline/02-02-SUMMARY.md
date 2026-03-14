---
phase: 02-admin-image-pipeline
plan: "02"
subsystem: admin
tags: [payload-cms, qrcode, sharp, react, admin-ui, globals]

# Dependency graph
requires:
  - phase: 02-admin-image-pipeline
    provides: ArtPieces collection, Media collection, Vercel Blob storage, Payload config foundation

provides:
  - AboutGlobal extended with contactEmail and contactPhone fields
  - SiteSettings extended with qrUrl field for QR code custom domain
  - QRCodeView: branded 1024px QR PNG admin view with cold graphite palette and 'DARK ARTS BY ANNA' footer
  - QRNavLink: admin sidebar link to /admin/qr-code
  - FeaturedWarning: admin field component warning when >5 pieces featured
  - Migration for new global fields applied to database

affects:
  - Phase 3 (frontend) — About page will read contactEmail/contactPhone from AboutGlobal
  - Phase 3 — header/footer social links come from SiteSettings.socialLinks
  - Phase 3 — QR code printed materials encode SiteSettings.qrUrl

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Payload custom admin view registered via admin.components.views with Component path + path config
    - Payload afterNavLinks for sidebar additions — client component required
    - Payload field-level admin.components.afterInput for contextual warnings
    - importMap.baseDir must be project root (not src/) for correct relative path generation in importMap.js

key-files:
  created:
    - src/components/admin/QRCodeView.tsx
    - src/components/admin/QRNavLink.tsx
    - src/components/admin/FeaturedWarning.tsx
    - src/migrations/20260313_234354.ts
  modified:
    - src/globals/AboutGlobal.ts
    - src/globals/SiteSettings.ts
    - src/payload.config.ts
    - src/collections/ArtPieces.ts
    - src/app/(payload)/admin/importMap.js

key-decisions:
  - "importMap baseDir changed from path.resolve(dirname) to path.resolve(dirname, '..') — src/ as baseDir caused generated relative paths to be one segment short, breaking module resolution in Next.js build"
  - "QRCodeView uses getPayload({ config }) pattern not REST fetch — server component reads global directly, avoiding unnecessary HTTP round-trip"
  - "FeaturedWarning uses useField hook from @payloadcms/ui to read current checkbox value, REST fetch on mount for totalDocs count"

patterns-established:
  - "Payload custom views pattern: Component string uses absolute path from project root with #ExportName hash, baseDir must be project root"
  - "Admin sidebar links must be client components ('use client') — Payload renders afterNavLinks in client context"

requirements-completed: [ADM-05, ADM-06, ADM-08]

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 2 Plan 02: Admin Content Management and QR Code View Summary

**Payload globals extended with contact/social fields, branded cold-graphite QR code admin view with downloadable PNG, featured-pieces warning, and corrected importMap baseDir for Payload 3.x component path resolution.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T23:43:25Z
- **Completed:** 2026-03-13T23:51:52Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Extended AboutGlobal with contactEmail and contactPhone fields, SiteSettings with qrUrl; migration created and applied
- Created QRCodeView Server Component: generates 1024px QR PNG with #e0e0e0 on #0a0a0a palette, Sharp-composited "DARK ARTS BY ANNA" wordmark footer, base64 data URL for inline display and browser download
- Registered custom admin view at /admin/qr-code, QRNavLink in sidebar, FeaturedWarning as afterInput on featured checkbox; fixed importMap baseDir so Payload 3.x resolves component paths correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend About and SiteSettings globals with contact and QR fields** - `a9259c8` (feat)
2. **Task 2: QR code admin view, nav link, featured warning, and Payload config** - `8f694eb` (feat)

## Files Created/Modified

- `src/globals/AboutGlobal.ts` — Added contactEmail (email) and contactPhone (text) fields
- `src/globals/SiteSettings.ts` — Added qrUrl field with admin description
- `src/migrations/20260313_234354.ts` — Migration adding new columns for contact and QR fields
- `src/components/admin/QRCodeView.tsx` — Async Server Component: reads qrUrl from site-settings, generates branded QR PNG via qrcode + sharp, renders preview + download link
- `src/components/admin/QRNavLink.tsx` — Client component: sidebar navigation link to /admin/qr-code
- `src/components/admin/FeaturedWarning.tsx` — Client component: warns when >5 art pieces featured, uses useField hook + REST fetch
- `src/payload.config.ts` — Registered custom view, afterNavLinks, fixed importMap.baseDir to project root
- `src/collections/ArtPieces.ts` — Added admin.components.afterInput on featured field pointing to FeaturedWarning
- `src/app/(payload)/admin/importMap.js` — Regenerated with correct ../../../../src/... relative paths

## Decisions Made

- `importMap.baseDir` changed from `path.resolve(dirname)` (= `src/`) to `path.resolve(dirname, '..')` (= project root). With `src/` as baseDir, Payload generated `../../../src/components/admin/...` from importMap.js which resolved to `src/src/components/admin/...` — missing module error on build. Setting baseDir to project root causes Payload to generate `../../../../src/components/admin/...` which resolves correctly to `src/components/admin/...`.
- QRCodeView reads the global via `getPayload({ config })` in a Server Component rather than a client-side fetch — avoids auth complexity and HTTP overhead since this is server-rendered admin UI.
- FeaturedWarning fetches count on mount via REST (`/api/art-pieces?where[featured][equals]=true&limit=0`) rather than a server-side validate function — validate runs on save and would block save rather than warn inline.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed importMap.baseDir causing incorrect relative paths**
- **Found during:** Task 2 (build verification)
- **Issue:** With `baseDir: path.resolve(dirname)` pointing to `src/`, Payload generated `../../../src/components/admin/...` from importMap.js. This resolves to `src/src/components/admin/...` (one extra `src/` segment), causing "Module not found" errors.
- **Fix:** Changed `baseDir` to `path.resolve(dirname, '..')` (project root), causing Payload to generate `../../../../src/components/admin/...` which correctly resolves to `src/components/admin/...`
- **Files modified:** src/payload.config.ts, src/app/(payload)/admin/importMap.js
- **Verification:** `npm run build` completed with exit code 0
- **Committed in:** `8f694eb` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — importMap path resolution)
**Impact on plan:** Fix necessary for build to succeed. No scope creep.

## Issues Encountered

- Payload's `generate:importmap` generates relative paths in importMap.js based on the distance between baseDir and the importMap.js output location. The `baseDir` must point to the project root (not `src/`) so component paths like `/src/components/admin/...` resolve correctly. This is a gotcha with the Payload 3.x component system when payload.config.ts lives in a `src/` subdirectory.

## User Setup Required

None - no external service configuration required for this plan. The QR URL field defaults gracefully to `https://annadesign.com` until Anna sets her custom domain in Site Settings.

## Next Phase Readiness

- About global now has full contact info fields (email, phone) ready for Phase 3 About page
- SiteSettings qrUrl ready for Anna to set her custom domain before deploying QR code materials
- Admin panel has QR code download available once dev server is running
- Phase 3 (frontend) can read contactEmail, contactPhone from AboutGlobal for the contact section

---
*Phase: 02-admin-image-pipeline*
*Completed: 2026-03-13*
