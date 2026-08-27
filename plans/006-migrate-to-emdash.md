# 006 — Migrate to EmDash CMS

**Status:** Phase 1 implemented (this PR). Phase 2 (production cutover) needs
owner-side Cloudflare provisioning — checklist below. Phase 3 (content into
the CMS) follows after cutover.

**What:** Adopt [EmDash](https://github.com/emdash-cms/emdash) (v0.35.0, beta) —
a full-stack TypeScript CMS built as an Astro integration — so site content can
be managed through an admin UI (`/_emdash/admin`) instead of code-only edits.
EmDash serves content at request time, which forces the platform change this
plan stages: Cloudflare **Pages (static)** → Cloudflare **Workers (server
output + prerendered static assets)**.

## Phase 1 — in this PR (verified locally)

- `site/` builds with `output: 'server'` + `@astrojs/cloudflare` (v13, the
  Astro 6 line — Astro stays at 6.4.5 so the parity-locked HTML is byte-stable)
  + `react()` + `emdash()` (D1 database binding `DB`, R2 media binding `MEDIA`).
- **Every pre-existing page sets `export const prerender = true`** — static
  HTML still emits (now under `dist/client/`), so the md-mirror generator,
  parity oracle, agent-readiness gate, and llms.txt checks all still run and
  pass byte-identical against `parity-baseline/`. Only EmDash routes
  (`/_emdash/*`) render on demand.
- Markdown content negotiation moved from the Pages Function
  (`site/functions/_middleware.js`) into the Worker entry:
  `site/src/worker.ts` wraps the EmDash/Astro handler with the same
  `onRequest` logic, now in `site/src/lib/negotiation.js` (same unit tests,
  plus `/_emdash/*` + `/_image` exemptions). `run_worker_first: true` in
  `wrangler.jsonc` routes requests through the Worker so negotiation still
  sees extensionless page URLs.
- Legacy-URL 301s: with the Worker first, the asset layer no longer surfaces
  `_redirects` (the internal `ASSETS.fetch` follows them silently), so
  `src/worker.ts` issues them itself via `src/lib/redirects.js`, parsing
  `public/_redirects` at build time (`?raw` import). `public/_redirects`
  stays the single source of truth. Unit tests in `scripts/redirects.test.mjs`.
- Deploy workflow rewritten: `wrangler pages deploy dist` → `wrangler deploy`
  (Worker + assets from the build-emitted `dist/server/wrangler.json`).
- Verified with `wrangler dev` (local D1/R2): negotiation (200 md / html
  Vary / 406 / md+html 404s), legacy 301s incl. query strings, `_headers`
  (nosniff, DENY, immutable `_astro/`), nested article routes, sitemaps,
  llms.txt, and the EmDash admin (`/_emdash/admin` → setup wizard, React
  app hydrates).

### Deliberately NOT in phase 1

- No content moved into EmDash yet. File-based collections
  (`src/content.config.ts`) keep rendering all pages; EmDash live collections
  (`src/live.config.ts`) coexist per EmDash's coming-from-astro guidance.
- No plugins (`worker_loaders` needs Dynamic Workers = paid plan; EmDash runs
  in safe mode without it).
- No KV object cache, no read replicas.

## Phase 2 — production cutover (owner actions)

Merging this PR alone will make the deploy workflow fail until these are done
— keep the PR open until you're ready.

1. **Provision**, from `site/`:
   `npx wrangler d1 create eagleridge-emdash` → paste the returned
   `database_id` into `wrangler.jsonc` (replacing the zeros placeholder);
   `npx wrangler r2 bucket create eagleridge-media`.
2. **Token scope:** the deploy token (repo secret `CLOUDFLARE_API_TOKEN`)
   needs Workers Scripts:Edit, D1:Edit, and R2:Edit in addition to its
   current scopes (it was Pages-scoped).
3. **First deploy:** merge (or `npx wrangler deploy` from `site/` locally).
   Schema migrations apply automatically at runtime; the DB being empty
   triggers EmDash's built-in seed. Visit
   `https://eagleridge.<subdomain>.workers.dev/_emdash/admin` and complete
   the setup wizard (passkey-first admin account) BEFORE pointing DNS —
   don't leave an unclaimed admin on the public domain.
4. **Domain move (Pages → Workers):** add custom domains `eagleridge.io` +
   `www.eagleridge.io` to the `eagleridge` Worker (dash → Workers → Settings
   → Domains & Routes), removing them from the `eagleridge` Pages project
   first. DNS records themselves stay proxied CNAMEs; Cloudflare rewires the
   targets when the custom domain attaches.
5. **Verify prod:** spot-check `curl -H "Accept: text/markdown"
   https://eagleridge.io/about`, a legacy 301 (`/about.html`), a 404, and
   `/_emdash/admin` login.
6. **Retire Pages:** once stable, delete the `eagleridge` Pages project and
   update CLAUDE.md's Cloudflare facts (already partially updated in this PR).
7. **Optional (recommended for plugins later):** paid Workers plan +
   `worker_loaders` block in `wrangler.jsonc` for sandboxed plugins.

## Phase 3 — content into the CMS (follow-up plan)

Move Insights articles (and later the prose pages) into EmDash collections so
they're editable in the admin: define an `articles` collection matching the
Zod schema, import the markdown as Portable Text, switch
`src/pages/insights/[...slug].astro` to `getEmDashCollection`. Open question
to resolve first: the md-mirror/parity pipeline reads build-time HTML, so
either CMS-served articles get mirrored at publish time (EmDash hook →
regenerate + redeploy, or an on-demand mirror route) or articles keep a
build-per-publish flow (admin edit → webhook → GitHub Action rebuild).
Decide when phase 2 is stable; parity-baseline stays the oracle either way.

## Rollback

Phase 1/2 are reversible: revert the PR (static Pages config is all in git
history) and re-attach the custom domains to the Pages project. EmDash content
lives in D1 — export before rolling back if the admin has been used.
