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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~3 | 3 | Initial project — yolo mode, quick depth, 2-day delivery |

### Cumulative Quality

| Milestone | Audit Score | Requirements | Tech Debt Items |
|-----------|-------------|-------------|-----------------|
| v1.0 | 22/23 → 23/23 | All satisfied | 3 deployment config items |

### Top Lessons (Verified Across Milestones)

1. Lock aesthetic/design decisions before execution starts
2. Human verification plans catch bugs that static analysis cannot
