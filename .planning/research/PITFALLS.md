# Pitfalls Research

**Domain:** Image-heavy artist portfolio web app (tattoo apprentice, mobile-first, QR code entry, dark aesthetic, self-managed admin)
**Researched:** 2026-03-13
**Confidence:** HIGH (critical pitfalls verified against official Vercel docs and multiple authoritative sources)

---

## Critical Pitfalls

### Pitfall 1: Vercel Free Tier Image Optimization Exhaustion

**What goes wrong:**
The Vercel Hobby (free) plan includes only **1,000 source image optimizations per month**. Each unique image processed by `next/image` at a new size or format counts against this quota. An image-heavy gallery with 50+ pieces, viewed across multiple screen sizes and devices, burns through this quota fast — especially if images are not cached properly or are uploaded at large sizes. Once the quota is exhausted, Next.js falls back to serving unoptimized originals, obliterating load performance for the rest of the month.

**Why it happens:**
Developers use `next/image` everywhere and assume it "just works" for free. The optimization quota is a hard platform limit that is invisible during local development and in Lighthouse scores run against the dev server.

**How to avoid:**
- Store and serve images from **Cloudinary free tier** (25 credits/month, ~25 GB bandwidth) instead of Vercel's built-in optimizer. Cloudinary handles format conversion (WebP/AVIF), resizing, and CDN delivery independently of Vercel's quota.
- If using Vercel Blob for storage, configure `next/image` to use an external loader pointing to Cloudinary's transformation URLs, bypassing Vercel's optimizer entirely.
- Pre-process all uploaded images at the admin upload step: compress to ≤200KB, resize to a maximum of 2400px wide before storage. This reduces the work the optimizer has to do and makes raw fallbacks acceptable.

**Warning signs:**
- Gallery loads fast the first week of the month, then noticeably slows mid-month without any code change
- Vercel dashboard shows image optimization usage approaching 1,000
- Images served without WebP conversion (check Network tab in DevTools — look for `image/jpeg` when `image/webp` is expected)

**Phase to address:** Image infrastructure phase (before gallery build). Decide on Cloudinary vs. Vercel's optimizer before writing a single `next/image` component.

---

### Pitfall 2: Cumulative Layout Shift (CLS) Destroying First Impression on QR Scan

**What goes wrong:**
A tattoo shop owner scans the QR code on their phone. The page starts loading — the dark animated intro begins — and then the gallery images pop in, causing the entire layout to jump. The shop owner taps the wrong thing, loses their place, or simply closes the tab. CLS is the #1 mobile experience killer for image-heavy sites, and the consequences here are severe: Anna's one shot at a first impression is wasted.

**Why it happens:**
Images without explicit `width` and `height` attributes have unknown dimensions at render time. The browser reserves no space for them, renders surrounding text and UI, then reflates the layout when the image loads. This is compounded by:
- Using `fill` layout in `next/image` without a properly sized container
- Dark background sections where placeholder shimmer is invisible
- Custom fonts (common in dark/artistic designs) loading after layout is committed

**How to avoid:**
- Always declare explicit `width` and `height` on every `next/image` component, or use `fill` inside a container with a fixed `aspect-ratio` CSS property.
- Use `placeholder="blur"` with a `blurDataURL` for all gallery images — this reserves space AND gives the dark moody aesthetic a stylish blur-in effect rather than a blank-then-pop.
- Apply `font-display: swap` to all custom fonts. Load critical fonts via `next/font` (built-in, zero layout shift).
- Measure CLS on real mobile devices before launch, not just Lighthouse in Chrome.

**Warning signs:**
- Page elements visibly jumping during load in Chrome DevTools mobile simulation
- Lighthouse CLS score above 0.1
- Images loading without a skeleton/blur placeholder (blank white space on dark background)

**Phase to address:** Core gallery build phase. CLS prevention must be baked into the initial image component architecture — retrofitting it later requires touching every image render.

---

### Pitfall 3: The Dark Aesthetic Breaking Legibility and Accessibility

**What goes wrong:**
Dark moody designs frequently fail WCAG contrast requirements. The most common failure modes for this specific project: metadata text (title, medium, description) in a muted gray over near-black background falls below the 4.5:1 contrast ratio minimum; form inputs (contact form) have invisible borders on dark backgrounds; focus outlines (critical for keyboard/mobile navigation) vanish entirely.

Additionally, pure black (#000000) backgrounds paired with bright white text create "halation" — text appears to glow or bleed, causing eye fatigue. This makes longer text sections (bio, artwork descriptions) unpleasant to read.

**Why it happens:**
Designers eyeball contrast in Figma under good monitor conditions, which doesn't match what shop owners see on a budget Android phone in overhead fluorescent lighting. The European Accessibility Act (in force June 2025) has also raised legal stakes.

**How to avoid:**
- Use `#111111` or `#141414` as base background, not `#000000`.
- Target 7:1 contrast for body text (exceeds WCAG AA, provides legibility buffer for dim screens).
- Use a tool like [Contrast Ratio Checker](https://webaim.org/resources/contrastchecker/) on every text/background color pair during the design token phase.
- Define a design token system upfront: `--color-surface`, `--color-text-primary`, `--color-text-muted` — and verify all tokens pass contrast before using them anywhere.
- Focus rings: use `outline: 2px solid #c0a060` (warm gold works beautifully against dark) rather than removing focus outlines.

**Warning signs:**
- Any gray text on dark background without contrast verification
- Form inputs that "float" without visible borders or underlines
- CSS `outline: none` or `outline: 0` anywhere without a custom replacement
- Muted color descriptions for artwork metadata ("low-key, subtle" = failing contrast)

**Phase to address:** Design system / component foundation phase. Lock color tokens with verified contrast ratios before any UI components are built.

---

### Pitfall 4: Animated Intro Blocking Mobile Entry on Slow Connections

**What goes wrong:**
The QR code → phone scenario means users arrive on cellular data (not WiFi), often 4G or LTE with variable signal in a tattoo shop. A JavaScript-heavy animated intro (GSAP timelines, canvas animations, complex CSS keyframes) that requires 300-600KB of JS to hydrate before playing will appear as a black screen for 2-5 seconds — then suddenly dump the user into an animation they can't skip. First impression: broken.

A secondary failure: animations designed on desktop hardware play at 60fps in development but drop to 15fps on mid-range Android phones due to GPU-intensive properties (filter, box-shadow, complex gradients animating).

**Why it happens:**
Developers test animations on their own machine using WiFi. GSAP and similar libraries feel lightweight (GSAP core is ~35KB) but the real cost is JS parse/execution time on low-end mobile CPUs, not transfer size.

**How to avoid:**
- Animate only `transform` and `opacity`. Never animate `filter`, `box-shadow`, `background-color`, `width`, or `height` in the intro sequence.
- Keep the intro animation under 2.5 seconds total. Include a visible skip mechanism after 1 second.
- Use CSS animations for the intro frame rather than JavaScript where possible — CSS animations run on the compositor thread and don't block the main thread.
- Respect `prefers-reduced-motion`: wrap all intro animations in a media query check and skip directly to the gallery for users who have motion sensitivity.
- Test on a mid-range Android device (or Chrome DevTools CPU throttling 4x) before finalizing the animation.

**Warning signs:**
- Intro animation requires a JS bundle load before any visual appears
- Using `filter: blur()`, `box-shadow`, or `clip-path` in animation keyframes
- No skip mechanism exists
- Animation not tested on mobile hardware

**Phase to address:** Intro animation phase. Animation constraints must be defined before implementation begins, not discovered when it's already built.

---

### Pitfall 5: Admin Panel Security — Exposed API Routes Without Auth Checks

**What goes wrong:**
The admin panel is password-protected on the frontend, but the underlying API routes (for uploading images, editing bios, deleting pieces) are not independently authenticated. Someone who finds the API endpoint (trivial with browser DevTools) can call it directly without the UI password check, silently deleting or replacing content.

**Why it happens:**
Frontend-only password protection feels sufficient for a personal site. The mental model is "nobody will find it" — but portfolio sites often get scraped, and API routes are discoverable.

**How to avoid:**
- Protect every admin API route with server-side session/token validation. Never rely on frontend route protection alone.
- Use NextAuth.js (credentials provider) or a simple JWT-based session — verify the session token in every `/api/admin/*` route handler before executing any write operation.
- Rate-limit the login endpoint to prevent brute-force attacks (3 failed attempts = 15-minute lockout).
- Store the admin password as a bcrypt hash in environment variables, never in plaintext or in the database.

**Warning signs:**
- API routes at `/api/admin/upload`, `/api/admin/delete` etc. return 200 with no auth header present
- The only "protection" is a client-side redirect to a login page
- Login form submits plaintext password directly to API

**Phase to address:** Admin panel phase, before any admin functionality ships to production.

---

### Pitfall 6: Image Upload Without Processing — Raw Files Stored and Served

**What goes wrong:**
Anna uploads photos of her artwork from her phone camera (12-48MP JPEG, 5-15MB each). These files are stored raw in Vercel Blob or similar. When a gallery visitor loads the page, their phone downloads a 12MB JPEG. Page becomes unusable. Vercel Blob egress counts against the 100GB free bandwidth.

**Why it happens:**
MVP instinct is to wire upload → store → display as quickly as possible and "optimize later." But with an image portfolio, raw upload = broken product from day one.

**How to avoid:**
- Process images at upload time in the admin panel, before storage. Use Sharp (server-side Node.js) in the upload API route to:
  1. Resize to a maximum of 2400px on the longest side
  2. Convert to WebP
  3. Target ≤300KB output
  4. Generate a tiny blur placeholder (32x32 WebP) for the `blurDataURL`
- Store the processed WebP + the blur placeholder, not the original.
- Optionally keep the original in a separate "originals" folder for Anna's own records, but never serve it to visitors.

**Warning signs:**
- Upload API stores `req.file.buffer` directly without any Sharp/image processing step
- Gallery images served as `image/jpeg` at original camera resolution
- No blur placeholder data being generated at upload time

**Phase to address:** Admin upload feature, first iteration. Image processing pipeline must be in place before the first image is stored.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing raw camera uploads | Faster admin upload implementation | Huge bandwidth costs, broken mobile UX, Vercel optimization quota exhausted immediately | Never |
| Frontend-only admin auth | Simpler to build | API routes publicly writable | Never |
| Hardcoding gallery image dimensions | Faster initial build | Layout shift on every image, brittle when image sizes change | Never |
| Pure CSS-only animations (no GSAP) | No library dependency | Fewer animation capabilities | Acceptable for MVP intro |
| Skipping `blurDataURL` placeholder | Less build complexity | Jarring image pop-in on slow mobile connections | Only for above-fold hero if color placeholder is used instead |
| Deploying contact form without spam protection | Faster launch | Inbox flooded with bot submissions within days | Only if accepting 100% spam initially for a day-one soft launch |
| No `prefers-reduced-motion` check | Simpler animation code | Accessibility failure, potential nausea trigger for motion-sensitive users | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Cloudinary free tier | Using auto-format delivery without tracking credit usage — credits reset monthly but bulk uploads eat them fast | Upload processed WebP originals; use Cloudinary only for CDN delivery and responsive sizing, not for format conversion of raw originals |
| Contact form (Resend/SendGrid) | Using the domain's own email as sender without SPF/DKIM → lands in spam | Use a dedicated transactional email service (Resend free: 3,000 emails/month); verify the sending domain with DNS records |
| Contact form | No honeypot or rate limiting → spam flood within hours of going live | Add a hidden honeypot field + Cloudflare Turnstile (free) or reCAPTCHA v3 |
| QR code generation | Generating a QR code pointing to the Vercel preview URL (`.vercel.app`) — preview deployments are deleted or change URLs | Point QR code to a custom domain or at minimum the stable production deployment URL |
| NextAuth.js credentials provider | Storing session in cookie without `httpOnly: true` and `secure: true` in production | Use NextAuth default session config which sets these correctly; verify production cookies in DevTools |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all gallery images at once (no virtualization/pagination) | Smooth in dev with 5 images; laggy at 50+ images | Implement pagination or virtual scrolling for gallery; load 12-16 images initially | Typically noticeable at 20+ images on mobile |
| GSAP imported globally (full library) | Intro animation works fine but 200KB+ of unused GSAP modules loaded | Import only needed GSAP modules: `import { gsap } from 'gsap'` + specific plugins only | Always — unnecessary weight from first deploy |
| Unset `priority` on above-fold hero image | Hero image loads after below-fold content, hurting LCP score | Set `priority={true}` on the single hero/intro image; never set it on gallery thumbnails | Always visible in Lighthouse LCP audit |
| CSS `transition: all` on dark theme hover states | Hover states stutter on complex components because all CSS properties animate | Only transition specific properties: `transition: opacity 0.2s, transform 0.2s` | Mobile mid-range devices, immediately |
| Serverless function cold starts for admin operations | Admin panel feels broken — first upload or save takes 8-12 seconds | Keep admin API handlers lightweight; consider edge runtime for simple read operations | Every cold start on Vercel Hobby |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Plaintext admin password in environment variable | Leaked .env file or misconfigured Vercel exposes password | Hash with bcrypt at startup; compare hash in login handler |
| No rate limiting on admin login route | Brute-force password attack succeeds in minutes against simple passwords | Implement login attempt rate limiting (e.g., 5 attempts per IP per 15 minutes) using an in-memory store or Vercel Edge middleware |
| File upload without MIME type validation | Attacker uploads a PHP/JS file disguised as a JPEG | Validate file magic bytes server-side (not just Content-Type header); accept only `image/jpeg`, `image/png`, `image/webp` |
| Contact form "send copy to sender" feature | Can be weaponized as an email relay for spam campaigns | Do not implement "send copy to submitter" functionality; log submissions to database instead |
| Admin session token in localStorage | XSS attack steals token permanently | Use `httpOnly` cookies for session tokens — they are inaccessible to JavaScript |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visible skip on intro animation | Shop owner in a hurry gets trapped in 3-second animation and closes the tab | Add a "skip" button that appears after 1 second, or make any tap/click skip the animation |
| Gallery filtering with page reload | Filtering by category causes full page reload — feels sluggish and breaks scroll position | Client-side filtering with CSS show/hide or React state; no navigation |
| Artwork description hidden behind extra tap | Shop owners scan quickly — if they have to tap to expand description, most won't | Show title + medium on hover/focus; show description in an accessible panel; make it readable at a glance |
| No loading state in admin panel | Anna uploads an image, sees nothing happen for 5 seconds, clicks again creating duplicates | Show upload progress bar; disable submit button after first click |
| Contact form with no confirmation message | Visitor submits form and sees blank page — did it work? They submit again | Show clear inline success/error message without redirecting away |
| Gallery images without consistent aspect ratio treatment | Mixed landscape/portrait images create jagged grid that looks unprofessional | Fix all gallery thumbnails to a consistent aspect ratio (e.g., 4:3 or 1:1) using `object-fit: cover`; full image visible in lightbox |

---

## "Looks Done But Isn't" Checklist

- [ ] **Gallery performance:** Images display correctly in dev with 5 pieces — verify with 50+ pieces on a throttled mobile connection before calling gallery complete
- [ ] **Admin auth:** Login page exists and redirects correctly — verify that admin API routes (`/api/admin/*`) reject unauthenticated requests independently
- [ ] **Contact form:** Form submits without error in dev — verify emails actually arrive in Anna's inbox AND don't land in spam; test from a real phone on cellular
- [ ] **QR code:** QR code scans and opens site — verify it points to the production URL (not a preview URL) and that the URL doesn't change on next deploy
- [ ] **Intro animation:** Animation plays in Chrome on MacBook — verify CLS score, frame rate on mid-range Android (Samsung Galaxy A-series equivalent), and `prefers-reduced-motion` behavior
- [ ] **Image optimization:** Images look great in dev — verify Vercel image optimization quota usage after uploading the full gallery, and that images load fast on 4G throttling
- [ ] **Dark mode contrast:** Design looks good on a calibrated monitor — run every text/background combination through a contrast checker and verify on a phone screen outdoors
- [ ] **Admin image upload:** Upload completes successfully in dev — verify Sharp processing runs, WebP is stored (not raw JPEG), and blur placeholder is generated

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Vercel image optimization quota hit | MEDIUM | Switch `next/image` to Cloudinary loader; update `next.config.js` remotePatterns; migrate existing stored images to Cloudinary |
| CLS discovered post-launch | MEDIUM | Audit every `next/image` usage; add explicit dimensions or aspect-ratio containers; add `placeholder="blur"` |
| Raw images in storage (no processing) | HIGH | Write a one-time migration script to re-process all stored images through Sharp; update all stored URLs; verify gallery |
| Admin API routes publicly accessible | HIGH | Add middleware authentication check to all `/api/admin/*` routes; rotate the admin password; review Vercel logs for unauthorized access |
| QR code pointing to wrong URL | LOW | Reprint/reissue QR codes; update QR code to stable URL before printing any physical materials |
| Contact form spam flood | LOW | Add Cloudflare Turnstile; implement server-side rate limiting; filter existing spam from inbox |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vercel image optimization exhaustion | Phase: Image infrastructure setup (before gallery) | Verify Cloudinary integration works for upload + CDN delivery; check no `next/image` default optimizer is used |
| CLS on mobile gallery | Phase: Core gallery component build | Run Lighthouse on mobile profile; CLS score must be ≤0.1; test blur placeholders display correctly |
| Dark design contrast failures | Phase: Design system / component tokens | All color token pairs verified with contrast checker; documented in design system |
| Intro animation blocking mobile | Phase: Intro animation | Test on CPU-throttled Chrome; animate only `transform`/`opacity`; skip mechanism exists |
| Admin API routes without auth | Phase: Admin panel backend | Automated test: call admin API route without session token; must return 401 |
| Raw image storage | Phase: Admin upload feature | Upload a 5MB JPEG; verify stored file is WebP ≤300KB; verify blur placeholder exists |
| Contact form spam | Phase: Contact form feature | Honeypot field present; rate limiting active; email delivery confirmed to Anna's inbox |
| QR code wrong URL | Phase: Deployment / launch preparation | QR code scanned and confirmed pointing to production domain, not preview URL |

---

## Sources

- Vercel Limits (official, verified March 2026): https://vercel.com/docs/limits — Image Optimization Source Images: 1,000/month on Hobby plan confirmed
- Next.js Image Optimization Common Mistakes (Pagepro, 2025): https://pagepro.co/blog/common-nextjs-mistakes-core-web-vitals/
- Next.js Image Optimization Complete Guide (BetterLink, December 2025): https://eastondev.com/blog/en/posts/dev/20251219-nextjs-image-optimization/
- Web.dev CLS documentation (Google): https://web.dev/articles/cls
- Portfolio Mistakes Designers Still Make in 2026 (Muzli): https://muz.li/blog/portfolio-mistakes-designers-still-make-in-2026/
- Dark Mode Accessibility Guide (AccessibilityChecker.org, 2025): https://www.accessibilitychecker.org/blog/dark-mode-accessibility/
- WCAG Contrast Requirements verified: https://webaim.org/articles/contrast/
- Tattoo Website Mobile Optimization (OpenPR, 2025): https://www.openpr.com/news/4168918/why-your-tattoo-website-design-must-be-optimized-for-smartphones
- GSAP In Practice: Avoid The Pitfalls (marmelab, 2024): https://marmelab.com/blog/2024/05/30/gsap-in-practice-avoid-the-pitfalls.html
- Contact Form Spam Attack Case Study (Sucuri, 2025): https://blog.sucuri.net/2025/10/contact-form-spam-attack-an-innocent-feature-caused-a-massive-problem.html
- Tattoo Apprenticeship Portfolio Guide (Certified Tattoo Academy, 2025): https://www.certifiedtattooacademy.com/blog/tattoo-apprenticeship-portfolio
- Portfolio Website Security (louispretorius.com): https://louispretorius.com/web-design/portfolio-websites/portfolio-website-security/

---
*Pitfalls research for: Anna Blomgren tattoo artist portfolio (mobile-first, image-heavy, dark aesthetic, QR code entry, free hosting)*
*Researched: 2026-03-13*
