# Stack Research

**Domain:** Artist portfolio web app with admin CMS, image management, QR code generation
**Researched:** 2026-03-13
**Confidence:** HIGH (core stack verified via official sources and cross-referenced searches)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (latest stable) | Full-stack React framework | App Router gives you React Server Components, API routes, and image optimization in one package. Vercel's free Hobby tier deploys Next.js with zero config — no separate backend needed. The official Payload CMS template ships as a Next.js app. |
| TypeScript | 5.x (bundled with Next.js) | Type safety across frontend and backend | Payload CMS generates types from your schema automatically, making the admin panel and API type-safe without manual work. Errors caught at compile time, not runtime. |
| Tailwind CSS | 4.x (stable since Jan 2025) | Styling | v4 removes the `tailwind.config.js` file entirely — configure via CSS. 5x faster full builds, 100x faster incremental. Dark/moody aesthetic is straightforward with Tailwind's dark mode and arbitrary color values. No JS overhead at runtime. |
| Payload CMS | 3.x (current) | Admin panel + content API | Runs inside your Next.js app — no separate service. Schema defined in code generates TypeScript types and a full admin UI. Supports Vercel Blob for media storage. Single-user password auth is trivial to configure. Free because you self-host. Far simpler than a custom-built admin panel. |
| Vercel | Hobby plan (free) | Hosting + CDN + image optimization | One-click deploy from GitHub. Built-in edge CDN, automatic SSL, and image optimization via `next/image`. 1 GB Blob storage + 10 GB transfer/month free. The only host where Next.js is a first-class citizen. |

### Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel Postgres (Neon) | Managed, serverless | Store art piece metadata, admin credentials | Free hobby tier on Vercel. Payload CMS has a first-class Postgres adapter. Serverless Neon scales to zero — no idle cost. For a portfolio with one admin user and ~50-200 art pieces, Postgres is massive overkill in terms of scale but the right choice for Payload's relational content model. |

**Alternative**: If you want to avoid any database complexity, Payload also supports **SQLite via Turso** (remote SQLite, free tier: 500 databases, 9 GB storage). Turso is simpler to reason about for a solo project with no concurrent writes. Use Postgres if you anticipate needing to query/filter complex relationships; use Turso/SQLite if you want maximum simplicity.

**Recommendation**: Start with Turso (SQLite) for this project. No connection pooling to configure, no separate Postgres service, and the content model is simple enough that SQLite handles it trivially.

### Media Storage

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel Blob | Managed (free Hobby: 1 GB storage, 10 GB transfer/month) | Image file storage | Integrated directly with Vercel and Payload CMS. `next/image` can transform Blob-stored images automatically (resize, AVIF/WebP conversion). No separate Cloudinary account to manage. For a tattoo portfolio with ~50-200 images, 1 GB is ample. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-qr-code` | 2.0.18 | Render a QR code as an SVG React component | Use in the admin panel to display and download a QR code pointing to the live site URL. SVG output is infinitely scalable and printable — perfect for stickers, cards, prints. |
| `framer-motion` | 11.x | Page transitions, gallery animations, intro sequence | Use for the dark/moody animated intro and gallery reveal animations. React-native API integrates cleanly with Next.js App Router. Use for UI-level motion (entrance animations, hover effects, page transitions). |
| `react-hook-form` | 7.x | Form state management | Use for the contact form and admin login form. Minimal re-renders, excellent performance, TypeScript-first. Pairs with Zod for validation. |
| `zod` | 3.x | Schema validation | Use to validate contact form submissions on both client and server (Next.js Server Actions). Also validates admin form inputs. Generates TypeScript types from schemas. |
| `resend` | latest | Transactional email (contact form notifications) | Free tier: 3,000 emails/month, 100/day. Developer-friendly API. Integrates with Next.js Server Actions in ~10 lines of code. Resend is the de facto standard for Next.js transactional email in 2025-2026. |
| `next-auth` (Auth.js) | 5.x (v5 beta stable) | Admin session authentication | Credentials provider with bcrypt-hashed password in `.env`. Single-user, session-based auth — exactly what's needed for a solo admin panel. No database user table required. |
| `sharp` | 0.33.x | Server-side image processing | Automatically used by `next/image` when self-hosting. Required for Vercel serverless image optimization. Install as a prod dependency to avoid warnings. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint (bundled with Next.js) | Linting | Use `next/core-web-vitals` config. Catches performance anti-patterns specific to Next.js. |
| Prettier | Code formatting | Configure once, forget about it. Add `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. |
| Husky + lint-staged | Pre-commit hooks | Run ESLint + Prettier on staged files only. Keeps CI clean. |
| Turbopack (bundled with Next.js 16) | Dev server bundler | Default in Next.js 16. File system caching makes cold starts near-instant. No config needed. |

---

## Installation

```bash
# Scaffold a new Payload + Next.js project (official Vercel template)
npx create-payload-app@latest --template website

# Or create from scratch
npx create-next-app@latest anna-portfolio --typescript --tailwind --app

# Core dependencies (after project creation)
npm install payload @payloadcms/next @payloadcms/db-sqlite @payloadcms/storage-vercel-blob

# Supporting libraries
npm install framer-motion react-hook-form zod react-qr-code resend next-auth sharp

# Tailwind v4 (if not installed by create-next-app)
npm install tailwindcss @tailwindcss/postcss

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss husky lint-staged
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Payload CMS | Custom-built admin panel | If you want absolute UI control and don't mind building CRUD interfaces from scratch. Not recommended — Payload gives you a polished admin UI free. |
| Payload CMS | Sanity CMS | If you need real-time collaboration, a hosted CDN for assets, or a non-developer editor experience. For a solo user, Sanity's hosted pricing is unnecessary overhead. |
| Payload CMS | Contentful / Strapi | Contentful has a free tier but is hosted/proprietary. Strapi works but has a heavier Docker/VPS deployment story. Neither integrates as cleanly with Next.js as Payload does. |
| Vercel Blob | Cloudinary | Cloudinary's free tier (25 credits/month) is less transparent about limits than Vercel Blob's 1 GB/10 GB. Cloudinary adds a separate service account to manage. For a simple portfolio, Vercel Blob + `next/image` handles all needed transformations. |
| Framer Motion | GSAP | Choose GSAP if the animated intro needs complex timeline sequences, scroll-driven effects, or SVG morphing. Framer Motion is sufficient for entrance animations and page transitions. GSAP adds ~23 KB gzip but is more powerful for cinematic sequences. |
| Resend | Nodemailer + SMTP | Nodemailer requires managing your own SMTP credentials (Gmail app passwords, etc.). Resend provides a cleaner API, better deliverability, and a developer dashboard. No reason to use Nodemailer for a new project in 2026. |
| Vercel (free Hobby) | Netlify | Netlify's free tier is comparable but Next.js support is less seamless (requires `@netlify/plugin-nextjs`). Vercel is the canonical Next.js host — use it. |
| Turso (SQLite) | Vercel Postgres (Neon) | Use Postgres if the content model grows relational complexity: multi-artist, multi-gallery sites with many-to-many tag relationships and complex queries. Overkill for a single-artist portfolio. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| WordPress | Requires PHP hosting (can't use Vercel free tier effectively), heavyweight for a portfolio, security surface area from plugins, admin UI is bloated for a single user | Payload CMS on Next.js |
| Gatsby | Static site generation mindset conflicts with admin-managed dynamic content. Slower dev experience. Community significantly smaller than Next.js in 2026. | Next.js 16 with Payload |
| Create React App (CRA) | Officially unmaintained. No SSR, no image optimization, no API routes. | Next.js |
| Firebase / Firestore | NoSQL doesn't match Payload's relational content model. Vendor lock-in to Google's ecosystem. Free tier limits are easy to exceed with image-heavy traffic. | Vercel Blob + Turso |
| Prisma (standalone) | Payload CMS already handles your ORM layer with its own database adapter. Adding Prisma creates a competing abstraction — you'd manage two schemas. | Payload's built-in db adapters |
| Chakra UI / MUI | Full component libraries add significant bundle weight and style constraints that fight against a custom dark/moody aesthetic. shadcn/ui (if needed) copies components into your project with zero runtime dependency. | Tailwind CSS + shadcn/ui (selectively) |
| react-qr-code > server-side QR generation | For an admin panel that just displays a QR code to download, a React component is simpler. Don't over-engineer this into a server-side API endpoint. | `react-qr-code` component |

---

## Stack Patterns by Variant

**If the animated intro needs to be cinematic (complex timeline, scroll-driven, SVG morphing):**
- Add GSAP (`npm install gsap`) alongside Framer Motion
- Use GSAP specifically for the intro sequence timeline
- Keep Framer Motion for page transitions and gallery reveals
- GSAP's `ScrollTrigger` plugin handles scroll-driven gallery reveals elegantly

**If Vercel Blob 1 GB free tier gets exhausted:**
- Upgrade to Cloudinary free (25 credits/month, generous for images) or Cloudinary's $99/year starter
- Swap `@payloadcms/storage-vercel-blob` for `@payloadcms/storage-cloud-storage` with Cloudinary adapter
- No schema changes required — Payload's storage adapters are interchangeable

**If the admin panel needs a richer UI (drag-to-reorder gallery, bulk edit):**
- Add `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop gallery ordering
- Payload supports custom admin components — inject the drag UI into the collection list view

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Payload 3.x | Next.js 15.x / 16.x | Payload 3 is built on Next.js App Router. Requires Next.js 15+. |
| Tailwind CSS 4.x | PostCSS 8.x | v4 requires `@tailwindcss/postcss` instead of `tailwindcss` as PostCSS plugin. Next.js 16 configures this automatically if Tailwind is selected at project creation. |
| Auth.js (next-auth) 5.x | Next.js 15+ App Router | v5 is the current recommended version for App Router. v4 has a separate config pattern — do not mix. |
| Framer Motion 11.x | React 18+ / React 19 | React 19 (shipped with Next.js 16) is fully supported in Framer Motion 11. |
| sharp 0.33.x | Node.js 18+ | Vercel's serverless functions run Node.js 18+. Required peer dependency for `next/image` server-side optimization. |

---

## Sources

- [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5) — confirmed Next.js 16 released Oct 2025, 16.1 Dec 2025 (MEDIUM confidence, search-verified)
- [Tailwind CSS v4.0 official announcement](https://tailwindcss.com/blog/tailwindcss-v4) — stable release Jan 22, 2025 (HIGH confidence, official source)
- [Payload CMS — How to set up with SQLite and Turso](https://payloadcms.com/posts/guides/how-to-set-up-payload-with-sqlite-and-turso-for-deployment-on-vercel) — official Payload guide (HIGH confidence)
- [Payload CMS Vercel Website Starter Template](https://vercel.com/templates/next.js/payload-website-starter) — official Vercel template (HIGH confidence)
- [Vercel Blob Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) — 1 GB storage + 10 GB transfer free on Hobby (HIGH confidence)
- [Resend Pricing](https://resend.com/pricing) — 3,000 emails/month free (HIGH confidence, official source)
- [react-qr-code npm](https://www.npmjs.com/package/react-qr-code) — v2.0.18, SVG output (MEDIUM confidence, search-verified)
- [shadcn/ui Changelog March 2026](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — CLI v4 released March 2026 (HIGH confidence, official source)
- [Payload vs Sanity technical comparison](https://www.reactlibraries.com/blog/payload-cms-vs-sanity-for-next-js-15-a-technical-comparison) — sub-10ms vs 50-150ms query time difference (MEDIUM confidence, single source)
- [Framer Motion vs Motion (GSAP comparison)](https://motion.dev/docs/gsap-vs-motion) — performance benchmarks (MEDIUM confidence, source is Motion/Framer's own docs)

---

*Stack research for: tattoo artist portfolio web app with admin CMS, image gallery, QR code generation*
*Researched: 2026-03-13*
