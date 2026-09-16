# 007 — Insights blog served live from EmDash (plan 006, phase 3)

**Status:** implemented on `feat/emdash-live-blog`; rollout order below.
**Decision (2026-09-03):** "Live CMS" — articles render from EmDash at
request time; publish/edit/schedule/preview in the admin show on the site
immediately, no deploy. Alternatives considered: publish-on-deploy (build-time
fetch + Action rebuild per edit) and import-only. Rejected for the extra
moving parts vs. the value of an actual CMS.

## What moves where

| Before | After |
|---|---|
| `src/content/articles/*.md` + `src/content/pages/nobody-built-the-first-mile.md` rendered by Astro content collections | EmDash `posts` collection in D1 (title, excerpt, content as Portable Text, tag taxonomy). `src/lib/insights.ts` is the read side. |
| `src/pages/insights.astro`, `insights/[...slug].astro` prerendered | Same routes, `prerender = false`, read via `getEmDashCollection` / `getEmDashEntry`, body rendered with `<PortableText>` from `emdash/ui`. Unknown slug → 404 page with a real 404 status. |
| Article `.md` mirrors written by `generate-md-mirrors.py` | `src/pages/insights/[slug].md.ts` renders the mirror at request time from the same Portable Text (`portableTextToMarkdown` from `emdash/client`). The Worker's negotiation layer falls back to this route (`renderMirror`) when no static mirror exists. |
| `sitemap.xml` / `sitemap.md` written by the generator | `src/pages/sitemap.{xml,md}.ts` at request time: static pages from `src/data/sitemap-pages.json` (now also the generator's PAGES source) + EmDash articles + the standalone essay. Same format as before. |
| The Manifesto (`insights/compliance-should-just-work.astro`) | Unchanged: a 600-line custom-layout page, stays code + prerendered. Listed via `STANDALONE` in `src/lib/insights.ts`. |
| `parity-baseline/` | Unchanged — it never held Insights entries (they were auto-discovered). |

Seed: `seed/posts/*.md` → `npm run build:seed` → `seed/seed.json`
(`package.json#emdash.seed`, version must be the string `"1"` for emdash 0.35)
+ `seed/import/*.json`. On an empty, un-set-up database (local `wrangler dev`,
CI — never production) EmDash's runtime auto-seed applies the **schema only**
(`includeContent` is false there); `npm run seed:local` then applies the
content with the CLI straight into the local D1 sqlite file
(`better-sqlite3` is a devDependency for that). Seeded posts get
`publishedAt = now` — cosmetic for local/CI; prod keeps real dates via the
import. Never hand-edit `seed.json`.

CI: PR check boots `wrangler dev` on the built output and runs the llms.txt URL
liveness + agent-readiness checks (sitemaps, articles) against it, then the
parity oracle exactly as before. Deploy runs the readiness check against the
deployed Worker after `wrangler deploy` (`SITE_URL=…workers.dev`).

## Rollout (in this order)

1. **Import content into production first** — DONE 2026-09-03 (both posts published with original dates; tag terms cmmc/readiness/market created) (so the moment the new code
   deploys, `/insights` is populated): from `site/`,
   `npx emdash login --url https://eagleridge.mcconnell-chris.workers.dev`
   (OAuth device flow; approve in the browser as the admin), then
   `EMDASH_URL=https://eagleridge.mcconnell-chris.workers.dev npm run seed:import`
   which creates the tag terms and POSTs `seed/import/*.json` with the
   original `publishedAt` dates. Idempotent by slug. Verify in the admin
   under Posts.
2. Merge the PR → deploy → post-deploy readiness check green.
3. Verify: `/insights`, both article URLs, their `.md` mirrors with
   `Accept: text/markdown`, `/sitemap.xml` lists them, unknown slug → 404.
4. Then the plan-006 phase-2 domain move (Pages → Worker).

## After cutover

- Author in the admin. Markdown paste works; the editor stores Portable Text.
- `seed/posts/` is not kept in sync with prod by anything. Refresh it when the
  local/CI fixture should change (`npm run build:seed`), not per post.
- Tags exist as a taxonomy but aren't rendered on the site yet.
- Scheduled publishing needs the two Cron Triggers in `wrangler.jsonc`
  (already there).
