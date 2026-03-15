# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-14
**Phases:** 3 | **Plans:** 9 | **Sessions:** ~3

### What Was Built
- Complete artist portfolio: ink-bleed intro, masonry gallery with tag filtering, full-res lightbox, about page, contact form
- CMS-powered admin: art piece CRUD with drag-drop reorder, image pipeline (Sharp → WebP + blur), about/contact globals, branded QR code
- Infrastructure: Next.js 15 + Payload CMS 3 + Turso SQLite on Vercel free tier

### What Worked
- **Yolo mode + quick depth**: Entire project from zero to shipped in 2 days with minimal friction
- **Phase separation**: Foundation → Admin → Public was the right order — admin data existed before public pages needed it
- **Human verification plans (02-03, 03-04)**: Catching real bugs (hero image null guard, Resend module crash) before they shipped
- **Payload CMS**: Eliminated custom auth, CRUD, and admin UI work — massive time savings
- **Sharp at ingest**: WebP + blur pipeline runs once per upload, zero runtime cost

### What Was Inefficient
- **Phase 1 palette divergence**: CONTEXT.md specified warm browns, implementation used cold graphite. VERIFICATION caught it, but the fix was "user approves cold" — the initial context gathering should have locked this earlier
- **Turso CLI on Windows**: Multiple install methods failed. Should have started with the web dashboard
- **create-payload-app TTY failure**: Manual scaffold worked but took extra time. Known limitation of non-interactive shells
- **SUMMARY frontmatter inconsistency**: Several SUMMARYs missing `requirements-completed` or `one_liner` fields — made audit extraction harder

### Patterns Established
- Route groups: `(frontend)` for public, `(payload)` for CMS admin
- Design tokens: all in `@theme` block in globals.css, consumed via Tailwind utilities
- Payload Local API with `overrideAccess: true` in server components for public data reads
- Client-side state for filtering (keep server components stateless/cacheable)
- Conditional Vercel Blob plugin for dev/prod environment parity

### Key Lessons
1. Lock aesthetic decisions (warm vs cold palette) during project init, not during execution — avoids verification false positives
2. Payload CMS handles 80% of admin functionality out of the box — invest planning time in the 20% that's custom (image pipeline, QR code, featured warnings)
3. Human verification plans are worth the overhead — they caught 2 real bugs that static analysis missed
4. Windows CLI tooling (Turso, create-payload-app) frequently fails — prefer web dashboards and manual setup

### Cost Observations
- Model mix: ~60% sonnet (execution), ~30% opus (planning/auditing), ~10% haiku (exploration)
- Sessions: ~3 (foundation, admin+public execution, milestone completion)
- Notable: Phases 2-3 averaged 4-6 min per plan — faster than Phase 1 (23 min avg) because scaffold was done

---

## Milestone: v1.1 — Dark & Dangerous

**Shipped:** 2026-03-15
**Phases:** 4 | **Plans:** 8 | **Sessions:** ~2

### What Was Built
- Atmospheric foundation: film grain noise overlay, vignette edge-darkening, commanding Bodoni Moda typography tokens
- Gallery interactions: scroll-reveal stagger, compound hover (scale + shadow + gradient), 3D cursor-tracking tilt parallax with touch fallback
- Enhanced intro: thick ink strokes with SVG displacement filter, letter-by-letter name reveal with screen reader accessibility
- Signature effects: darkroom lightbox atmosphere, page entrance stagger on About/Contact, morphing ink-stain SVG blob dividers
- Cinematic layer: ink-bleed SVG page transitions via template.tsx, ambient CSS particle drift (zero client JS server component)
- Accessibility: 9 animation systems with complete reduced-motion coverage (CSS media queries + MotionConfig + useReducedMotion guards)

### What Worked
- **Wave-based parallel execution**: Phases 6 and 7 both had Wave 1 parallel plans — 2 agents executing simultaneously cut wall-clock time nearly in half
- **Research → Plan → Verify loop**: The plan-checker caught real issues (missing key_links, scope concerns) before execution started
- **Zero new dependencies**: Entire v1.1 built with existing Motion 12.36 + CSS + SVG filters — PERF-05 (5KB gzip budget) was never at risk
- **template.tsx for transitions**: Next.js gives template.tsx a unique key per navigation — entrance-only pattern is bulletproof without AnimatePresence
- **Server component for particles**: AmbientParticles has no 'use client' — ships zero client JS while delivering visual atmosphere

### What Was Inefficient
- **SUMMARY frontmatter gaps**: Plans 05-02, 06-01, 06-02, 07-01 all shipped with empty `requirements_completed` arrays — made 3-source cross-reference harder during audit
- **IntroAnimation exit fade deferred but not delivered**: Phase 7 was supposed to restore the exit fade (removed in Phase 4). The plan noted it but the executor didn't implement it — the dead `exit={{ opacity: 0 }}` prop remains
- **No CONTEXT.md for any phase**: All 4 phases planned without discuss-phase — design preferences defaulted to research + requirements only. No issues arose, but if the aesthetic had been wrong, there was no gate to catch it early
- **Audit ran twice**: First audit at Phase 6 completion (before Phase 7), then again after Phase 7 — could have waited for all phases to complete

### Patterns Established
- `MotionProvider` in layout.tsx wrapping `<main>` — single `MotionConfig reducedMotion="user"` covers all declarative Motion animations
- `useReducedMotion()` guards on all imperative `animate()` calls — MotionConfig doesn't reach imperative code
- CSS `@media (prefers-reduced-motion: no-preference)` wrapping entire animation blocks — particles don't exist in DOM for reduced-motion users
- `template.tsx` for route-change-triggered components (remounts per navigation); `layout.tsx` for persistent components
- Double-guard pattern: `localStorage` + `sessionStorage` to prevent false-positive animation triggers
- All decorative overlays: `pointer-events: none` + `aria-hidden="true"` + `z-index` layering with `isolation: isolate` containment

### Key Lessons
1. SUMMARY frontmatter must include `requirements_completed` — empty arrays cause "partial" status in 3-source cross-reference even when code is verified
2. template.tsx is the correct vehicle for entrance-only page transitions in App Router — confirmed by official docs and 2 GitHub issues
3. Server components can deliver visual effects with zero client JS cost — CSS keyframes + inline styles are sufficient for ambient animations
4. Plan-checker verification loop is worth the extra agent spawn — caught scope issues and missing key_links before execution
5. When removing a feature (AnimatePresence) with a promise to restore it later, create a tracked todo — otherwise it falls through the cracks

### Cost Observations
- Model mix: ~65% sonnet (research/execution/verification), ~35% opus (orchestration/auditing)
- Sessions: ~2 (phases 4-6 + audit, phase 7 + final audit + completion)
- Notable: Parallel Wave 1 execution in Phase 7 completed both plans in ~9 min wall-clock (vs ~17 min sequential)

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~3 | 3 | Initial project — yolo mode, quick depth, 2-day delivery |
| v1.1 | ~2 | 4 | Research → Plan → Verify loop, parallel wave execution, zero new deps |

### Cumulative Quality

| Milestone | Audit Score | Requirements | Tech Debt Items |
|-----------|-------------|-------------|-----------------|
| v1.0 | 22/23 → 23/23 | All satisfied | 3 deployment config items |
| v1.1 | 22/22 | All satisfied (19/22 at mid-audit) | 3 documentation items + 1 dead code |

### Top Lessons (Verified Across Milestones)

1. Lock aesthetic/design decisions before execution starts
2. Human verification plans catch bugs that static analysis cannot
3. SUMMARY frontmatter must be complete — incomplete metadata compounds across phases and makes audits harder
4. Parallel wave execution significantly reduces wall-clock time for independent plans
