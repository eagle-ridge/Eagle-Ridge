# Eagle Ridge Advisory — eagleridge.io

**Astro + [EmDash CMS](https://github.com/emdash-cms/emdash) site in `site/`, deployed as a Cloudflare Worker** (`eagleridge`, D1 `eagleridge-emdash` + R2 `eagleridge-media`). Migrated from static Cloudflare Pages per [plans/006-migrate-to-emdash.md](plans/006-migrate-to-emdash.md) — check that plan's Phase 2 checklist for cutover status. The live site is built **entirely** from `site/src/` — `site/` is the only source of truth; EmDash CMS content (admin at `/_emdash/admin`) lives in D1. All pre-existing pages are prerendered (`export const prerender = true`) — keep that flag on new static pages or they silently leave the md-mirror/parity pipeline. The legacy parallel root-HTML site was removed 2026-06-18; recover from git history if ever needed.

## Deploy — automated via GitHub Actions

Pushes to `main` that touch `site/**` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the Astro site (bundling `site/src/worker.ts`) and runs `wrangler deploy` — wrangler follows `site/.wrangler/deploy/config.json` to the build-emitted `site/dist/server/wrangler.json` (Worker + D1/R2/assets bindings; static assets from `site/dist/client`). Nothing rebuilds on the Cloudflare side by itself; the Action is what deploys. Repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` drive it. EmDash schema migrations apply automatically at runtime after deploy.

### Manual deploy / local repro

```bash
npm install --prefix site
env -C site npx astro build
env -C site uv run --with markdownify==1.2.2 --with beautifulsoup4==4.14.3 \
  python scripts/generate-md-mirrors.py            # regenerates site/dist/client/*.md + sitemaps
# (npm run build does astro build + the generator, but needs the python deps installed)

env -C site npx wrangler dev        # full local runtime (Worker + local D1/R2 sims)

CF_TOKEN=$(op item get "Dash Cloudflare API Credential" --vault "Developer Vault" --fields credential --reveal)
CLOUDFLARE_API_TOKEN="$CF_TOKEN" CLOUDFLARE_ACCOUNT_ID=702342b70e150343381e0829834cbcc7 \
  env -C site npx wrangler deploy
```

### Cloudflare facts

- Account `702342b70e150343381e0829834cbcc7`; zone `eagleridge.io` = `064d7b70f67f32d15f2afbeb10a915f6`.
- API token: `op://Developer Vault/Dash Cloudflare API Credential/credential` (historically Zone DNS edit + Pages edit; the Workers migration needs Workers Scripts/D1/R2 edit added — see plan 006 phase 2).
- DNS: apex `eagleridge.io` + `www` are proxied CNAMEs; custom domains attach to the `eagleridge` Worker after cutover (previously the `eagleridge` Pages project → `eagleridge-7z4.pages.dev`).
- `site/wrangler.jsonc` is the config wrangler + the Astro adapter read; the D1 `database_id` in it is a placeholder until phase-2 provisioning.
- Legacy GitHub Pages (root HTML / `CNAME` / `.nojekyll`) is retired and no longer served; the root files were removed 2026-06-18 (see intro). Recover from git history if ever needed.

## Files & structure (all under `site/`)

| Path | Purpose |
|------|---------|
| `site/src/pages/*.astro` | Routes, all `prerender = true`. `index`, `about`, `contact`, `market-map`, `nobody-built-the-first-mile` (First Mile), `compliance-should-just-work` (Manifesto), `glossary`, `privacy`, `insights` (hub) + `insights/[...slug]`, `404` (served with real 404 status — do not add to PAGES/llms.txt, it's noindex) |
| `site/src/worker.ts` | Cloudflare Worker entry (`wrangler.jsonc` `main`): legacy-URL 301s → markdown content negotiation → EmDash/Astro handler; plus the EmDash `scheduled()` cron handler |
| `site/src/lib/negotiation.js` | Markdown content negotiation (`Accept: text/markdown` → serves the `.md` mirror with `Vary: Accept`; 406 for unsupported types) + markdown 404 bodies; `/_emdash/*` and other `/_*` runtime routes exempt. Unit-tested by `site/scripts/middleware.test.mjs` (`npm test`) |
| `site/src/lib/redirects.js` | Parses `public/_redirects` (still the source of truth) into Worker-issued 301s — under `run_worker_first` the asset layer no longer surfaces them. Tested by `site/scripts/redirects.test.mjs` |
| `site/wrangler.jsonc` | Worker config (D1 `DB`, R2 `MEDIA`, crons, `run_worker_first`). The Astro build merges it into `dist/server/wrangler.json`, which `wrangler deploy`/`dev` use |
| `site/src/live.config.ts` | EmDash live-collection loader (`getEmDashCollection`); coexists with file-based `src/content.config.ts` |
| `site/scripts/verify-agent-readiness.mjs` | Post-build gate (`npm run check:agent-readiness`): 404 page, homepage metadata/schema, contact page, llms.txt when-to-use section, sitemap coverage. Runs in both workflows |
| `site/src/layouts/BaseLayout.astro` | Shared `<head>` (meta, canonical, favicon links, PostHog snippet) + page chrome |
| `site/src/components/` | `Header.astro` (nav incl. Resources dropdown), `Footer.astro`, `ContactForm.astro` |
| `site/src/content/` | Content collections: `pages` + `articles` (Insights hub) |
| `site/src/styles/` | `tokens.css` (brand `--er-*` design tokens) + `global.css` (chrome, nav/dropdown, layout) |
| `site/public/` | Static passthrough: `favicon.svg`/`favicon.ico` (eagle mark), `logo.png`, `eagle-ridge-mark.png`, `AGENTS.md`, `robots.txt`, `_redirects` (old `.html` → clean URLs), `_headers` |
| `site/public/llms.txt` | LLM-readable site summary ([llmstxt.org](https://llmstxt.org/) standard) — update when pages/services change |
| `site/scripts/generate-md-mirrors.py` | Post-build: emits per-page `.md` mirrors + sitemaps into `dist/client/`. Runs as part of `npm run build`; locally needs `uv run --with markdownify --with beautifulsoup4 python scripts/generate-md-mirrors.py` from `site/` |
| `parity-baseline/*.md` (repo root) | **Live** — CI parity oracle. Every built `.md` mirror must byte-match its baseline (after stripping nav/footer/chrome). Do not move. |
| `.github/workflows/deploy.yml` | Builds `site/` + `wrangler deploy` (Worker) on push to `main` touching `site/**` |
| `.github/workflows/validate-llms-txt.yml` | PR check: llms.txt structure, URL liveness, and `.md`-mirror parity vs `parity-baseline/` |

## Do NOT Touch (during routine site edits)

- `README.md`, `DOMAIN_REPUTATION_GUIDE.md`
- Logo files

## Integrations

### PostHog Analytics
- **Snippet**: In `<head>` of all pages (loads async, non-blocking)
- **Project token**: `phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg` (public, safe in HTML)
- **Project ID**: `209232`
- **API key**: `op://Private/PostHog MCP/credential` (use 1Password, never hardcode)
- **Host**: `https://us.i.posthog.com`

> **Note:** The homepage hero A/B test (experiment `eagle-ridge-homepage-hero-experiment` / flag `hero-variant`) was **retired June 2026**. The hero is now a single static message ("Win the contract. Be ready to pass."). The variant markup, `.hero-variant` hide-CSS, and `onFeatureFlags` routing JS were removed from `index.html`. The PostHog experiment/flag can be archived in the dashboard; no live code references it.

### Web3Forms Contact Form
- **Access key**: `3e6cb410-9c3a-4af7-9a6a-dbf012e8d8a1` (safe in HTML, tied to account)
- **Endpoint**: `https://api.web3forms.com/submit` (submitted via `fetch()`, stays on page)
- **Subject**: "New Lead for Eagle Ridge"
- **Spam prevention**: Hidden honeypot checkbox (`botcheck`)
- **Anchor**: `id="contact-form"` for deep links

### Discovery Page (Cal.com booking + Web3Forms fallback)
`site/src/pages/discovery.astro` — an unlisted lead landing page. **Primary action:
self-serve booking via a Cal.com inline embed; fallback below: a minimal Web3Forms
intake** for leads not ready to pick a time. The Feb-2026 Tally plan was reversed
2026-06-18 to Web3Forms (same service as the contact form); the Tally embed was
never built.
- **Page:** `eagleridge.io/discovery` — unlisted (`noindex, nofollow` via the
  `BaseLayout` `noindex` prop), shared via direct URL with clients. Not in any nav.
  Unlisted by convention only — the mirror/sitemap generator's `PAGES` allowlist
  doesn't include `discovery`, so no `.md` mirror and no sitemap row.
- **Booking (primary):** Cal.com inline embed (official vanilla snippet, no API/key
  in page), event `chris-mcconnell/eagle50` (50-min call). Cal collects name/email
  and sends the invite. A `bookingSuccessful` callback fires a `discovery_call_booked`
  PostHog event. To change the call, edit the `calLink` in `discovery.astro`.
- **Form (fallback):** 3 required fields (name, email, company) + 1 optional ("what
  are you pursuing?"). Deeper intake is gathered later by a separate enrichment flow,
  not here. Submits via `fetch()` to `https://api.web3forms.com/submit`, honeypot
  `botcheck`, stays on page.
- **Access key:** `3e6cb410-9c3a-4af7-9a6a-dbf012e8d8a1` (shared with the contact
  form). **Hidden `subject`: "New Discovery Intake — Eagle Ridge"** so intake
  leads are distinguishable from contact leads in the inbox.
- **Shared quota:** both forms share the Web3Forms free-tier 250 submissions/month
  budget. A spam burst on the (leakable) discovery URL can exhaust it and silently
  drop real leads. Cloudflare Turnstile follow-up: issue #46.
- **Tracking event:** `discovery_page_viewed` (inline PostHog capture).

## Audience

Primary buyer persona: **small-business CEOs** — founder-led teams without a dedicated
security/compliance function who need CMMC, SOC 2, or ISO 27001 to win or keep government
and enterprise contracts.

Positioning is **GRC readiness**: we take companies through the full readiness lifecycle
(gap assessment → remediation → SSP → SPRS → evidence → ConMon) so they're prepared before
they're assessed. Key framing: a C3PAO cannot perform readiness AND the assessment for the
same client, so Eagle Ridge is the upstream readiness partner, not a competitor to assessors.

Copy guidance: lead with plain language for the CEO (avoid jargon like "GRC", "remediation",
"POA&M" in headline copy); "GRC readiness" is fine as a category label in service/SEO copy and
in partner/industry contexts. PE/VC and due-diligence framing was removed June 2026 — do not
reintroduce it without direction.

## Dev Workflow

```bash
npm install --prefix site          # first time
npm run dev --prefix site          # local dev server (Astro + EmDash, hot reload, local D1/R2)
                                   # EmDash admin: http://localhost:4321/_emdash/admin
npm run build --prefix site        # astro build (worker + prerendered pages) + md-mirror/sitemap generation
env -C site npx wrangler dev       # production-shaped runtime against dist/ (negotiation, 301s, 404s)
# Test contact form: submit manually in browser (Web3Forms blocks server-side requests)
```

## Plans (`plans/`)

- Filenames: `<hex>-<slug>.md`, hex ID is 3 lowercase digits (`004`, `005` … `009`, `00a`, `00b` … `0ff`).
- Next ID = 1 + the highest ID across `origin/main` AND every open PR (`gh pr list`), not just your checkout. Two branches picking the same number is how 004 collided.
- Never renumber a merged plan.
