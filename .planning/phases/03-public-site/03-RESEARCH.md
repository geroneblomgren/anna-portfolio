# Phase 3: Public Site - Research

**Researched:** 2026-03-13
**Domain:** Next.js public frontend — gallery, animation, lightbox, email, rich text rendering
**Confidence:** HIGH (stack is confirmed; most patterns verified against official docs or Context7)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Intro Animation**
- Ink bleed style — abstract ink/charcoal strokes animate across a dark screen, forming into "Anna Blomgren" with subtitle "Artist & Illustrator" fading in below
- Duration ~3-4 seconds
- Transition: dissolve out — ink/name fades to black, then gallery fades in (cinematic cut)
- Skip control: small "Skip" text/button in the corner (explicit, like YouTube ads)
- Intro does not replay on return visits (use localStorage/cookie flag)
- `prefers-reduced-motion` skips animation entirely, goes straight to gallery

**Gallery Layout & Interaction**
- Tag filter UI: horizontal pill buttons above the gallery ("All", "Drawings", "Paintings", "Tattoo Designs", "Digital Art", "Mixed Media")
- Active pill highlights, tap to filter — pieces update without page reload
- Featured pieces display first, then admin-defined sort order
- Blur placeholders load first (blurDataURL from Media pipeline), no layout shift

**Lightbox**
- Full-screen image initially (lightbox 2400px variant)
- Swipe/tap to reveal a details panel with title, medium, description, and tags
- Left/right swipe or arrow keys to navigate between pieces without closing
- Close button to return to gallery grid

**Navigation & Page Structure**
- Separate pages: Gallery at `/`, About at `/about`, Contact at `/contact`
- Minimal top bar: "Anna Blomgren" on left, nav links (Gallery, About, Contact) on right
- Fixed nav — stays pinned to top on scroll
- Mobile: hamburger menu (collapses 3 links into overlay)

**About Page**
- Full-width hero photo spanning the page (from AboutGlobal.photoId)
- Bio text (rich text from AboutGlobal.bioText) flows underneath
- Artist statement below bio
- Social links (Instagram) displayed on the about page only — not in a site-wide footer
- Contact email and phone from AboutGlobal if populated

**Contact Form**
- Fields: Name, Email, Message (3 fields, no subject line)
- Email notification sent to Anna on submission

### Claude's Discretion
- Gallery grid style (masonry vs uniform vs hybrid — pick what's best for mixed B&W art)
- Contact form submission confirmation UX (inline message vs toast)
- Ink bleed animation implementation approach (CSS animations, canvas, SVG)
- Loading skeletons and error states
- Exact spacing, typography scale, and transitions
- Email delivery service selection (Resend, SendGrid, etc.)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAL-01 | User can view art pieces in a full-screen lightbox with high-quality images | yet-another-react-lightbox + lightbox 2400px variant from Media collection |
| GAL-02 | User can filter gallery by category/style tags without page reload | Client component pill filter state + Payload tags field; no route change needed |
| GAL-03 | Each piece displays title, medium/style, description, and category tags | Lightbox Captions plugin + detail panel pattern; data from ArtPieces fields |
| GAL-04 | Gallery loads with optimized images (WebP, lazy loading, responsive srcset) | next/image + blurDataURL already in Media; thumb/gallery/lightbox sizes exist |
| GAL-05 | Gallery displays pieces in admin-defined sort order with featured pieces first | payload.find with sort on orderedAt; featured flag for stable pinning |
| PRES-01 | Site opens with a dark, moody animated intro that transitions into the gallery | motion package AnimatePresence + CSS/SVG ink animation; localStorage skip flag |
| PRES-02 | Intro animation is skippable and respects prefers-reduced-motion | prefers-reduced-motion CSS media query + useEffect localStorage check pattern |
| PUB-01 | About page displays Anna's bio, photo, and story | payload.findGlobal('about') + RichText component from @payloadcms/richtext-lexical/react |
| PUB-02 | Contact form sends email notification to Anna on submission | Resend SDK + Server Action pattern; react-email template |
| PUB-03 | Social media links displayed (Instagram minimum) | SiteSettings.socialLinks array from payload.findGlobal('site-settings') |
</phase_requirements>

---

## Summary

Phase 3 builds the entire visitor-facing experience on an already-solid foundation: Next.js 15.3.9 + Payload 3.79 + Tailwind v4, with three image sizes and blurDataURL already stored per artwork. The main technical domains are (1) animated intro, (2) filterable gallery, (3) lightbox, (4) data fetching via Payload Local API, (5) rich text rendering, (6) contact email via Resend, and (7) navigation shell.

The stack is well-understood and stable. The highest-risk area is the ink bleed intro animation: it must be visually striking on mobile, skip gracefully, and not block the gallery. The recommended approach is SVG path animation driven by the `motion` package (formerly framer-motion) — this stays in the React tree, integrates with AnimatePresence for the gallery crossfade, and avoids canvas complexity. CSS animations are viable for the simpler fade-in of the text but SVG gives organic stroke feel.

For the gallery layout, a CSS multi-column masonry approach via `react-masonry-css` is recommended over JavaScript-measured solutions: it renders correctly server-side, has no ResizeObserver overhead, and handles mixed aspect ratios cleanly. Because the dataset is small (a few dozen artworks), virtualization is unnecessary.

**Primary recommendation:** Use `motion` (the renamed framer-motion package) for all animation including intro and gallery transitions; `react-masonry-css` for gallery layout; `yet-another-react-lightbox` with the Captions plugin for lightbox; Resend + react-email for notifications; Payload Local API for all data fetching.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `motion` | ^12.x (latest) | Intro animation, page transitions, AnimatePresence | Rebrand of framer-motion; identical API; preferred for new projects 2025+ |
| `yet-another-react-lightbox` | ^3.x | Full-screen lightbox with swipe, keyboard, next/image | Modern, SSR-safe, supports blurDataURL, has Captions plugin |
| `react-masonry-css` | ^1.0.17 | CSS column-based masonry gallery | Pure CSS, SSR-safe, zero JS layout calculation, handles mixed heights |
| `resend` | ^4.x | Transactional email for contact form | Stack-confirmed in STATE.md; 3,000 free emails/month; Server Action compatible |
| `@react-email/components` | ^0.x | Email template components | Official react-email; co-created by Resend founder; converts JSX → HTML |
| `@payloadcms/richtext-lexical` | ^3.79.0 | Already installed | `RichText` component from `/react` subpath renders bio content |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-email` | dev dep only | Email preview during development | Preview templates at localhost:3001 with `email dev` |
| `zod` | ^3.x | Contact form validation | Server Action input validation before sending email |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `motion` | `framer-motion` | framer-motion is still actively maintained but `motion` is the canonical new package name; API identical |
| `react-masonry-css` | CSS `columns` property directly | Direct CSS columns works but react-masonry-css gives column-breakpoints as props, cleaner DX |
| `react-masonry-css` | `masonic` | Masonic requires client-side JS measurement, complicates SSR, overkill for <100 items |
| `yet-another-react-lightbox` | `photoswipe` | PhotoSwipe requires more manual wiring; YARL has better React/next/image integration |
| `resend` | `sendgrid` / `nodemailer` | Resend already in STATE.md decisions; simpler API; react-email is native |

**Installation:**
```bash
npm install motion yet-another-react-lightbox react-masonry-css resend @react-email/components zod
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── (frontend)/
│       ├── layout.tsx          # Add NavBar here; replace max-w-5xl container
│       ├── page.tsx            # Gallery page — replaces smoke test
│       ├── about/
│       │   └── page.tsx        # About page
│       └── contact/
│           └── page.tsx        # Contact page
├── components/
│   └── frontend/
│       ├── NavBar.tsx          # 'use client' — hamburger state
│       ├── IntroAnimation.tsx  # 'use client' — localStorage + motion
│       ├── GalleryGrid.tsx     # 'use client' — filter state
│       ├── GalleryLightbox.tsx # 'use client' — lightbox open state
│       ├── TagFilter.tsx       # 'use client' — pill buttons
│       └── ContactForm.tsx     # 'use client' — form state + Server Action
├── actions/
│   └── sendContactEmail.ts     # 'use server' Server Action
└── emails/
    └── ContactNotification.tsx # react-email template
```

### Pattern 1: Payload Local API Data Fetching

**What:** Use `getPayload({ config })` directly in Server Components — no HTTP round-trip, same process.

**When to use:** Every page that needs CMS data (gallery, about, contact page for address display).

```typescript
// Source: payloadcms.com/docs/queries/overview (verified)
import { getPayload } from 'payload'
import config from '@payload-config'

// In a Server Component (no 'use client'):
const payload = await getPayload({ config })

// Fetch all art pieces — featured first, then ordered
const { docs: artPieces } = await payload.find({
  collection: 'art-pieces',
  sort: '-featured,_order',
  depth: 1,           // populates the image relationship
  limit: 100,
  overrideAccess: true,
})

// Fetch About global
const about = await payload.findGlobal({
  slug: 'about',
  depth: 1,           // populates photoId media relationship
})

// Fetch SiteSettings global
const siteSettings = await payload.findGlobal({
  slug: 'site-settings',
  depth: 0,
})
```

**Important:** `depth: 1` populates the `image` relationship on ArtPieces so you get the full media document including `blurDataURL`, `sizes.gallery.url`, `sizes.lightbox.url`. Without depth, you only get the ID.

### Pattern 2: Intro Animation with localStorage Skip

**What:** Client component that checks localStorage on mount; skips animation if already seen; respects prefers-reduced-motion.

**When to use:** Root of (frontend) layout or homepage — renders above gallery.

```typescript
// 'use client'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'

export function IntroAnimation({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false)  // false avoids SSR flash
  const [done, setDone] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('intro-seen')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!seen && !reducedMotion) {
      setShowIntro(true)
    } else {
      setDone(true)  // skip straight to gallery
    }
  }, [])

  const skip = () => {
    localStorage.setItem('intro-seen', '1')
    setShowIntro(false)
    setDone(true)
  }

  return (
    <AnimatePresence mode="wait">
      {showIntro && !done ? (
        <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          {/* SVG ink animation here */}
          <button onClick={skip} className="fixed top-4 right-4 text-sm text-text-muted">
            Skip
          </button>
        </motion.div>
      ) : done ? (
        <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
```

**SSR note:** Initialize `showIntro` to `false` (not `true`) to avoid hydration mismatch — localStorage is only readable client-side. The `useEffect` fires after hydration and flips state.

### Pattern 3: Gallery Filter (Client-Only State, Server-Fetched Data)

**What:** Fetch all art pieces server-side, pass as props to client component that filters in-memory. No additional API calls on filter.

**When to use:** Tag filter — dataset is small (<100 pieces), no page reload needed.

```typescript
// page.tsx (Server Component)
const { docs: allPieces } = await payload.find({ collection: 'art-pieces', ... })
return <GalleryGrid pieces={allPieces} />

// GalleryGrid.tsx ('use client')
const [activeTag, setActiveTag] = useState<string | null>(null)
const filtered = activeTag
  ? pieces.filter(p => p.tags?.includes(activeTag))
  : pieces
```

### Pattern 4: Rich Text Rendering (Bio)

**What:** Payload's Lexical editor stores content as `SerializedEditorState`. Render with the official component — do NOT parse manually.

```typescript
// Source: payloadcms.com community docs (HIGH confidence — official package)
import { RichText } from '@payloadcms/richtext-lexical/react'

// aboutPage is the result of payload.findGlobal({ slug: 'about' })
<RichText data={aboutPage.bioText} />
```

`@payloadcms/richtext-lexical` is already installed (v3.79.0). No extra install needed.

### Pattern 5: Contact Form Server Action with Resend

**What:** Form submission goes to a Server Action; no API route needed.

```typescript
// actions/sendContactEmail.ts
'use server'
import { Resend } from 'resend'
import { z } from 'zod'
import { ContactNotification } from '@/emails/ContactNotification'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })
  if (!parsed.success) return { error: 'Invalid input' }

  const { data, error } = await resend.emails.send({
    from: 'Portfolio <noreply@yourdomain.com>',
    to: [process.env.ANNA_EMAIL!],
    subject: `New message from ${parsed.data.name}`,
    react: ContactNotification(parsed.data),
  })

  if (error) return { error: 'Failed to send' }
  return { success: true }
}
```

### Pattern 6: Lightbox with next/image and blurDataURL

**What:** Map ArtPieces to YARL slides; use custom render function to swap in next/image with blur placeholder.

```typescript
// GalleryLightbox.tsx ('use client')
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import NextImage from 'next/image'

const slides = pieces.map(p => ({
  src: p.image.sizes.lightbox.url,
  width: p.image.sizes.lightbox.width,
  height: p.image.sizes.lightbox.height,
  alt: p.image.alt,
  title: p.title,
  description: `${p.medium ?? ''} — ${p.description ?? ''}`,
  blurDataURL: p.image.blurDataURL,
}))

<Lightbox
  open={open}
  close={() => setOpen(false)}
  index={currentIndex}
  slides={slides}
  plugins={[Captions]}
  render={{
    slide: ({ slide }) => (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <NextImage
          src={slide.src}
          alt={slide.alt ?? ''}
          fill
          sizes="100vw"
          placeholder={slide.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={slide.blurDataURL}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
  }}
/>
```

### Anti-Patterns to Avoid

- **Fetching Payload data from client components via REST API:** Payload Local API is available server-side; use it. REST calls from the browser add latency, expose internal routes, and complicate access control.
- **Initializing `showIntro = true` on SSR:** Causes hydration mismatch because localStorage is undefined server-side. Always start `false` and flip in `useEffect`.
- **Importing motion components in Server Components without 'use client':** AnimatePresence and all interactive motion components require `'use client'`. Wrapper pattern: keep data-fetching in Server Component, pass data to client component.
- **Using `sort: '-featured,_order'` without `orderable: true`:** ArtPieces already has `orderable: true` — the `_order` field is auto-managed. Confirm field name with Payload docs if sort fails.
- **Skipping `depth: 1` on art-pieces query:** Without depth, `image` is just an ID string, not a media object. blurDataURL and image URLs will be missing.
- **Putting `new Resend(...)` inside the Server Action function body:** Instantiate outside the function so it's not recreated on every call.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image lightbox | Custom modal + image | `yet-another-react-lightbox` | Keyboard nav, swipe gestures, focus trap, accessibility, srcSet — hundreds of edge cases |
| Masonry layout | Column measurement with ResizeObserver | `react-masonry-css` | CSS-native, SSR-safe, no layout thrash, responsive breakpoints |
| Rich text rendering | Parse Lexical JSON manually | `RichText` from `@payloadcms/richtext-lexical/react` | Lexical node types are complex; official converter handles all built-in types |
| Email HTML | Hand-written HTML email | `@react-email/components` | Email clients (Outlook, Gmail mobile) have extreme CSS restrictions; react-email handles it |
| Animation keyframes for intro | Manual CSS keyframes for SVG paths | `motion` SVG animation | Path length animation, sequencing, and exit transitions require complex CSS math |
| Form validation | Manual regex checks | `zod` in Server Action | Type-safe parsing, error messages, protection against malformed Server Action calls |

**Key insight:** Email HTML and lightbox keyboard/touch handling are both domains with enormous hidden complexity. Never build custom solutions.

---

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from localStorage

**What goes wrong:** `showIntro` initialized to `true` on server renders the intro animation markup; client reads localStorage and wants to skip, causing React tree mismatch.

**Why it happens:** Server has no access to localStorage; any state that differs between server and first client render triggers hydration error.

**How to avoid:** Initialize `showIntro = false` (show nothing). `useEffect` fires only client-side, then sets the correct state. Gallery is briefly invisible for ~1 frame before hydration — acceptable.

**Warning signs:** React console error "Hydration mismatch: server rendered X but client rendered Y."

### Pitfall 2: `sort: '-featured,_order'` May Need Two Separate Sort Steps

**What goes wrong:** Payload's sort parameter may not support multi-field sort with mixed directions in a single string.

**Why it happens:** Payload's Local API sort string follows `±field` pattern; combining featured bool + numeric order may require post-sort in JS.

**How to avoid:** Fetch with `sort: '-featured'` first, then within each group let the DB return in `_order`. Alternatively, sort client-side: `pieces.sort((a,b) => Number(b.featured) - Number(a.featured) || a._order - b._order)`.

**Warning signs:** Featured pieces not appearing first despite being checked in admin.

### Pitfall 3: Lightbox CSS Import Forgotten

**What goes wrong:** Lightbox opens but images/layout is broken — slides may not render correctly.

**Why it happens:** YARL requires explicit CSS imports: `yet-another-react-lightbox/styles.css` and plugin-specific CSS files.

**How to avoid:** Always import both base CSS and plugin CSS files in the lightbox component.

**Warning signs:** Lightbox opens with no visible image or broken layout.

### Pitfall 4: motion package 'use client' Requirement

**What goes wrong:** `motion` components (motion.div, AnimatePresence) throw errors in Server Components.

**Why it happens:** All interactive animation requires client-side React event loop.

**How to avoid:** Every component using `motion` imports must have `'use client'` at top. The pattern: Server Component fetches data → passes to Client Component wrapper that owns animation state.

**Warning signs:** "You're importing a component that needs client-side only APIs."

### Pitfall 5: Resend Domain Verification for Production

**What goes wrong:** Emails send fine in dev with `onboarding@resend.dev` but fail in production from a custom `from` address.

**Why it happens:** Resend requires DNS verification (SPF, DKIM) for any custom sender domain.

**How to avoid:** Use `onboarding@resend.dev` only for testing. For production, verify the sender domain in Resend dashboard. The `to` address (Anna's email) never requires verification.

**Warning signs:** Emails sent successfully according to Resend but never arrive; or 403 error on send.

### Pitfall 6: CLS from Missing width/height on Gallery Images

**What goes wrong:** Images in masonry grid cause layout shift as they load, failing the CLS ≤ 0.1 target.

**Why it happens:** Browsers can't reserve space for images without known dimensions.

**How to avoid:** Always pass `width` and `height` props to `<Image>` from next/image using the values stored in the media document (`p.image.width`, `p.image.height` or size-specific dimensions). `react-masonry-css` columns prevent cross-column reflow but not vertical shift within columns.

**Warning signs:** Lighthouse CLS > 0.1 on mobile; images "popping in" without reserved space.

---

## Code Examples

### Payload Local API — Gallery Page

```typescript
// src/app/(frontend)/page.tsx  (Server Component, no 'use client')
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function GalleryPage() {
  const payload = await getPayload({ config })

  const { docs: pieces } = await payload.find({
    collection: 'art-pieces',
    sort: '-featured',   // featured first; secondary sort handled client-side
    depth: 1,            // populate image relationship
    limit: 200,
    overrideAccess: true,
  })

  return <GalleryGrid pieces={pieces} />
}
```

### RichText Bio Rendering

```typescript
// src/app/(frontend)/about/page.tsx
import { RichText } from '@payloadcms/richtext-lexical/react'

// ...after payload.findGlobal({ slug: 'about' })
<RichText data={about.bioText} />
```

### Resend + react-email — Email Template

```typescript
// src/emails/ContactNotification.tsx
import { Html, Body, Heading, Text, Section } from '@react-email/components'

export function ContactNotification({ name, email, message }: {
  name: string; email: string; message: string
}) {
  return (
    <Html>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Section style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
          <Heading>New portfolio contact from {name}</Heading>
          <Text>From: {email}</Text>
          <Text>{message}</Text>
        </Section>
      </Body>
    </Html>
  )
}
```

### motion SVG Ink Stroke Animation (Sketch)

```typescript
// 'use client'
import { motion } from 'motion/react'

// Animate SVG path stroke — ink drawing effect
<motion.path
  d="M10,50 Q80,10 150,50 T290,50"   // approximate ink stroke path
  stroke="#c8c8cc"
  strokeWidth={2}
  fill="none"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 2, ease: 'easeInOut' }}
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package (`motion/react` imports) | Late 2024 | Same API, new canonical package name; both maintained |
| Next.js API Route for email | Server Action with `'use server'` | Next.js 14+ | Cleaner, no HTTP overhead, type-safe end-to-end |
| Custom masonry JS (`Masonry.js`) | `react-masonry-css` or CSS columns | 2022+ | No layout thrash, SSR-safe |
| Hand-rolled lightbox | `yet-another-react-lightbox` | 2022+ | Touch/keyboard/accessibility handled |
| Manual Lexical JSON parsing | `RichText` from `@payloadcms/richtext-lexical/react` | Payload 3.x | Official; handles all node types automatically |

**Deprecated/outdated:**
- `react-masonry-component` (wraps Masonry.js): requires jQuery-era DOM APIs, not SSR-safe
- `framer-motion/dist/es` direct imports: use `motion/react` instead

---

## Open Questions

1. **Sort field name for orderable collections**
   - What we know: ArtPieces has `orderable: true`. Payload 3.x uses `_order` for the sort field.
   - What's unclear: Exact field name may be `_order` or `order` depending on Payload version. Needs verification against generated types.
   - Recommendation: After `payload generate:types`, check generated `ArtPiece` type for the order field name before writing sort logic.

2. **Ink SVG path design**
   - What we know: Motion can animate SVG `pathLength` for stroke drawing effect.
   - What's unclear: The actual SVG path shapes for the ink strokes — these must be crafted by hand or sketched to feel organic and match Anna's style.
   - Recommendation: Start with 2-3 simple curved paths (quintic Bezier). Can iterate without code changes by tweaking the `d` attribute. Consider spending a plan on just the animation component.

3. **Lightbox custom detail panel (swipe to reveal)**
   - What we know: YARL Captions plugin shows title/description below the image. The user wants a swipe-to-reveal pattern.
   - What's unclear: YARL Captions shows an always-visible panel, not a swipe-reveal panel. Custom swipe-reveal may require overriding the slide render entirely.
   - Recommendation: Use YARL Captions as the baseline (title + description overlay). If the swipe-to-reveal behavior is critical, implement via custom render with a `motion.div` panel that starts off-screen and slides up on tap. Flag as a potential complexity item in planning.

4. **`@payload-config` alias resolution**
   - What we know: Existing code in `QRCodeView.tsx` uses `import config from '@payload-config'` which works in admin components.
   - What's unclear: Whether the same alias resolves correctly in Server Components under `(frontend)` route group.
   - Recommendation: Test alias resolution in first frontend Server Component. If it fails, use relative import `../../../payload.config.ts`.

---

## Sources

### Primary (HIGH confidence)
- `payloadcms.com/docs/queries/overview` — Local API `payload.find` syntax verified
- `yet-another-react-lightbox.com/documentation` — plugins, slide structure, render props
- `resend.com/docs/send-with-nextjs` — Resend SDK + Server Action pattern
- Existing codebase (`Media.ts`, `ArtPieces.ts`, `AboutGlobal.ts`, `SiteSettings.ts`) — field names verified by direct read

### Secondary (MEDIUM confidence)
- `motion.dev` (WebSearch, npm data) — `motion` package rename confirmed; `motion/react` import path; framer-motion v12 still active
- `payloadcms.com` community search — `RichText` from `@payloadcms/richtext-lexical/react` with `data` prop
- `npmjs.com/package/react-masonry-css` — SSR-safe, CSS columns, breakpoint props
- `resend.com/pricing` — 3,000 free emails/month confirmed

### Tertiary (LOW confidence)
- `_order` as the Payload orderable field name — inferred from Payload 3.x conventions, not confirmed in generated types
- YARL swipe-to-reveal custom panel pattern — extrapolated from `render.slide` docs; not tested

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against official docs or direct npm/official site
- Architecture: HIGH — Payload Local API + Server Actions + motion patterns are well-documented
- Pitfalls: MEDIUM — hydration, CLS, sort field are verified; YARL detail panel is inferred
- Open questions: 2 are low-risk (type check + design), 1 is medium-risk (YARL swipe panel), 1 is low-risk (alias)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable stack; motion/YARL/Resend change slowly)
