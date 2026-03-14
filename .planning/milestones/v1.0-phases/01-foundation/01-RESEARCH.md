# Phase 1: Foundation - Research

**Researched:** 2026-03-13
**Domain:** Next.js 16 + Payload CMS 3 + Turso/SQLite + Tailwind v4 + design system
**Confidence:** HIGH (stack is locked, all major decisions verified against current sources)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dark color palette:**
- Warm darks — deep charcoals with warm undertones (brown-blacks, dark umbers)
- Background: #1a1614 (warm charcoal), Surface: #252220 (dark umber), Border: #3d3633 (muted brown)
- Muted text: #8a7e76 (warm gray), Body text: #d4ccc4 (warm cream), Heading: #f0ebe6 (off-white)
- Single accent color: amber/gold (#c8956c primary, #d4a67d hover, #8b6b4a muted)
- No secondary accent — only artwork brings color to the page, UI stays warm neutrals + amber
- Functional colors only for error (#c05545) and success (#7a9a6e)
- Images presented frameless/edge-to-edge — the dark background IS the mat, no borders or shadows

**Typography:**
- Expressive/artistic typographic feel — this is a personal brand, not a generic portfolio
- Headings: Bodoni Moda (Google Fonts) — dramatic high-contrast serif with thick/thin strokes
- Body: DM Sans (Google Fonts) — clean geometric sans, warm character, excellent screen readability
- The pairing creates a gallery exhibition catalog feel with strong personality

**Base layout shell:**
- No persistent navigation — full immersive experience with floating menu button
- Navigation fades in contextually as user scrolls; floating nav anchors to sections
- Single-page scrolling architecture: Intro → Gallery → About → Contact all in one flow
- Smooth scroll between sections, no page transitions or route changes for main content
- Centered max-width container on desktop with dark space on sides (gallery wall effect)
- Mobile-first: artwork owns the full screen, maximum space for images

**Scaffolding approach:**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INF-02 | Site deploys on Vercel free tier with zero monthly cost | Verified: Next.js 16 + Payload 3.73+ deploy to Vercel free tier; Turso free tier covers hobby usage; Vercel Blob free tier sufficient for Phase 1 (no images uploaded yet) |
| INF-03 | Database stores art piece metadata, about content, and admin credentials | Verified: Turso LibSQL via @payloadcms/db-sqlite adapter; sqliteAdapter with url+authToken env vars; Payload manages admin credentials automatically |
| PRES-03 | Site uses a dark/moody aesthetic with WCAG-compliant contrast ratios | Verified via calculation: body text 11.32:1 (AAA pass), heading 15.17:1 (AAA pass), muted text 4.56:1 on bg (AA pass); two tokens need adjustment (see pitfalls) |
| PRES-04 | Layout is mobile-first responsive (QR code → phone is primary entry) | Tailwind v4 mobile-first by default; unprefixed utilities apply at all sizes; breakpoint prefixes (sm:, md:, lg:) apply at min-width and above |
</phase_requirements>

---

## Summary

Phase 1 establishes the complete foundation that all subsequent phases build on. The stack is Next.js 16 (current stable as of March 2026) + Payload CMS 3.79.0 + Turso (remote SQLite via LibSQL) + Tailwind CSS v4. This is a well-supported combination: Payload 3.73+ officially supports Next.js 16 including Turbopack, and the `@payloadcms/db-sqlite` adapter natively handles Turso's LibSQL protocol.

The contrast ratio analysis of the locked color palette reveals strong results overall: body text (#d4ccc4 on #1a1614) achieves 11.32:1 (AAA), headings (#f0ebe6) achieve 15.17:1 (AAA). However, two tokens need attention: muted text (#8a7e76) drops to 4.01:1 on the surface color (#252220), which fails AA 4.5:1, and the error color (#c05545) achieves only 3.96:1 on background. The planner must include token adjustment tasks for these two cases.

The scaffolding strategy (create-payload-app website template, then strip) is the correct approach: it generates a working Next.js + Payload wiring with the correct `(payload)/admin` route group, `withPayload` next.config wrapper, and TypeScript types. Stripping the template's demo collections (Posts, Pages, Categories) and replacing with the project's content model is the right move — done in payload.config.ts by replacing the `collections` array.

**Primary recommendation:** Scaffold with `pnpx create-payload-app@latest -t website`, then immediately swap the database adapter to sqliteAdapter with Turso credentials, replace collections, install Tailwind v4, and lock design tokens — in that order. Establish the Turso database (account + CLI + token) before starting the project scaffold so environment variables are ready.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.0+ | App framework, routing, RSC | Required by Payload 3 — they run as one app in /app folder |
| Payload CMS | 3.79.0 | Headless CMS + admin panel + local API | Only Next.js-native CMS; no separate server needed |
| @payloadcms/db-sqlite | 3.79.0 | SQLite/LibSQL/Turso adapter for Payload | Official adapter; handles Turso's LibSQL protocol natively |
| Tailwind CSS | 4.x (current) | Utility CSS + design token system | CSS-first @theme directive replaces tailwind.config.ts |
| @tailwindcss/postcss | 4.x | PostCSS plugin for Tailwind v4 | Required for Next.js PostCSS pipeline integration |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font | built-in | Google Font self-hosting | Use for Bodoni Moda + DM Sans; eliminates Google requests |
| @payloadcms/next | 3.79.0 | Payload's Next.js integration (withPayload) | Injected automatically by template; needed for webpack config |
| turso CLI | latest | Database provisioning | Use during setup to create DB, get URL, generate auth token |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Turso/LibSQL | Local SQLite file | Local file works for dev but doesn't survive Vercel deploys (serverless wipes local files) |
| Tailwind v4 @theme | CSS custom properties in :root | @theme creates both utility classes AND CSS variables; :root alone gives no Tailwind utilities |
| create-payload-app template | Manual wiring | Manual wiring requires understanding of Payload's app directory route groups; template is correct starting point |

**Installation (after scaffold):**
```bash
# Tailwind v4 (if not already in template)
npm install tailwindcss @tailwindcss/postcss postcss

# SQLite adapter (may already be in template — verify)
npm install @payloadcms/db-sqlite
```

---

## Architecture Patterns

### Recommended Project Structure

After stripping the website template to essentials:

```
anna-portfolio/
├── src/
│   ├── app/
│   │   ├── (payload)/
│   │   │   ├── admin/
│   │   │   │   └── [[...segments]]/
│   │   │   │       └── page.tsx       # Payload admin — do not modify
│   │   │   └── api/
│   │   │       └── [...slug]/
│   │   │           └── route.ts       # Payload REST API
│   │   ├── (frontend)/                # Public-facing pages
│   │   │   ├── page.tsx               # Home (single-page scroll root)
│   │   │   └── layout.tsx             # Frontend layout (fonts, nav shell)
│   │   ├── globals.css                # Tailwind @import + @theme tokens
│   │   └── layout.tsx                 # Root layout (html, body, fonts)
│   ├── collections/
│   │   ├── ArtPieces.ts              # Art piece collection (Phase 2+)
│   │   └── Media.ts                  # Adapted from template
│   ├── globals/
│   │   ├── AboutGlobal.ts            # About section content
│   │   └── SiteSettings.ts           # Site-wide settings
│   └── payload.config.ts             # Main Payload config
├── postcss.config.mjs
├── next.config.ts                     # Must include withPayload()
└── .env.local                         # TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, PAYLOAD_SECRET
```

### Pattern 1: Payload Config with Turso

**What:** The central payload.config.ts that wires the SQLite adapter to Turso
**When to use:** Required — this is what makes the database connection work

```typescript
// src/payload.config.ts
// Source: https://payloadcms.com/docs/database/sqlite + official guide
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    // Phase 1: Media only (stripped from template)
    // Phase 2+: ArtPieces added here
  ],
  globals: [
    // AboutGlobal, SiteSettings
  ],
  db: sqliteAdapter({
    client: {
      url: process.env.TURSO_DATABASE_URL || 'file:./payload-dev.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
```

**Key detail:** When `TURSO_DATABASE_URL` is absent, Payload falls back to a local `payload-dev.db` file — use this for local dev without Turso credentials.

### Pattern 2: Tailwind v4 Design Tokens

**What:** CSS-first design token definition replacing tailwind.config.ts
**When to use:** In `src/app/globals.css` — this is where all color tokens live

```css
/* src/app/globals.css */
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  /* Color system — warm dark palette */
  --color-bg: #1a1614;
  --color-surface: #252220;
  --color-border: #3d3633;

  /* Text */
  --color-text-heading: #f0ebe6;
  --color-text-body: #d4ccc4;
  --color-text-muted: #8a7e76;

  /* Accent — amber/gold */
  --color-accent: #c8956c;
  --color-accent-hover: #d4a67d;
  --color-accent-muted: #8b6b4a;

  /* Functional */
  --color-error: #c05545;
  --color-success: #7a9a6e;

  /* Typography */
  --font-heading: var(--font-bodoni-moda), Georgia, serif;
  --font-body: var(--font-dm-sans), system-ui, sans-serif;
}
```

Classes generated: `bg-bg`, `bg-surface`, `text-text-heading`, `text-accent`, etc.

### Pattern 3: Google Fonts via next/font with CSS Variables

**What:** Self-hosted Google Fonts connected to Tailwind @theme via CSS custom properties
**When to use:** In `src/app/layout.tsx` — root layout applies fonts globally

```typescript
// src/app/layout.tsx
// Source: https://nextjs.org/docs/app/getting-started/fonts (version 16.1.6, 2026-02-27)
import { Bodoni_Moda, DM_Sans } from 'next/font/google'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni-moda',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  // DM Sans is a variable font — weight range, not array
  variable: '--font-dm-sans',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text-body font-body">
        {children}
      </body>
    </html>
  )
}
```

**Key detail:** Use `variable` prop (not `className`) so the CSS custom property is set on `<html>`. Then reference it in the Tailwind `@theme` block as `var(--font-bodoni-moda)`.

### Pattern 4: next.config.ts with withPayload

**What:** Required wrapper that injects Payload's webpack configuration
**When to use:** Always — without this, the admin panel won't load

```typescript
// next.config.ts
// Source: Payload website template
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // your Next.js config
}

export default withPayload(nextConfig)
```

**Note:** With Payload 3.73+ and Next.js 16.2+, Turbopack is supported. The `withPayload` wrapper no longer unconditionally injects webpack config — this was the blocker fixed in 3.73.0.

### Anti-Patterns to Avoid

- **Skipping withPayload wrapper:** The admin panel will fail silently or show blank screens
- **Using :root instead of @theme for color tokens:** :root gives CSS variables but no Tailwind utility classes (bg-accent won't work)
- **Putting font className on html instead of variable:** Tailwind @theme can't reference a className — you need the CSS variable via the `variable` prop
- **Running migrations manually in development:** Leave `push: true` (the default) for dev — it auto-syncs schema. Only create migrations explicitly before production deploys
- **Committing PAYLOAD_SECRET to git:** Generate a strong random secret per environment; never reuse dev value in production

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark/light mode toggle | Custom CSS class switcher | Tailwind v4 `@variant dark` or CSS `color-scheme` | System preference handling, flash-of-wrong-theme, persistence all handled |
| Font loading optimization | Manual @font-face | next/font Google Fonts | Automatic self-hosting, zero layout shift (size-adjust), no Google ping |
| Admin authentication | Custom auth middleware | Payload's built-in admin user system | Sessions, password hashing, reset flow all included |
| Database schema migrations | Custom SQL scripts | Payload's migration system (`payload migrate`) | Drizzle-backed, tracks state, handles Turso remote schema sync |
| Contrast ratio calculation | Manual math | webaim.org/resources/contrastchecker/ or programmatic WCAG formula | Error-prone; required for PRES-03 verification step |
| Mobile viewport overflow detection | Manual CSS debugging | Browser DevTools 375px emulation | Faster than real device for initial verification |

**Key insight:** The Payload template gives you a working admin, auth, API, and migration system for free. Resist the urge to customize the `/admin` route group or the API route — those are auto-managed by Payload.

---

## Common Pitfalls

### Pitfall 1: Muted Text Fails AA on Surface Color

**What goes wrong:** PRES-03 requires WCAG-compliant contrast. The locked muted text token #8a7e76 achieves 4.56:1 on the primary background #1a1614 (passes AA at exactly the threshold) but drops to 4.01:1 on the surface color #252220 (fails AA 4.5:1 minimum).

**Why it happens:** Surface is slightly lighter than background. The same text color that passes on background can fail on surface. This matters because muted text (metadata, timestamps, captions) will appear on surface-colored cards.

**How to avoid:** Either (a) lighten muted text slightly when placed on surface (e.g., use #9a8e86 which achieves ~4.8:1 on surface), or (b) restrict muted text to background-colored contexts only. Document this as a token constraint.

**Warning signs:** Any text labeled "muted" or "secondary" appearing inside a card/panel component.

### Pitfall 2: Error Color Fails WCAG AA

**What goes wrong:** #c05545 (locked error color) achieves only 3.96:1 on #1a1614 — below the 4.5:1 AA minimum for body-size text.

**Why it happens:** Red tones lose contrast on very dark warm backgrounds. The relative luminance of #c05545 is moderate (~0.109), not sufficient against near-black.

**How to avoid:** Use error color only for decorative/icon use (which requires only 3:1 for graphical elements) or adjust to #d45e4d (~4.7:1 on bg). Flag this as needing verification before use in body text contexts.

**Warning signs:** Error messages rendered as body-size red text (not icon + text combinations).

### Pitfall 3: Payload 3.73+ / Next.js 16 Version Pinning

**What goes wrong:** Payload requires Next.js >16.1.1-canary.35 OR 16.2.0+ for full compatibility. The stable 16.1.x releases are NOT supported (the Turbopack HMR fix wasn't in the non-canary 16.1 branch).

**Why it happens:** The withPayload webpack injection conflicted with Turbopack until Next.js 16.2.0 released the fix.

**How to avoid:** Pin `"next": ">=16.2.0"` in package.json. The `create-payload-app` template should handle this, but verify after scaffolding.

**Warning signs:** Turbopack dev server errors, blank admin panel, or module resolution failures on first `npm run dev`.

### Pitfall 4: Tailwind v4 Installed in Payload Template May Conflict

**What goes wrong:** The `create-payload-app --template website` may include Tailwind v3 (the template was originally built with v3). Upgrading to v4 requires removing `tailwind.config.ts`, converting class configs to `@theme`, and updating the PostCSS config.

**Why it happens:** Template ships with the version current at publish time; v4 is a major change requiring manual migration steps.

**How to avoid:** After scaffolding, check the installed Tailwind version. If v3: run `npx @tailwindcss/upgrade`, then verify the postcss.config.mjs uses `@tailwindcss/postcss` not the old `tailwindcss` plugin. The context states Tailwind CSS 4 is the target — this migration may need a dedicated task.

**Warning signs:** `tailwind.config.ts` or `tailwind.config.js` present after scaffolding = you have v3.

### Pitfall 5: Turso Auth Token Scope

**What goes wrong:** Turso tokens can be scoped to a single database or to the full organization. Using a full-org token in production is a security risk.

**Why it happens:** The default `turso db tokens create <db>` command creates a read-write token. Teams sometimes use broader tokens out of convenience.

**How to avoid:** Create the token with `turso db tokens create <database-name>` (scoped to the specific database). For production on Vercel, use a read-write token; Payload needs write access for migrations and content creation.

**Warning signs:** Token created via `turso token create` (org-level) instead of `turso db tokens create <db>` (db-level).

### Pitfall 6: PAYLOAD_SECRET Must Be Strong and Unique Per Environment

**What goes wrong:** Using a weak or shared secret breaks Payload's session security. The template may include a placeholder.

**Why it happens:** Developers copy dev env vars to production.

**How to avoid:** Generate with `openssl rand -base64 32` — create separate values for local `.env.local` and Vercel environment variables. Never commit either to git.

---

## Code Examples

### Turso Database Provisioning (CLI commands)

```bash
# Source: https://payloadcms.com/posts/guides/how-to-set-up-payload-with-sqlite-and-turso-for-deployment-on-vercel
# 1. Install Turso CLI
brew install tursodatabase/tap/turso  # macOS
# Or: curl -sSfL https://get.tur.so/install.sh | bash

# 2. Authenticate
turso auth login  # Opens browser, GitHub or email

# 3. Create database
turso db create anna-portfolio

# 4. Get connection URL
turso db show --url anna-portfolio
# Output: libsql://anna-portfolio-<org>.turso.io

# 5. Create auth token
turso db tokens create anna-portfolio
# Copy the token — only shown once
```

### Environment Variables

```bash
# .env.local (local development — never commit)
TURSO_DATABASE_URL=libsql://anna-portfolio-<org>.turso.io
TURSO_AUTH_TOKEN=<token-from-step-5>
PAYLOAD_SECRET=<openssl-rand-base64-32-output>

# For local dev without Turso: omit TURSO_DATABASE_URL
# Payload falls back to file:./payload-dev.db automatically
```

### Verified Contrast Ratios (Calculated 2026-03-13)

| Token | Hex | On #1a1614 (bg) | On #252220 (surface) | WCAG Result |
|-------|-----|-----------------|----------------------|-------------|
| Heading | #f0ebe6 | 15.17:1 | 13.35:1 | AAA PASS |
| Body text | #d4ccc4 | 11.32:1 | 9.96:1 | AAA PASS |
| Muted text | #8a7e76 | 4.56:1 | 4.01:1 | AA on bg, FAIL on surface |
| Accent primary | #c8956c | 6.82:1 | 6.00:1 | AA PASS (both) |
| Accent hover | #d4a67d | 8.17:1 | 7.19:1 | AAA PASS |
| Accent muted | #8b6b4a | 3.68:1 | 3.24:1 | Decorative only |
| Error | #c05545 | 3.96:1 | 3.49:1 | Icon/graphic use only (3:1) |
| Success | #7a9a6e | 5.71:1 | 5.03:1 | AA PASS (both) |

**Action required:** Muted text on surface fails AA. Error color fails AA for body text. Adjust or restrict usage.

### Scaffolding Command

```bash
# Source: https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app
pnpx create-payload-app@latest -t website
# When prompted: project name, select pnpm or npm, confirm Next.js 16.2+
```

### Stripping Template Collections

```typescript
// src/payload.config.ts — after scaffolding, replace collections array
// Remove: Pages, Posts, Categories, Users (or keep Users for auth)
// Replace with project collections:

import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
// Note: Media collection often kept/adapted from template

export default buildConfig({
  collections: [
    // Media — adapted from template (keep upload handling)
    // ArtPieces — added in Phase 2
  ],
  globals: [
    // AboutGlobal
    // SiteSettings
  ],
  // ... rest of config
})
```

### PostCSS Config for Tailwind v4

```javascript
// postcss.config.mjs
// Source: https://tailwindcss.com/docs/guides/nextjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.ts` for design tokens | `@theme {}` in globals.css | Tailwind v4 (Jan 2025) | No JS config file; CSS-first; tokens auto-generate utilities AND CSS variables |
| Payload on separate Node server | Payload runs inside Next.js `/app` folder | Payload 3.0 (late 2024) | One deployment, one codebase, local API (no HTTP overhead) |
| Next.js 15 + Payload | Next.js 16 + Payload 3.73+ | March 2026 | Turbopack support; 5-10x faster dev builds |
| `@payloadcms/bundler-webpack` explicit config | `withPayload()` wrapper in next.config.ts | Payload 3.x | withPayload injects what's needed; no manual bundler config |
| Manual Google Font @font-face | `next/font/google` with `variable` prop | Next.js 13+ | Self-hosted at build time, no Google ping, zero layout shift |

**Deprecated/outdated:**
- `tailwind.config.js/ts`: Not needed in Tailwind v4. Remove if present after template scaffold.
- Payload 2.x (Express-based): Completely replaced by Next.js-native Payload 3. Do not reference Payload 2 docs.
- `@tailwindcss/typography` v3 plugin: v4 has CSS-based approach; if needed, verify v4 compatibility before installing.

---

## Open Questions

1. **Does the `create-payload-app --template website` scaffold with Tailwind v4 or v3 as of March 2026?**
   - What we know: Template is actively maintained; STATE.md notes "Tailwind CSS 4" as a target
   - What's unclear: The exact template version at scaffold time
   - Recommendation: After scaffolding, immediately check package.json for `"tailwindcss"` version. If `^3.x`, add a Wave 0 task for the Tailwind v4 upgrade before any other work.

2. **Payload admin on Vercel free tier — cold start user experience?**
   - What we know: Serverless functions on Vercel free tier have cold starts; Payload admin requires Payload to boot
   - What's unclear: Whether the Phase 1 success criterion (admin accessible at /admin) will be slow on first visit
   - Recommendation: Cold starts are acceptable for Phase 1 verification. Document for Anna that first admin load may be slow (10-20s). Not a blocker.

3. **Bodoni Moda variable font availability?**
   - What we know: Bodoni Moda is listed on Google Fonts; next/font/google supports it
   - What's unclear: Whether Bodoni Moda has a variable font axis (weight axis) or requires explicit weight enumeration
   - Recommendation: If not variable, use `weight: ['400', '500', '600', '700', '800', '900']` with `style: ['normal', 'italic']`. The code example above uses explicit weights as the safe default.

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/getting-started/fonts — next/font Google Fonts setup, variable prop, App Router pattern (version 16.1.6, fetched 2026-02-27)
- https://tailwindcss.com/docs/theme — @theme directive, design token syntax, color/font/spacing namespaces
- https://payloadcms.com/docs/database/sqlite — sqliteAdapter config, Turso/LibSQL support, push:true dev behavior
- https://payloadcms.com/posts/guides/how-to-set-up-payload-with-sqlite-and-turso-for-deployment-on-vercel — step-by-step Turso setup with Vercel
- Contrast ratio calculations — computed directly using WCAG 2.x relative luminance formula (2026-03-13)

### Secondary (MEDIUM confidence)
- https://payloadcms.com/posts/blog/payload-cms-nextjs-16-compatibility-breakthrough — Payload 3.73+ / Next.js 16 compatibility details (via buildwithmatija.com, cross-referenced with GitHub issue #14354)
- https://tailwindcss.com/blog/tailwindcss-v4 — v4 release, CSS-first config, @tailwindcss/postcss (official blog)
- https://tailwindcms.com/docs/guides/nextjs — PostCSS setup for Next.js (official docs)
- https://github.com/payloadcms/payload/discussions/14330 — Next.js 16 Turbopack support discussion confirming 3.73.0 fix
- https://www.npmjs.com/package/payload — current version 3.79.0 confirmed (March 2026)

### Tertiary (LOW confidence)
- Community reports of cold start behavior on Vercel free tier — not officially benchmarked, experience may vary

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm, official docs, and recent community confirmation
- Architecture: HIGH — patterns derived from official Payload docs, Next.js docs, and Tailwind v4 official docs
- Contrast ratios: HIGH — computed programmatically using WCAG 2.x formula against locked hex values
- Pitfalls: MEDIUM-HIGH — some from official GitHub issues (verified), one from community reports (flagged LOW)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (Payload and Next.js are actively releasing; recheck if > 30 days before implementation)
