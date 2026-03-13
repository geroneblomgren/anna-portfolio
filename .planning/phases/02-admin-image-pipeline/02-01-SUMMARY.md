---
phase: 02-admin-image-pipeline
plan: 01
subsystem: content-model
tags: [payload, collections, image-processing, vercel-blob, sqlite, sharp]
dependency_graph:
  requires: [01-01]
  provides: [art-pieces-collection, media-image-pipeline, vercel-blob-storage]
  affects: [02-02, 02-03, 03-gallery, 03-lightbox]
tech_stack:
  added:
    - "@payloadcms/storage-vercel-blob ^3.x"
    - "qrcode ^1.x"
    - "@types/qrcode (devDep)"
  patterns:
    - "Payload afterChange hook with setTimeout(100ms) to avoid SQLite transaction race"
    - "vercelBlobStorage plugin conditional on BLOB_READ_WRITE_TOKEN env var"
    - "Sharp WebP processing at ingest: gallery/lightbox/thumb variants"
key_files:
  created:
    - src/collections/ArtPieces.ts
    - src/migrations/20260313_233801.ts
    - src/migrations/20260313_233801.json
  modified:
    - src/collections/Media.ts
    - src/payload.config.ts
    - src/migrations/index.ts
    - src/payload-types.ts
    - package.json
    - package-lock.json
decisions:
  - "vercelBlobStorage wrapped in conditional spread so dev builds work without BLOB_READ_WRITE_TOKEN set"
  - "blurDataURL hook defers update via setTimeout(100ms) to avoid SQLite race with outer afterChange transaction"
  - "Removed staticDir from Media upload config — Vercel Blob adapter manages storage"
  - "Gallery size-exceeded warning logged (not hard-blocked) — full re-compression feedback loop deferred"
metrics:
  duration: 4 min
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_changed: 10
---

# Phase 02 Plan 01: ArtPieces Collection and Image Pipeline Summary

ArtPieces Payload collection with orderable drag-drop, Sharp-based WebP image processing pipeline (gallery/lightbox/thumb variants), blur placeholder generation hook, and Vercel Blob storage adapter wired with clientUploads for 20MB support.

## What Was Built

### ArtPieces Collection (`src/collections/ArtPieces.ts`)

New Payload collection with `slug: 'art-pieces'` and `orderable: true` for built-in drag-and-drop reordering. Fields:
- `title` (text, required)
- `image` (upload, relationTo: media, required)
- `tags` (multi-select: Drawings, Paintings, Tattoo Designs, Digital Art, Mixed Media)
- `medium` (text — "Medium / Technique")
- `description` (textarea)
- `featured` (checkbox, defaults false — pins piece to gallery top)

### Media Collection Upgrade (`src/collections/Media.ts`)

- Added 3 WebP image size variants via Sharp:
  - `gallery`: width 1200px, quality 75, WebP — primary gallery display
  - `lightbox`: width 2400px, quality 90, WebP — high-res for Phase 3 lightbox
  - `thumb`: width 400px, quality 70, WebP — admin grid preview
- Added `blurDataURL` text field (base64 PNG data URI, auto-generated)
- Added `afterChange` hook: generates 10x10 blurred PNG, stores as blurDataURL on the media document
- Restricted mimeTypes to jpeg/png/tiff/webp (removed permissive `image/*`)
- Set `adminThumbnail: 'thumb'`
- Removed `staticDir` (Vercel Blob handles storage)

### Payload Config Update (`src/payload.config.ts`)

- Registered `ArtPieces` in collections array
- Added `vercelBlobStorage` plugin (conditional on `BLOB_READ_WRITE_TOKEN` env var):
  - `collections: { media: true }`
  - `clientUploads: true` — bypasses Vercel's 4.5MB serverless body limit
  - No `prefix` option (known Payload 3.x bug with clientUploads+prefix)

### Database Migration

Migration `20260313_233801` applied to local SQLite dev DB:
- Created `art_pieces` table with all fields + `_order` column (fractional indexing)
- Created `art_pieces_tags` join table
- Added columns to `media`: `blur_data_u_r_l`, `sizes_gallery_*`, `sizes_lightbox_*`, `sizes_thumb_*`

## Deviations from Plan

None — plan executed exactly as written.

The plan already anticipated the SQLite race condition (setTimeout pattern) and the BLOB_READ_WRITE_TOKEN conditional. Both were implemented as specified.

## Self-Check: PASSED

- FOUND: src/collections/ArtPieces.ts
- FOUND: src/collections/Media.ts
- FOUND: src/payload.config.ts
- FOUND: src/migrations/20260313_233801.ts
- FOUND: Task 1 commit 3fa15b9
- FOUND: Task 2 commit cb622f5
- Build: EXIT CODE 0 (zero errors)
