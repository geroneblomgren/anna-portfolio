---
phase: 03-public-site
verified: 2026-03-13T00:00:00Z
status: human_needed
score: 4/5 must-haves verified (automated)
human_verification:
  - test: "Confirm CLS <= 0.1 on mobile Lighthouse run"
    expected: "Gallery thumbnail images load with blur placeholders and no measurable layout shift; Lighthouse CLS score at or below 0.1 on a mobile preset run"
    why_human: "CLS is a runtime metric — cannot be determined by static grep. Requires running Lighthouse against a live build with real images loaded."
  - test: "Confirm Anna receives email notification when contact form is submitted"
    expected: "After setting RESEND_API_KEY and ANNA_EMAIL env vars, a submitted contact form delivers an email to Anna's inbox with subject 'New message from {name}'"
    why_human: "Email delivery depends on a live RESEND_API_KEY environment variable and external Resend service — cannot be verified statically. Additionally, the current sender (onboarding@resend.dev) can only deliver to the Resend account owner's email in test mode; production delivery to amblomgren12@gmail.com requires a verified sender domain."
---

# Phase 3: Public Site Verification Report

**Phase Goal:** Visitors who scan the QR code experience a complete portfolio — animated intro, browsable gallery with filtering, full-resolution lightbox, about page, and working contact form
**Verified:** 2026-03-13
**Status:** human_needed (4/5 truths verified automatically; 1 requires Lighthouse run + email delivery confirmation)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | On first visit, a dark animated intro plays and transitions into the gallery; a skip control appears within 1 second; the intro does not replay on return visits; prefers-reduced-motion skips the animation entirely | VERIFIED | `IntroAnimation.tsx`: useEffect checks `localStorage.getItem('intro-seen')` and `matchMedia('(prefers-reduced-motion: reduce)')` on mount. Skip button renders immediately inside intro overlay (no delay). `skip()` calls `localStorage.setItem('intro-seen', '1')`. Fallback path sets `done=true` directly when reduced-motion or already-seen. |
| 2 | Visitor can filter gallery by category tag and see only matching pieces update without a page reload | VERIFIED | `GalleryGrid.tsx` line 28-31: client-side `useState<Tag \| null>(null)` drives `pieces.filter(p => p.tags?.includes(activeTag))`. `TagFilter.tsx` calls `onTagChange` prop. No navigation, no server round-trip. |
| 3 | Tapping any piece opens a full-resolution lightbox showing the image, title, medium, description, and tags | VERIFIED | `GalleryGrid.tsx` line 66: `onClick={() => { setLightboxIndex(idx); setLightboxOpen(true) }}`. `GalleryLightbox.tsx` uses YARL with Captions plugin. Slides mapped with `title: p.title`, `description: [p.medium, p.description, p.tags?.map(t => t.replace(/-/g, ' ')).join(', ')].filter(Boolean).join(' — ')`. Lightbox size variant: `media?.sizes?.lightbox?.url` (2400px). |
| 4 | Gallery thumbnail images load with blur placeholders and no layout shift; a mobile Lighthouse run scores CLS <= 0.1 | PARTIAL | `GalleryGrid.tsx`: `next/image` with explicit `width`, `height`, `blurDataURL` — structural requirements for zero CLS are in place. `placeholder={media.blurDataURL ? 'blur' : 'empty'}`. CLS score itself requires a human Lighthouse run — cannot be verified statically. |
| 5 | About page displays Anna's bio, photo, and story; contact form submits successfully and Anna receives an email notification; Instagram link is visible and navigates correctly | PARTIAL | About page (`about/page.tsx`): hero photo, RichText bio, artist statement, social links (Instagram SVG icon), contact info all wired to Payload globals. Contact form (`ContactForm.tsx`): `useActionState(sendContactEmail, {})`, Zod validation, field-level errors, success state. Email action (`sendContactEmail.ts`): lazy Resend init, RESEND_API_KEY guard, ContactNotification template via `@react-email/components`. Email delivery requires RESEND_API_KEY env var and verified sender domain for production delivery — human verification needed. |

**Score:** 3 fully verified + 2 partial (both partials have all code in place; gaps are runtime/external-service concerns only)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/frontend/NavBar.tsx` | Fixed top nav with hamburger mobile menu | VERIFIED | 100 lines. Fixed `h-16`, `bg-bg/90 backdrop-blur-sm`, hamburger opens `fixed inset-0 bg-bg z-50` overlay. `usePathname` active link detection. Exports `NavBar`. |
| `src/components/frontend/GalleryGrid.tsx` | Masonry gallery grid with client-side tag filtering | VERIFIED | 102 lines. `react-masonry-css`, `useState` for activeTag + lightbox state, `next/image` with blur placeholder, GalleryLightbox wired. Exports `GalleryGrid`. |
| `src/components/frontend/TagFilter.tsx` | Horizontal pill button filter UI | VERIFIED | 37 lines. Six pill buttons (All + 5 tags), active/inactive styling, `overflow-x-auto`. Exports `TagFilter`. |
| `src/app/(frontend)/page.tsx` | Server Component that fetches art pieces and renders gallery | VERIFIED | 28 lines. `payload.find({ collection: 'art-pieces', sort: '-featured', depth: 1, limit: 200 })`. Wraps `<GalleryGrid>` in `<IntroAnimation>`. |
| `src/app/(frontend)/layout.tsx` | Frontend layout with NavBar | VERIFIED | 16 lines. Renders `<NavBar />`, `pt-16` padding for fixed nav. |
| `src/components/frontend/IntroAnimation.tsx` | Ink-bleed SVG animation with skip, localStorage, reduced-motion | VERIFIED | 134 lines. 4 `motion.path` SVG strokes with staggered pathLength animation. Text reveal. Skip button. localStorage guard. AnimatePresence crossfade. |
| `src/components/frontend/GalleryLightbox.tsx` | Full-screen lightbox with captions, keyboard nav, and swipe | VERIFIED | 62 lines. YARL + Captions plugin. Custom `render.slide` with `next/image fill`. Lightbox-size URL variant. Dark backdrop via YARL CSS custom property. |
| `src/app/(frontend)/about/page.tsx` | About page with hero photo, rich text bio, artist statement, social links, contact info | VERIFIED | 138 lines. `payload.findGlobal('about')` + `payload.findGlobal('site-settings')`. Hero photo with null guard (fixed in 548bf04). RichText bio. Artist statement blockquote. Social links with Instagram SVG. Graceful empty state. |
| `src/app/(frontend)/contact/page.tsx` | Contact page with form | VERIFIED | 19 lines. Renders `<ContactForm />` with heading and subtitle. |
| `src/components/frontend/ContactForm.tsx` | Client-side contact form with validation and submission state | VERIFIED | 98 lines. `useActionState(sendContactEmail, {})`. `useFormStatus` pending state. Field-level error display. Success confirmation replaces form. |
| `src/actions/sendContactEmail.ts` | Server Action that validates input and sends email via Resend | VERIFIED | 61 lines. `'use server'`. Zod schema. Lazy Resend init with RESEND_API_KEY guard. Returns `{ success: true, name }` or field/general errors. |
| `src/emails/ContactNotification.tsx` | React-email template for contact notification | VERIFIED | 65 lines. `@react-email/components`. Clean card layout with name, email, message. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/(frontend)/page.tsx` | `payload.find({ collection: 'art-pieces' })` | Payload Local API with depth:1 | WIRED | Line 13-19: `payload.find({...})`, result `docs` passed to `<GalleryGrid pieces={docs} />` |
| `src/components/frontend/GalleryGrid.tsx` | `src/components/frontend/TagFilter.tsx` | activeTag state shared between filter and grid | WIRED | Line 40: `<TagFilter activeTag={activeTag} onTagChange={setActiveTag} />`. Filter logic lines 28-31 consumes `activeTag`. |
| `src/app/(frontend)/layout.tsx` | `src/components/frontend/NavBar.tsx` | NavBar rendered in layout wrapper | WIRED | Line 1 import, line 10: `<NavBar />` |
| `src/app/(frontend)/page.tsx` | `src/components/frontend/IntroAnimation.tsx` | Wraps gallery content | WIRED | Line 4 import, line 22-26: `<IntroAnimation>...<GalleryGrid.../></IntroAnimation>` |
| `src/components/frontend/GalleryGrid.tsx` | `src/components/frontend/GalleryLightbox.tsx` | selectedIndex state + onPieceClick callback | WIRED | Lines 25-26 state, line 66 onClick sets index+open, lines 94-99: `<GalleryLightbox pieces={sorted} open={lightboxOpen} index={lightboxIndex} onClose={...} />` |
| `src/components/frontend/GalleryLightbox.tsx` | `yet-another-react-lightbox` | YARL Lightbox component with slides mapped from ArtPieces | WIRED | Lines 4-7 imports, line 38: `<Lightbox open={open} close={onClose} index={index} slides={slides} plugins={[Captions]} .../>` |
| `src/app/(frontend)/about/page.tsx` | `payload.findGlobal({ slug: 'about' })` | Payload Local API with depth:1 | WIRED | Line 14: `payload.findGlobal({ slug: 'about', depth: 1, overrideAccess: true })` |
| `src/app/(frontend)/about/page.tsx` | `payload.findGlobal({ slug: 'site-settings' })` | Payload Local API for social links | WIRED | Line 15: `payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })`. Social links rendered lines 96-135. |
| `src/components/frontend/ContactForm.tsx` | `src/actions/sendContactEmail.ts` | Server Action form submission | WIRED | Line 5 import, line 21: `useActionState(sendContactEmail, {})`, line 37: `<form action={formAction}>` |
| `src/actions/sendContactEmail.ts` | `src/emails/ContactNotification.tsx` | Resend SDK renders email template | WIRED | Line 5 import, line 48: `react: ContactNotification({ name, email, message })` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| GAL-01 | 03-02, 03-04 | User can view art pieces in a full-screen lightbox with high-quality images | SATISFIED | `GalleryLightbox.tsx` uses lightbox-size URL variant (2400px), YARL fullscreen, custom next/image render |
| GAL-02 | 03-01, 03-04 | User can filter gallery by category/style tags without page reload | SATISFIED | `TagFilter.tsx` + `GalleryGrid.tsx` client-side filtering via useState |
| GAL-03 | 03-02, 03-04 | Each piece displays title, medium/style, description, and category tags | SATISFIED | Lightbox Captions plugin receives `title` and `description` (concatenated from medium + description + tags) |
| GAL-04 | 03-01, 03-04 | Gallery loads with optimized images (WebP, lazy loading, responsive srcset) | SATISFIED (partial) | `next/image` with gallery-size URLs (WebP variants from Phase 2 pipeline), `sizes` attribute, `blurDataURL` placeholder. CLS score needs human Lighthouse run. |
| GAL-05 | 03-01, 03-04 | Gallery displays pieces in admin-defined sort order with featured pieces first | SATISFIED | Server: `sort: '-featured'`. Client: `sorted = [...filtered].sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))` |
| PRES-01 | 03-02, 03-04 | Site opens with a dark, moody animated intro that transitions into the gallery | SATISFIED | `IntroAnimation.tsx`: 4 SVG ink strokes + text reveal + AnimatePresence crossfade to gallery |
| PRES-02 | 03-02, 03-04 | Intro animation is skippable and respects prefers-reduced-motion | SATISFIED | Skip button renders at mount (no delay), localStorage prevents replay, `matchMedia` reduced-motion check skips entirely |
| PUB-01 | 03-03, 03-04 | About page displays Anna's bio, photo, and story of pursuing tattooing | SATISFIED | `about/page.tsx`: hero photo (with null guard), RichText bio via `@payloadcms/richtext-lexical/react`, artist statement blockquote |
| PUB-02 | 03-03, 03-04 | Contact form sends email notification to Anna on submission | NEEDS HUMAN | Server Action wired to Resend + ContactNotification template. Requires RESEND_API_KEY and ANNA_EMAIL env vars. Production delivery also requires verified sender domain. |
| PUB-03 | 03-03, 03-04 | Social media links displayed (Instagram minimum) | SATISFIED | `about/page.tsx` lines 96-135: Instagram rendered with inline SVG icon, `target="_blank"`, reads from `siteSettings.socialLinks` |

**All 10 Phase 3 requirements accounted for.** No orphaned requirements.

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/components/frontend/GalleryGrid.tsx` line 56 | `if (!media) return null` — returns null when image is unresolved ID | Info | Correct defensive guard; expected behavior when depth not populated. Not a stub. |
| `src/actions/sendContactEmail.ts` line 46 | `process.env.ANNA_EMAIL ?? 'test@example.com'` — fallback to test email | Info | Documents that ANNA_EMAIL must be set in production. Not a blocker; guard at line 37 handles missing RESEND_API_KEY gracefully. |

No blockers or warnings found. No TODO/FIXME/placeholder comments. No empty implementations.

---

## Human Verification Required

### 1. CLS Score — Mobile Lighthouse

**Test:** Run a mobile Lighthouse audit against `http://localhost:3000` (or the Vercel production URL) with at least a few art pieces loaded in the database.
**Expected:** Cumulative Layout Shift (CLS) score of 0.1 or below. Images should render with blur placeholders and never cause visible layout shift as they load.
**Why human:** CLS is a runtime browser metric. The code uses `next/image` with explicit `width`, `height`, and `blurDataURL` — all structural prerequisites for zero CLS — but only a live Lighthouse run against real images can confirm the actual score. Throttle the network to "Fast 3G" to make blur placeholders visible.

### 2. Email Delivery — Contact Form End-to-End

**Test:** Set `RESEND_API_KEY` and `ANNA_EMAIL=amblomgren12@gmail.com` in `.env.local`, start `npm run dev`, navigate to `/contact`, submit a valid form.
**Expected:** A success confirmation appears on the page AND an email arrives at Anna's Gmail with subject "New message from {name}" and the message body in a clean card layout.
**Why human:** Email delivery requires a live external service (Resend) and valid API credentials. Also note: the current sender `onboarding@resend.dev` can only deliver to the Resend account owner's email in test mode. For production delivery to Anna's Gmail, the `from` field in `sendContactEmail.ts` must be updated to a verified sender domain (e.g., `contact@annablomgren.com`).

---

## Gaps Summary

No code gaps found. All 10 required artifacts exist, are substantive (no stubs, no placeholder returns), and are fully wired. All 10 key links verified. All 10 Phase 3 requirements have implementation evidence.

The two human verification items are not code gaps — they are runtime/external-service concerns that require a live environment:

1. **CLS <= 0.1:** The `next/image` usage is structurally correct (explicit dimensions, blurDataURL). This is a quality confirmation, not a missing implementation.
2. **Email delivery:** The Server Action, Resend integration, and email template are all implemented correctly. This requires API credentials and a verified sender domain — a configuration concern for deployment, not a code gap.

---

_Verified: 2026-03-13_
_Verifier: Claude (gsd-verifier)_
