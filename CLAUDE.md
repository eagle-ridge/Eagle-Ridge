# Eagle Ridge Advisory — eagleridge.io

**Astro site in `site/`, hosted on Cloudflare Pages** (project `eagleridge` → `eagleridge-7z4.pages.dev`). DNS cut over from GitHub Pages on 2026-06-13. The live site is built from `site/src/`; the legacy root-HTML site was deleted in the cleanup PR (recover from git history if ever needed — see `MIGRATION-NOTES.md`).

## Deploy — automated via GitHub Actions

Pushes to `main` that touch `site/**` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the Astro site and uploads `site/dist` to the `eagleridge` Pages project via `wrangler`. **The Pages project is direct-upload, NOT git-connected** — Cloudflare does not rebuild on push by itself; the Action is what deploys. Repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` drive it.

### Manual deploy / local repro

```bash
npm install --prefix site
env -C site npx astro build
env -C site uv run --with markdownify==1.2.2 --with beautifulsoup4==4.14.3 \
  python scripts/generate-md-mirrors.py            # regenerates site/dist/*.md + sitemaps
# (npm run build does astro build + the generator, but needs the python deps installed)

CF_TOKEN=$(op item get "Dash Cloudflare API Credential" --vault "Developer Vault" --fields credential --reveal)
CLOUDFLARE_API_TOKEN="$CF_TOKEN" CLOUDFLARE_ACCOUNT_ID=702342b70e150343381e0829834cbcc7 \
  env -C site npx wrangler pages deploy dist --project-name eagleridge --branch main
```

### Cloudflare facts

- Account `702342b70e150343381e0829834cbcc7`; zone `eagleridge.io` = `064d7b70f67f32d15f2afbeb10a915f6`.
- API token: `op://Developer Vault/Dash Cloudflare API Credential/credential` (Zone DNS edit + Pages edit). The older `Cloudflare Worker API` item is Workers-scoped and will NOT work for DNS/Pages.
- DNS: apex `eagleridge.io` + `www` are proxied CNAMEs → `eagleridge-7z4.pages.dev`. Custom domains are registered on the Pages project; a `deactivated` status means DNS isn't pointing at the project.
- Legacy GitHub Pages (root HTML / `CNAME` / `.nojekyll`) is retired and no longer served. The root-HTML site + its `.md` mirrors, sitemaps, `llms.txt`/`robots.txt`/`AGENTS.md`, and the root generator were **deleted** in the cleanup PR. GitHub Pages may still be enabled in repo settings, but DNS bypasses it so it serves nothing.

## Files (live site — all under `site/`)

The live site is entirely `site/`-based. Source pages live in `site/src/pages/`, content collections in `site/src/content/`, components in `site/src/components/`, styles in `site/src/styles/`. Build output goes to `site/dist/` (deployed to Cloudflare Pages).

| Path | Purpose |
|------|---------|
| `site/src/pages/*.astro` | Pages: `index`, `about`, `market-map`, `glossary`, `privacy`, `nobody-built-the-first-mile`, `compliance-should-just-work` (manifesto), `insights` (hub) + `insights/[...slug]` (articles) |
| `site/src/content/pages/*.md` | Long-form prose for glossary / privacy / first-mile |
| `site/src/content/articles/*.md` | Dated Insights articles (auto-listed by the hub) |
| `site/src/data/market-map-entities.json` | Market-map periodic-table data (89 entities) |
| `site/src/components/` | `Header.astro` (masthead + nav), `Footer.astro`, `ContactForm.astro` |
| `site/src/layouts/BaseLayout.astro` | Wraps every page: head, meta, canonical, JSON-LD, PostHog, header/footer |
| `site/public/` | Served static files: `llms.txt`, `robots.txt`, `AGENTS.md`, `_redirects` (301s old `.html` → clean URLs — **load-bearing for SEO**), favicons, logo, mark |
| `site/scripts/generate-md-mirrors.py` | Post-build: regenerates `site/dist/*.md` mirrors + sitemaps. Runs inside `npm run build` (deps pinned in `site/scripts/requirements.txt`). |
| `parity-baseline/*.md` | Mirror snapshots the CI parity oracle diffs against (repo root; **do not delete**) |
| `.github/workflows/deploy.yml` | Builds `site/` + deploys `site/dist` to Cloudflare Pages on `site/**` pushes to `main` |
| `.github/workflows/validate-llms-txt.yml` | PR check: validates `site/public/llms.txt` structure, URL liveness, and `.md` mirror parity |

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

### Tally.so Discovery Form (discovery.html)
- **Page:** `eagleridge.io/discovery` — unlisted (noindex, nofollow), shared via direct URL with clients
- **Form:** Embedded via Tally iframe with `transparentBackground=1&dynamicHeight=1` params
- **Form spec:** `eagle-ridge-methodology/clients/nereid-bio/discovery/tally-form-spec.md`
- **Notion integration:** Tally auto-creates entries in "SSP Intake Responses" database on submission
- **Tracking event:** `discovery_page_viewed`
- **To update form:** Edit in Tally UI (tally.so dashboard). The embed code auto-reflects changes.
- **Free tier note:** "Made with Tally" badge appears. Removable at €25/mo (Tally Pro).

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
python3 -m http.server 8000   # Local testing
# Test form: Submit manually in browser (Web3Forms blocks server-side requests)
```
