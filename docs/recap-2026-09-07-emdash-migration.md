# Session Recap: eagleridge.io → EmDash CMS on Cloudflare Workers

**Date:** 2026-09-07 (work 2026-08-27 → 2026-09-04)
**Project:** Eagle-Ridge (eagleridge.io)
**PRs Merged:** #103 · **Open:** #105 (green, awaiting merge)

## What Was Built

- **Platform migration (#103, plan 006 phase 1).** The Astro 6 site moved from static Cloudflare Pages to a Cloudflare Worker running the EmDash CMS integration (D1 `eagleridge-emdash`, R2 `eagleridge-media`, admin at `/_emdash/admin`). Every existing page stays `prerender = true`, so the md-mirror generator, parity oracle, llms.txt checks, and agent-readiness gate all still run — zero drift against `parity-baseline/`. The Pages Function for markdown content negotiation became `src/lib/negotiation.js` inside `src/worker.ts`; legacy `.html` 301s are issued by the Worker from `public/_redirects` (the asset layer follows its own redirects under `run_worker_first`). `deploy.yml` now runs `wrangler deploy`.
- **Cutover so far.** D1 + R2 provisioned (R2 needed enabling in the dash), Worker live at `eagleridge.mcconnell-chris.workers.dev`, admin set up by Chris (passkey), smoke tests pass on the Worker. **eagleridge.io DNS is still on Pages** — issue #107.
- **Live blog (#105, plan 007 phase 3).** Insights articles render from EmDash at request time; `.md` mirrors and `sitemap.{xml,md}` are runtime routes; unknown slugs return the real 404 page; the Manifesto stays a code page. Seed tooling (`seed/posts/*.md` → `build:seed` → `seed.json`; `seed:local` for a fresh D1; `seed:import` for prod) and CI that boots `wrangler dev`, seeds it, and checks every llms.txt URL + sitemaps against the real Worker. Both posts imported into production with their original dates.

## Key Decisions

| Decision | Rationale |
|---|---|
| EmDash as the CMS, on Workers | The user's request; EmDash needs `output:'server'` + Workers, not Pages. Astro stays at 6.4.5 with `@astrojs/cloudflare` v13 so parity-locked HTML is byte-stable. |
| All marketing pages remain prerendered | Keeps the parity oracle and agent-readiness pipeline intact; only CMS routes render on demand. |
| Blog in **Live CMS** mode (runtime), not publish-on-deploy | Chris chose immediacy of admin edits over keeping articles in the static pipeline; mirrors/sitemaps became runtime routes to preserve the agent surface. |
| Manifesto stays a code page | 600 lines of bespoke layout; not prose. Listed via `STANDALONE`. |
| One page list (`src/data/sitemap-pages.json`) for generator + runtime sitemap | Prevents drift between Python and TS. |
| Post-deploy readiness check against the Worker | Sitemaps/articles only exist at request time; a real smoke test beats a dist check. |

## Corrections Applied

- Review (by hand, agents rate-limited): direct `.md` requests lost `ETag`/`Cache-Control` → pass the asset response through; sitemap 500 on any CMS error → log and serve static pages.
- CI caught two direct-`.md` misses local testing missed (`/insights.md`, `/insights/compliance-should-just-work.md`) → runtime hub mirror + static-mirror precedence in the Worker.

## What's Next

1. Merge #105.
2. DNS cutover Pages → Worker (#107, human steps for the domain detach), then retire the Pages project.
3. Follow-ups: #108 (import idempotency, nested `.md` 404, render tags, emdash 0.36).
