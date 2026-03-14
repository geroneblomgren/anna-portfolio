# Phase 2: Admin + Image Pipeline - Research

**Researched:** 2026-03-13
**Domain:** Payload CMS 3.x upload hooks, Sharp image processing, Vercel Blob storage, QR code generation
**Confidence:** HIGH (core stack verified via official Payload docs + npm), MEDIUM (Sharp hook patterns from verified community source Dec 2025)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Art piece data model**
- Predefined category tags based on art medium: Drawings, Paintings, Tattoo Designs, Digital Art, Mixed Media
- Each piece can have multiple tags (multi-select)
- Fields per piece: title, image, category tags (multi-select), medium/technique (text), description (text)
- No year, dimensions, or free-form tags — keep it focused

**Image processing**
- Convert uploaded images to WebP at ≤300KB for gallery display
- Generate blur placeholder (blurDataURL) for loading transitions
- 20MB max upload file size
- Show preview of processed image in admin after upload so Anna can verify quality
- Accepted formats: JPEG, PNG, TIFF, WebP (any camera/scanner output)

**Gallery ordering**
- Drag-and-drop reordering in the admin piece list
- Featured/pinned toggle on each piece — featured pieces always appear first in gallery
- Soft limit warning after 5+ featured pieces ("Too many featured pieces may dilute impact")
- Grid preview in admin showing current gallery order as thumbnails

**QR code**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADM-01 | Admin panel protected by password authentication with server-side validation | Users collection with `auth: true` already in place; Payload handles login/session/redirect natively |
| ADM-02 | Admin can add new art pieces with image upload, title, medium, description, and tags | New `ArtPieces` collection with upload relationship + fields; multi-select via `select` field type |
| ADM-03 | Admin can edit existing art piece metadata and replace images | Standard Payload collection edit view; image replacement via upload field on the collection |
| ADM-04 | Admin can delete art pieces | Built-in Payload collection delete; no custom work needed |
| ADM-05 | Admin can edit the about section (bio text, photo, artist statement) | `AboutGlobal` already exists — may need contact info additions |
| ADM-06 | Admin can manage contact info and social media links | `SiteSettings` already has `socialLinks` array — extend with contact fields |
| ADM-07 | Admin can reorder gallery pieces (set display order / pin favorites) | Payload 3.x built-in `orderable: true` on collection + `featured` boolean field; multi-sort query |
| ADM-08 | Admin can view and download a QR code pointing to the site | Custom admin view (`admin.components.views`) + `qrcode` npm package; URL sourced from SiteSettings |
| INF-01 | Images are processed on upload (resize, compress, convert to WebP) | Sharp `imageSizes` + `formatOptions` on Media collection; `afterChange` hook for blurDataURL; `@payloadcms/storage-vercel-blob` with `clientUploads: true` for Vercel deployment |
</phase_requirements>

---

## Summary

Phase 2 builds entirely on top of Payload CMS 3.x — the same system already in place. Authentication (ADM-01) is already implemented via `auth: true` on the Users collection. The main work is: (1) creating the ArtPieces collection with proper fields, (2) upgrading the Media collection with Sharp-based WebP conversion and blur placeholder generation, (3) wiring Vercel Blob storage for file persistence beyond Vercel's 4.5MB serverless body limit, (4) leveraging Payload's built-in `orderable: true` for drag-and-drop reordering, and (5) creating a custom admin view for the branded QR code download.

The image pipeline is the most technically nuanced area. Sharp is already installed (`^0.34.5`). The pattern involves two complementary mechanisms: `imageSizes` with `formatOptions: { format: 'webp' }` on the Media collection config for the gallery-display variant, and an `afterChange` hook that runs Sharp independently to generate a tiny 10×10 blurDataURL stored as a text field. A critical timing gotcha exists: calling `req.payload.update()` inside `afterChange` on the same document requires a ~100ms setTimeout to allow the original save to commit first.

Vercel Blob is the confirmed storage strategy (resolved in pre-phase decisions). The `@payloadcms/storage-vercel-blob` package is the official first-party solution. Vercel's serverless body limit is 4.5MB — well below Anna's 20MB upload requirement — so `clientUploads: true` is mandatory. The QR code is implemented as a custom admin view using Payload's `admin.components.views` API and the `qrcode` npm package.

**Primary recommendation:** Use Payload's native `imageSizes` + `formatOptions` for WebP generation, a separate `afterChange` hook for blurDataURL, `@payloadcms/storage-vercel-blob` with `clientUploads: true`, `orderable: true` on ArtPieces, and a custom admin view for QR code download using the `qrcode` npm package.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `payload` | ^3.79.0 (installed) | CMS, auth, admin panel, collections, globals | Already in project; first-party admin UI, hooks, orderable |
| `sharp` | ^0.34.5 (installed) | WebP conversion, resize, blur placeholder | Already installed; Payload delegates all image ops to it |
| `@payloadcms/storage-vercel-blob` | ^3.x (matches payload version) | Serve/store uploaded files outside Vercel serverless body limit | Official first-party plugin; replaces legacy cloud-storage |
| `qrcode` | ^1.5.x | Server-side QR PNG generation | Most downloaded QR library on npm; supports `toBuffer()` for server-side PNG output |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vercel/blob` | (peer dep of storage adapter) | Vercel Blob SDK | Installed automatically by storage adapter |
| `canvas` | optional | Render branded text onto QR PNG | Only if `qrcode` alone can't produce the "Dark Arts by Anna" layout; adds native dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@payloadcms/storage-vercel-blob` | Cloudflare R2 adapter | R2 is cheaper at scale but requires additional account setup; Vercel Blob is zero-config for Vercel deployments |
| `qrcode` npm | `qr-code-styling` | qr-code-styling has richer styling but browser-only canvas API; `qrcode` + `sharp` composite is simpler for Node.js server-side |
| `orderable: true` | Third-party `payload-plugin-collections-docs-order` | Plugin is workaround; native `orderable` is built-in since Payload 3.x, no extra dependency needed |

**Installation:**
```bash
npm install @payloadcms/storage-vercel-blob qrcode
npm install --save-dev @types/qrcode
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── collections/
│   ├── Media.ts           # Upgrade: imageSizes + formatOptions (WebP) + afterChange blur hook
│   ├── ArtPieces.ts       # New: title, image, tags (select), medium, description, featured, orderable
│   └── Users.ts           # Unchanged — auth: true already handles ADM-01
├── globals/
│   ├── AboutGlobal.ts     # Extend: add contactEmail, contactPhone fields
│   └── SiteSettings.ts    # Extend: add qrUrl field (custom domain URL for QR code)
├── components/
│   └── admin/
│       ├── QRCodeView.tsx          # Custom admin view: generate + download QR PNG
│       └── FeaturedWarning.tsx     # UI field: soft warning when featured > 5
└── payload.config.ts      # Add: ArtPieces collection, vercelBlobStorage plugin, custom views
```

### Pattern 1: Media Collection with WebP imageSizes + Blur Hook

**What:** Configure `imageSizes` with `formatOptions: { format: 'webp' }` to generate WebP variants at upload time. A separate `afterChange` hook generates a tiny blurDataURL using Sharp and stores it back on the document.

**When to use:** Every image upload through the Media collection (art pieces and bio photo).

**Example:**
```typescript
// Source: https://payloadcms.com/docs/upload/overview + buildwithmatija.com Dec 2025
upload: {
  staticDir: 'public/media',
  mimeTypes: ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'],
  imageSizes: [
    {
      name: 'gallery',          // ≤300KB WebP for gallery display
      width: 1200,
      withoutEnlargement: true,
      formatOptions: {
        format: 'webp',
        options: { quality: 75 },  // tune: graphite drawings compress better at 75-80
      },
    },
    {
      name: 'thumb',            // small thumbnail for admin grid preview
      width: 400,
      withoutEnlargement: true,
      formatOptions: {
        format: 'webp',
        options: { quality: 70 },
      },
    },
  ],
},
hooks: {
  afterChange: [
    async ({ doc, req, operation }) => {
      if (operation === 'create' || (operation === 'update' && req.file)) {
        // Timing: delay to let original save commit
        setTimeout(async () => {
          try {
            const buffer = req.payloadUploadSizes?.thumb || Buffer.from([])
            // Fallback: re-read file if payloadUploadSizes unavailable
            const blurBuffer = await sharp(buffer)
              .resize(10, 10, { fit: 'inside' })
              .blur(1)
              .png({ compressionLevel: 9 })
              .toBuffer()
            const blurDataURL = `data:image/png;base64,${blurBuffer.toString('base64')}`
            await req.payload.update({
              collection: 'media',
              id: doc.id,
              data: { blurDataURL },
              overrideAccess: true,
            })
          } catch (e) {
            req.payload.logger.error(`blurDataURL generation failed: ${e}`)
          }
        }, 100)
      }
    },
  ],
},
```

### Pattern 2: ArtPieces Collection with orderable + featured

**What:** Native Payload `orderable: true` on the collection enables drag-and-drop in the admin list view using fractional indexing. A `featured` boolean field allows Anna to pin pieces. The public gallery query sorts by `featured DESC, _order ASC`.

**Example:**
```typescript
// Source: https://payloadcms.com/docs/configuration/collections
export const ArtPieces: CollectionConfig = {
  slug: 'art-pieces',
  orderable: true,          // enables drag-and-drop in admin list + _order column
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'tags', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Drawings', value: 'drawings' },
        { label: 'Paintings', value: 'paintings' },
        { label: 'Tattoo Designs', value: 'tattoo-designs' },
        { label: 'Digital Art', value: 'digital-art' },
        { label: 'Mixed Media', value: 'mixed-media' },
      ],
    },
    { name: 'medium', type: 'text', label: 'Medium / Technique' },
    { name: 'description', type: 'textarea' },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: 'Featured (pinned first)' },
  ],
}
```

### Pattern 3: Vercel Blob Storage Plugin

**What:** `@payloadcms/storage-vercel-blob` replaces local `staticDir` with Vercel Blob storage. `clientUploads: true` is required because Vercel's serverless body size limit is 4.5MB — far below the 20MB upload requirement.

**Example:**
```typescript
// Source: https://payloadcms.com/docs/upload/storage-adapters
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,   // apply to media collection
      },
      clientUploads: true,   // REQUIRED: bypass 4.5MB serverless limit
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  // ...
})
```

### Pattern 4: Custom Admin QR Code View

**What:** A React Server Component registered in `admin.components.views` with a custom path. The component generates a QR PNG server-side via the `qrcode` package, returns it as a base64 data URL, and provides a download button. The QR URL is read from SiteSettings global.

**Example:**
```typescript
// Source: https://payloadcms.com/docs/custom-components/custom-views
// payload.config.ts admin.components section:
admin: {
  components: {
    views: {
      qrCode: {
        Component: '/src/components/admin/QRCodeView#QRCodeView',
        path: '/qr-code',
      },
    },
    afterNavLinks: ['/src/components/admin/QRNavLink#QRNavLink'],
  },
},

// QRCodeView.tsx (React Server Component):
import QRCode from 'qrcode'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function QRCodeView() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  const url = settings.qrUrl || 'https://annadesign.com'

  const qrDataURL = await QRCode.toDataURL(url, {
    width: 1024,
    margin: 2,
    color: { dark: '#e0e0e0', light: '#0a0a0a' },   // graphite palette
    errorCorrectionLevel: 'H',
  })
  // Compose branded PNG with Sharp (add "Dark Arts by Anna" text using sharp composite)
  // Return rendered component with download link
}
```

### Anti-Patterns to Avoid
- **Using `req.payload.update()` in `afterChange` without setTimeout:** Creates a race condition; the original document save hasn't committed when the update runs. Use `setTimeout(fn, 100)`.
- **Setting `clientUploads: false` on Vercel:** Files over 4.5MB will fail silently or throw serverless body limit errors.
- **Adding `orderable: true` to an existing collection without running a migration:** Payload 3.x had a bug (Issue #12143) where this would error. Verify the exact Payload version (^3.79.0) supports adding orderable to existing collections — recent releases fixed this.
- **Storing blurDataURL in a non-indexed text field on the upload collection:** Keep it as a plain `text` field; it's a base64 string, not a richText or textarea.
- **Combining `prefix` + `clientUploads: true` in vercelBlobStorage:** Known bug in May 2025 (Issue #12541) — missing content-length headers. Avoid using `prefix` until confirmed fixed in 3.79+.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth / session management | Custom JWT middleware | Payload `auth: true` on Users | Payload handles cookie/session, CSRF, email verify — already in place |
| Drag-and-drop reorder | Custom DnD in React component | `orderable: true` on collection | Built-in fractional indexing; planner confirmed native in 3.x |
| Image format conversion | Manual Sharp calls in API route | `imageSizes` + `formatOptions` in upload config | Payload calls Sharp automatically on every upload; hooks fill the gaps |
| File storage | Write to `public/` on Vercel | `@payloadcms/storage-vercel-blob` | Vercel's filesystem is ephemeral — files written to disk disappear on next deploy |
| QR code PNG rendering | Canvas drawing from scratch | `qrcode` npm `toDataURL()` | Handles error correction, sizing, and data encoding — complex to hand-roll correctly |

**Key insight:** Payload's upload system handles 90% of the image pipeline automatically once `imageSizes` + `formatOptions` are configured. Hooks are surgical additions for what config can't express (blurDataURL, file size enforcement).

---

## Common Pitfalls

### Pitfall 1: afterChange timing race condition
**What goes wrong:** `req.payload.update()` called inside `afterChange` on the same document throws a foreign key or stale-read error; blur placeholder is silently not saved.
**Why it happens:** The outer `update` hasn't committed its database transaction when the hook fires. SQLite (Turso) is particularly sensitive to this.
**How to avoid:** Wrap the inner update in `setTimeout(() => {...}, 100)`. Community-verified workaround as of December 2025.
**Warning signs:** blurDataURL field is empty/null on newly uploaded images despite no thrown error.

### Pitfall 2: Vercel serverless body limit (4.5MB)
**What goes wrong:** Camera RAW or high-resolution TIFFs from Anna fail to upload in production with a cryptic 413 or function timeout error.
**Why it happens:** Vercel serverless functions have a 4.5MB request body limit. Anna's camera output will routinely exceed this.
**How to avoid:** `clientUploads: true` in `vercelBlobStorage()` config. The file goes directly from browser to Blob storage, bypassing the serverless function body.
**Warning signs:** Uploads work locally (no serverless limit) but fail in Vercel production.

### Pitfall 3: orderable migration error on existing collection
**What goes wrong:** Adding `orderable: true` to ArtPieces after the collection has existing documents throws a unique constraint or missing column error.
**Why it happens:** Payload needs to add the `_order` column and backfill fractional index values. Earlier 3.x builds had a bug (Issue #12143) that prevented this.
**How to avoid:** Add `orderable: true` from the very first migration when creating ArtPieces (Wave 1, Task 1). Do not add it retroactively if avoidable. After the schema changes, run `payload migrate` to generate and apply the migration.
**Warning signs:** `Cannot make existing collection orderable` error in console.

### Pitfall 4: Sharp TIFF support requires libvips native build
**What goes wrong:** TIFF uploads fail with "Input file is missing or of an unsupported image format" even though mimeTypes includes `image/tiff`.
**Why it happens:** Sharp's TIFF support depends on the libvips native binary built with TIFF support. In some environments (Alpine Docker, Vercel build cache) the binary may lack it.
**How to avoid:** Test TIFF upload in Vercel preview environment early. If it fails, the workaround is to reject TIFFs at the mimeType validation level and tell Anna to convert to JPEG/PNG before uploading.
**Warning signs:** TIFF-specific error vs. JPEG working fine.

### Pitfall 5: blurDataURL field must exist before the hook runs
**What goes wrong:** `afterChange` hook tries to update `blurDataURL` field but it doesn't exist on the collection schema yet — silent failure or Payload validation error.
**Why it happens:** Hook is added before the field is added to the Media collection schema and migration run.
**How to avoid:** Add the `blurDataURL` text field to the Media collection schema, run migration, then add the hook. Do it in the same Wave 1 task.

### Pitfall 6: "Dark Arts by Anna" text on QR PNG requires Sharp composite
**What goes wrong:** `qrcode` npm alone cannot render text onto the PNG. Attempting to do so results in a plain QR with no branding.
**Why it happens:** `qrcode` only produces the QR matrix as an image — no text composition API.
**How to avoid:** Use Sharp's `composite` operation to overlay a text-rendered layer. Sharp can read SVG strings as overlay buffers — render the "Dark Arts by Anna" wordmark as an SVG string, then composite it onto the QR PNG using `sharp(qrBuffer).composite([{ input: svgBuffer, ... }])`.
**Warning signs:** QR downloads as plain black/white QR matrix with no branding.

---

## Code Examples

Verified patterns from official sources and community guides:

### WebP imageSizes with quality control
```typescript
// Source: https://payloadcms.com/docs/upload/overview
imageSizes: [
  {
    name: 'gallery',
    width: 1200,
    withoutEnlargement: true,
    formatOptions: {
      format: 'webp',
      options: { quality: 75 },
    },
  },
]
```

### blurDataURL generation (afterChange hook)
```typescript
// Source: buildwithmatija.com/blog/payload-cms-base64-blur-placeholders-sharp (Dec 2025)
// Verified: community cross-referenced with Sharp docs
const blurBuffer = await sharp(inputBuffer)
  .resize(10, 10, { fit: 'inside' })
  .blur(1)
  .png({ compressionLevel: 9 })
  .toBuffer()
const blurDataURL = `data:image/png;base64,${blurBuffer.toString('base64')}`
```

### Vercel Blob plugin with clientUploads
```typescript
// Source: https://payloadcms.com/docs/upload/storage-adapters
vercelBlobStorage({
  collections: { media: true },
  clientUploads: true,
  token: process.env.BLOB_READ_WRITE_TOKEN || '',
})
```

### QR code PNG buffer for branded composition
```typescript
// Source: https://www.npmjs.com/package/qrcode
import QRCode from 'qrcode'
const qrBuffer: Buffer = await QRCode.toBuffer(url, {
  width: 1024,
  margin: 2,
  color: { dark: '#e0e0e0', light: '#0a0a0a' },
  errorCorrectionLevel: 'H',
  type: 'png',
})
// Then composite "Dark Arts by Anna" text via sharp SVG overlay
```

### orderable collection config
```typescript
// Source: https://payloadcms.com/docs/configuration/collections
export const ArtPieces: CollectionConfig = {
  slug: 'art-pieces',
  orderable: true,
  // ...
}
```

### Gallery sort: featured first, then drag order
```typescript
// Source: https://payloadcms.com/docs/queries/sort (verified)
// To query from Local API with featured first, then _order:
await payload.find({
  collection: 'art-pieces',
  sort: '-featured,_order',
  limit: 100,
})
```

### Custom admin view registration
```typescript
// Source: https://payloadcms.com/docs/custom-components/custom-views
admin: {
  components: {
    views: {
      qrCode: {
        Component: '/src/components/admin/QRCodeView#QRCodeView',
        path: '/qr-code',
      },
    },
    afterNavLinks: ['/src/components/admin/QRNavLink#QRNavLink'],
  },
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@payloadcms/plugin-cloud-storage` | `@payloadcms/storage-vercel-blob` (first-party) | Payload 3.x | Simpler config, no third-party dependency, officially maintained |
| Manual DnD plugin (`payload-plugin-collections-docs-order`) | `orderable: true` in collection config | Payload 3.x | No plugin dependency; fractional indexing built in |
| Custom Sharp hooks for every size | `imageSizes` + `formatOptions` in upload config | Payload 2.x+ | Payload handles resize/convert automatically on upload |
| Payload 2.x separate Next.js app | Payload 3.x embeds directly in Next.js App Router | 2024 | Admin components are now RSC by default; `getPayload({ config })` in server components |

**Deprecated/outdated:**
- `@payloadcms/plugin-cloud-storage`: Replaced by first-party adapters in Payload 3.x. Do not use.
- `create-payload-app` CLI: Requires TTY, unavailable in Claude Code shell (confirmed in Plan 01-01). Always scaffold manually.

---

## Open Questions

1. **Will Sharp produce ≤300KB WebP from every TIFF/JPEG at quality 75, width 1200?**
   - What we know: Quality 75 produces significantly smaller files; artwork with fine detail (graphite) compresses less efficiently than flat digital art
   - What's unclear: Whether a fixed quality setting will consistently hit ≤300KB across all piece types without a size-check feedback loop
   - Recommendation: Add a post-processing check in the `afterChange` hook — if the gallery WebP exceeds 300KB, re-run Sharp at reduced quality (step down from 75 → 65 → 55) until the size constraint is met. This is Claude's discretion per CONTEXT.md.

2. **Does Payload 3.79.0 support adding `orderable: true` to a fresh collection without migration issues?**
   - What we know: Issue #12143 was a known bug; Payload team said it would be fixed in "next release"
   - What's unclear: Whether 3.79.0 specifically includes the fix
   - Recommendation: Create ArtPieces with `orderable: true` from the start (never retroactively add). Test with `payload migrate` immediately after collection creation.

3. **Original image retention for lightbox (Claude's Discretion)**
   - What we know: The project needs a lightbox in Phase 3 (GAL-01); full-res quality matters for Anna's fine detail artwork
   - What's unclear: Whether to store full-res original + WebP gallery variant, or generate a high-quality WebP (quality 90+) as the lightbox source
   - Recommendation: Store original file as-is (Vercel Blob cost is trivial at portfolio scale), generate three variants: `gallery` (WebP 1200px q75), `lightbox` (WebP 2400px q90), `thumb` (WebP 400px q70). This avoids re-processing in Phase 3.

---

## Sources

### Primary (HIGH confidence)
- https://payloadcms.com/docs/upload/overview — imageSizes, formatOptions, Sharp integration, mimeTypes
- https://payloadcms.com/docs/configuration/collections — orderable: true, fractional indexing, collection config
- https://payloadcms.com/docs/upload/storage-adapters — @payloadcms/storage-vercel-blob configuration
- https://payloadcms.com/docs/custom-components/custom-views — admin.components.views, afterNavLinks
- https://payloadcms.com/docs/hooks/collections — afterChange, beforeOperation hook signatures
- https://www.npmjs.com/package/qrcode — QRCode.toBuffer(), toDataURL(), color options, errorCorrectionLevel
- https://www.npmjs.com/package/@payloadcms/storage-vercel-blob — clientUploads, token, collections config
- https://sharp.pixelplumbing.com/ — Sharp API (resize, format conversion, composite, blur, toBuffer)

### Secondary (MEDIUM confidence)
- https://www.buildwithmatija.com/blog/payload-cms-base64-blur-placeholders-sharp — Dec 2025 guide on afterChange blur placeholder generation; community-verified, aligns with Sharp docs
- https://payloadcms.com/community-help/github/uploaded-file-processing — file buffer access via req.file and req.payloadUploadSizes
- https://vercel.com/docs/vercel-blob/client-upload — clientUploads pattern for bypassing 4.5MB serverless limit

### Tertiary (LOW confidence — needs validation)
- GitHub Issue #12143: "Cannot make existing collection orderable" — fix status in 3.79.0 unconfirmed; treat as risk
- GitHub Issue #12541: prefix + clientUploads combination bug — avoid prefix option in initial implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages are official/first-party, installed, or widely used npm packages verified on npmjs.com
- Architecture: HIGH for Payload patterns (official docs); MEDIUM for Sharp hook patterns (community guide Dec 2025, aligns with official Sharp docs)
- Pitfalls: MEDIUM — afterChange timing and Vercel body limit are well-documented community issues; orderable bug fix status is LOW (unconfirmed for 3.79.0)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (Payload is actively releasing; re-verify storage adapter and orderable behavior if implementation is delayed)
