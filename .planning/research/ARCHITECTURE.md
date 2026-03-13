# Architecture Research

**Domain:** Artist portfolio web app with admin panel (single user)
**Researched:** 2026-03-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
├──────────────────────────┬──────────────────────────────────┤
│   Public Pages           │   Admin Pages (/admin/*)         │
│  ┌────────┐ ┌─────────┐  │  ┌──────────┐  ┌────────────┐   │
│  │ Intro  │ │ Gallery │  │  │  Login   │  │ Dashboard  │   │
│  └────────┘ └─────────┘  │  └──────────┘  └────────────┘   │
│  ┌────────┐ ┌─────────┐  │  ┌──────────┐  ┌────────────┐   │
│  │ About  │ │Contact  │  │  │Art CRUD  │  │About Edit  │   │
│  └────────┘ └─────────┘  │  └──────────┘  └────────────┘   │
├──────────────────────────┴──────────────────────────────────┤
│               Next.js App Router (Server Layer)              │
│  ┌──────────────────┐  ┌───────────────────────────────┐    │
│  │  Middleware.ts   │  │       Server Actions           │    │
│  │  (Auth guard on  │  │  (CRUD, email, image upload)   │    │
│  │  /admin/* routes)│  └───────────────────────────────┘    │
│  └──────────────────┘                                        │
├─────────────────────────────────────────────────────────────┤
│                     Data / Services Layer                     │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Postgres  │  │  Cloudinary  │  │  Resend (Email)     │  │
│  │  (Neon /   │  │  (Image CDN  │  │  (Contact form)     │  │
│  │  Supabase) │  │   + upload)  │  └─────────────────────┘  │
│  └────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Animated Intro | Full-screen dark landing, transitions to gallery | Client Component, Framer Motion AnimatePresence |
| Gallery Page | Display art grid with category/tag filtering | Server Component (fetch) + Client Component (filter state) |
| Art Piece Card | Individual artwork display (image, title, tags) | Server or Client Component |
| About Page | Bio, photo, story — static-ish content | Server Component, editable via admin |
| Contact Form | Collect name/email/message, send email | Client Component (form state) + Server Action (send email) |
| QR Code Display | Render QR linking to the site URL | Client Component (qrcode.react renders to canvas/SVG) |
| Admin Login | Password form, sets secure HttpOnly cookie | Client Component form + Server Action auth |
| Admin Dashboard | Navigation hub for all admin tasks | Server Component (auth-gated) |
| Art CRUD Panel | Add/edit/delete pieces, upload images | Client Component (form state) + Server Actions |
| About Editor | Edit bio copy and photo | Client Component (form) + Server Action |
| middleware.ts | Block unauthenticated access to /admin/* | Edge middleware, reads session cookie |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Intro page (animated entry)
│   ├── layout.tsx                # Root layout (fonts, global providers)
│   ├── gallery/
│   │   └── page.tsx              # Gallery with filter UI
│   ├── about/
│   │   └── page.tsx              # About / bio page
│   ├── contact/
│   │   └── page.tsx              # Contact form page
│   ├── qr/
│   │   └── page.tsx              # QR code display/download page
│   └── admin/
│       ├── layout.tsx            # Admin shell (auth check wrapper)
│       ├── page.tsx              # Admin dashboard
│       ├── login/
│       │   └── page.tsx          # Login form
│       ├── art/
│       │   ├── page.tsx          # Art pieces list
│       │   ├── new/page.tsx      # Add new piece
│       │   └── [id]/page.tsx     # Edit existing piece
│       └── about/
│           └── page.tsx          # Edit about/bio section
├── components/
│   ├── gallery/
│   │   ├── GalleryGrid.tsx       # Masonry/grid layout
│   │   ├── ArtCard.tsx           # Individual piece card
│   │   └── FilterBar.tsx         # Category/tag filter UI
│   ├── intro/
│   │   └── AnimatedIntro.tsx     # Dark animated landing
│   ├── admin/
│   │   ├── ImageUpload.tsx       # Drag-drop upload UI
│   │   ├── ArtForm.tsx           # Add/edit artwork form
│   │   └── AboutForm.tsx         # Edit bio form
│   ├── contact/
│   │   └── ContactForm.tsx       # Public contact form
│   └── ui/                       # Shared primitives (buttons, inputs)
├── lib/
│   ├── actions/                  # Server Actions
│   │   ├── art.ts                # CRUD for art pieces
│   │   ├── about.ts              # Update about section
│   │   ├── contact.ts            # Send contact email
│   │   └── auth.ts               # Login / logout
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   └── index.ts              # DB client
│   ├── auth.ts                   # Session validation helper
│   └── cloudinary.ts             # Cloudinary upload helpers
├── middleware.ts                 # Route protection for /admin/*
└── public/
    └── og-image.jpg              # Open Graph image for sharing
```

### Structure Rationale

- **app/admin/:** Collocated admin routes under a single prefix, making middleware matching trivial (`/admin/:path*`)
- **lib/actions/:** All Server Actions in one place, separated by domain — easy to audit for auth checks
- **lib/db/:** Drizzle schema co-located with the client so types are always in sync
- **components/gallery/ vs components/admin/:** Hard separation prevents accidentally importing admin UI into public pages
- **middleware.ts at root:** Next.js requires this at the project root for App Router edge middleware

## Architectural Patterns

### Pattern 1: Server Components for Data Fetching, Client Components for Interactivity

**What:** Gallery pages and admin lists use Server Components to fetch data directly from the database. Filter UI, forms, and animations are Client Components.
**When to use:** Always — this is the Next.js App Router default model.
**Trade-offs:** Server Components cannot use hooks or browser APIs; Client Components add JavaScript to the bundle. Keep the split clean.

**Example:**
```typescript
// app/gallery/page.tsx — Server Component, fetches at request time
import { db } from '@/lib/db'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'

export default async function GalleryPage() {
  const pieces = await db.query.artPieces.findMany({ orderBy: desc(artPieces.createdAt) })
  return <GalleryGrid initialPieces={pieces} />
}

// components/gallery/GalleryGrid.tsx — Client Component owns filter state
'use client'
export function GalleryGrid({ initialPieces }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const filtered = activeTag
    ? initialPieces.filter(p => p.tags.includes(activeTag))
    : initialPieces
  // render...
}
```

### Pattern 2: Server Actions for All Mutations

**What:** Every write operation (create/update/delete art, update about, send email, authenticate) is a Server Action marked with `'use server'`.
**When to use:** All form submissions and admin operations. No dedicated API routes needed.
**Trade-offs:** Built-in CSRF protection; no separate API layer to maintain. Slightly harder to test than REST endpoints.

**Example:**
```typescript
// lib/actions/art.ts
'use server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function createArtPiece(formData: FormData) {
  await requireAuth()  // always verify, never trust middleware alone
  const title = formData.get('title') as string
  // validate, upload image, insert to db...
}
```

### Pattern 3: Middleware for Route Guard + Per-Action Auth Verification

**What:** `middleware.ts` redirects unauthenticated users away from `/admin/*` to the login page. Each Server Action also independently re-checks auth.
**When to use:** This dual-layer is mandatory — CVE-2025-29927 proved that middleware alone can be bypassed. Defense in depth.
**Trade-offs:** Slightly redundant code, but protects against middleware bypass attacks.

**Example:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await getSession(request)
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
```

### Pattern 4: Animated Intro as a Gating Component

**What:** The root page (`/`) renders a full-screen animated intro. After the animation completes (or user skips), it transitions to the gallery. Use `AnimatePresence` from Framer Motion with state to control visibility.
**When to use:** The intro is the emotional hook — it must render fast. Keep it pure CSS/Framer Motion with no data fetching.
**Trade-offs:** Adds client-side JavaScript to the initial route. Worth it for the visual impact. Use `sessionStorage` to skip the intro on return visits.

## Data Flow

### Public Gallery Request Flow

```
User scans QR code → browser loads /
    ↓
Root page (Server Component) renders AnimatedIntro
    ↓
AnimatedIntro plays (client-side, Framer Motion)
    ↓
User interaction or timeout → navigate to /gallery
    ↓
Gallery Server Component fetches art pieces from Postgres
    ↓
GalleryGrid (Client Component) receives pieces as props
    ↓
User clicks tag filter → client-side state update, no network call
    ↓
Filtered art renders from in-memory array
```

### Admin Art Upload Flow

```
Admin fills ArtForm → selects image file
    ↓
Client uploads image directly to Cloudinary (unsigned preset)
    ↓
Cloudinary returns { public_id, secure_url }
    ↓
Client submits form with metadata + Cloudinary URL
    ↓
Server Action: requireAuth() check
    ↓
Server Action: validate fields with Zod
    ↓
Server Action: insert row into Postgres (title, medium, tags, cloudinary_url)
    ↓
revalidatePath('/gallery') clears Next.js cache
    ↓
Admin sees updated list
```

### Contact Form Flow

```
Visitor fills ContactForm → submits
    ↓
Client Component calls Server Action (contact.ts)
    ↓
Server Action: validate with Zod (name, email, message)
    ↓
Server Action: Resend API sends email to Anna's address
    ↓
Returns success/error state to client
    ↓
Form shows confirmation message (no page reload)
```

### Authentication Flow

```
Admin navigates to /admin/*
    ↓
middleware.ts reads session cookie
    → No valid session → redirect to /admin/login
    → Valid session → pass through
    ↓
/admin/login: Admin submits password
    ↓
Server Action auth.ts: compare against ADMIN_PASSWORD env var (bcrypt or direct compare)
    ↓
Create signed JWT → set as HttpOnly, Secure, SameSite=Strict cookie
    ↓
Redirect to /admin dashboard
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k visitors/month | Current architecture is fine. Vercel free tier handles this comfortably. |
| 1k-100k visitors/month | Postgres connection pooling (PgBouncer via Neon/Supabase already included). Consider image CDN caching headers. |
| 100k+ visitors/month | Vercel Pro tier or migrate to self-hosted. Unlikely for a personal portfolio. |

### Scaling Priorities

1. **First bottleneck: Images.** Cloudinary handles resize/format/CDN. Using `next/image` with a Cloudinary loader passes through Cloudinary's CDN, not Vercel's image optimization quota.
2. **Second bottleneck: Database connections.** Neon and Supabase both include connection pooling on free tiers. Not an issue at portfolio scale.

## Anti-Patterns

### Anti-Pattern 1: Using API Routes Instead of Server Actions

**What people do:** Create `app/api/pieces/route.ts` for every CRUD operation, then fetch from client components.
**Why it's wrong:** Adds unnecessary network round-trips, requires manual CSRF handling, duplicates auth logic. Server Actions handle all of this natively in Next.js 14+.
**Do this instead:** Use `'use server'` functions called directly from components or forms.

### Anti-Pattern 2: Uploading Images Through the Next.js Server

**What people do:** Stream the image file through a Server Action or API route to Cloudinary.
**Why it's wrong:** Next.js serverless functions have a 4.5MB request body limit on Vercel. Large art images will fail. Adds latency (client → server → Cloudinary vs client → Cloudinary).
**Do this instead:** Upload directly from the browser to Cloudinary using an unsigned upload preset or a short-lived signed upload token generated by a Server Action.

### Anti-Pattern 3: Storing Images on the Next.js Server Filesystem

**What people do:** Save uploaded images to `/public/uploads/` on the server.
**Why it's wrong:** Vercel (and all serverless environments) have ephemeral filesystems. Files written at runtime disappear on the next deploy or function cold start.
**Do this instead:** Always use an external image store (Cloudinary, Vercel Blob, S3). Store only the URL/public_id in the database.

### Anti-Pattern 4: Relying Only on Middleware for Authentication

**What people do:** Check the session only in `middleware.ts` and assume Server Actions are therefore protected.
**Why it's wrong:** CVE-2025-29927 (March 2025) demonstrated that middleware can be bypassed by manipulating the `x-middleware-subrequest` header. Any Server Action that mutates data must independently verify auth.
**Do this instead:** Call `requireAuth()` at the top of every Server Action that writes data, in addition to middleware.

### Anti-Pattern 5: Fetching Gallery Data Client-Side

**What people do:** Build the gallery as a pure Client Component that fetches art pieces via `useEffect` + fetch.
**Why it's wrong:** Causes a layout shift (empty grid → populated grid), hurts SEO, and adds a network waterfall.
**Do this instead:** Fetch in a Server Component, pass data as props. Only the filter interaction is client-side state.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Cloudinary | Direct browser upload (unsigned preset) + `next/image` with Cloudinary loader | Free tier: 25GB storage, 25GB bandwidth/month. Sufficient for a portfolio. |
| Neon (Postgres) | Drizzle ORM, connection string in env var | Free tier: 0.5GB storage, 1 project. Fine for portfolio scale. Supabase is an equivalent alternative. |
| Resend | Server Action calls Resend SDK, sends to Anna's email | Free tier: 3,000 emails/month. Vastly more than needed. |
| Vercel (hosting) | Git push deploys automatically | Free Hobby tier: 100GB bandwidth, 150k function invocations/month. |
| NextAuth.js / custom JWT | Session cookie set on login, read in middleware + Server Actions | For a single admin user, a custom lightweight JWT avoids NextAuth complexity. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Public pages ↔ Admin pages | No direct communication — completely separate route trees under /admin/ | Admin layout applies auth wrapper; public layout never imports admin components |
| Gallery Client Component ↔ Server Data | Server Component fetches, passes as props | Filter state lives entirely in client memory — no re-fetch on tag change |
| Server Actions ↔ Database | Direct Drizzle calls inside server actions | No intermediate service layer needed at this scale |
| Admin forms ↔ Cloudinary | Browser ↔ Cloudinary directly (bypass server) | Server Action only receives the resulting URL, not the binary file |
| Contact form ↔ Resend | Server Action → Resend SDK | Email address stored in environment variable, not hardcoded |

## Build Order Implications

The component dependencies drive a natural build sequence:

1. **Database schema + Drizzle setup** — Everything else depends on the data model being defined first.
2. **Authentication (login + middleware + requireAuth)** — Must exist before any admin functionality can be tested safely.
3. **Image upload to Cloudinary** — Art CRUD depends on images being storable before pieces can be created.
4. **Art CRUD Server Actions** — Needed before gallery can display real data.
5. **Public Gallery** — Can now display real data from the database.
6. **Animated Intro** — Standalone Client Component, no data dependencies. Can be built any time after project setup.
7. **About page + Admin About Editor** — Simpler than art CRUD (no image resize complexity).
8. **Contact Form + Resend** — Isolated feature with no dependencies on gallery or admin art.
9. **QR Code page** — Trivial Client Component, build last.

## Sources

- Next.js App Router architecture patterns: [SoftwareMill — Modern Full Stack App Architecture with Next.js 15](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/) (MEDIUM confidence — third party, verified against Next.js docs patterns)
- Admin auth with single password + JWT cookie: [Alex Chan — Password Protecting Next.js Routes](https://www.alexchantastic.com/password-protecting-next) (MEDIUM confidence)
- CVE-2025-29927 middleware bypass, defense-in-depth requirement: [WorkOS — Next.js App Router Authentication Guide 2026](https://workos.com/blog/nextjs-app-router-authentication-guide-2026) (HIGH confidence — multiple sources corroborate)
- Image upload anti-pattern (serverless filesystem): multiple Vercel/Next.js sources (HIGH confidence)
- Cloudinary direct upload pattern: [next-cloudinary GitHub](https://github.com/cloudinary-community/next-cloudinary) (HIGH confidence — official community library)
- Resend + Server Actions for contact email: [Resend official Next.js docs](https://resend.com/nextjs) (HIGH confidence — official)
- QR code: [qrcode.react on npm](https://www.npmjs.com/package/qrcode/v/1.4.2) (HIGH confidence)
- Real-world Next.js artist portfolio structure: [satvikvirmani/nextjs-artist-portfolio](https://github.com/satvikvirmani/nextjs-artist-portfolio) (MEDIUM confidence — open source reference)
- Vercel free tier limits: [Vercel Limits docs](https://vercel.com/docs/limits) (HIGH confidence — official)

---
*Architecture research for: Artist portfolio web app (Anna Blomgren)*
*Researched: 2026-03-13*
