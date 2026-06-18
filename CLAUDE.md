# Eagle Ridge Advisory — eagleridge.io

**Astro site in `site/`, hosted on Cloudflare Pages** (project `eagleridge` → `eagleridge-7z4.pages.dev`). DNS cut over from GitHub Pages on 2026-06-13. The live site is built **entirely** from `site/src/` — `site/` is the only source of truth. The legacy parallel root-HTML site (root `*.html`, `*.md` mirrors, `CNAME`, `.nojekyll`, root `scripts/`, root `AGENTS.md`/`llms.txt`/`robots.txt`/`sitemap.*`) was removed 2026-06-18; recover from git history if ever needed.

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
- Legacy GitHub Pages (root HTML / `CNAME` / `.nojekyll`) is retired and no longer served; the root files were removed 2026-06-18 (see intro). Recover from git history if ever needed.

## Files & structure (all under `site/`)

| Path | Purpose |
|------|---------|
| `site/src/pages/*.astro` | Routes. `index`, `about`, `market-map`, `nobody-built-the-first-mile` (First Mile), `compliance-should-just-work` (Manifesto), `glossary`, `privacy`, `insights` (hub) + `insights/[...slug]` |
| `site/src/layouts/BaseLayout.astro` | Shared `<head>` (meta, canonical, favicon links, PostHog snippet) + page chrome |
| `site/src/components/` | `Header.astro` (nav incl. Resources dropdown), `Footer.astro`, `ContactForm.astro` |
| `site/src/content/` | Content collections: `pages` + `articles` (Insights hub) |
| `site/src/styles/` | `tokens.css` (brand `--er-*` design tokens) + `global.css` (chrome, nav/dropdown, layout) |
| `site/public/` | Static passthrough: `favicon.svg`/`favicon.ico` (eagle mark), `logo.png`, `eagle-ridge-mark.png`, `AGENTS.md`, `robots.txt`, `_redirects` (old `.html` → clean URLs), `_headers` |
| `site/public/llms.txt` | LLM-readable site summary ([llmstxt.org](https://llmstxt.org/) standard) — update when pages/services change |
| `site/scripts/generate-md-mirrors.py` | Post-build: emits per-page `.md` mirrors + sitemaps into `dist/`. Runs as part of `npm run build`; locally needs `uv run --with markdownify --with beautifulsoup4 python scripts/generate-md-mirrors.py` from `site/` |
| `parity-baseline/*.md` (repo root) | **Live** — CI parity oracle. Every built `.md` mirror must byte-match its baseline (after stripping nav/footer/chrome). Do not move. |
| `.github/workflows/deploy.yml` | Builds `site/` + `wrangler pages deploy` on push to `main` touching `site/**` |
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

### Discovery Intake Form (Web3Forms)
`site/src/pages/discovery.astro` — a minimal first-touch intake landing page. The
Feb-2026 Tally plan was reversed 2026-06-18 to Web3Forms (same service as the
contact form); the Tally embed was never built.
- **Page:** `eagleridge.io/discovery` — unlisted (`noindex, nofollow` via the
  `BaseLayout` `noindex` prop), shared via direct URL with clients. Not in any nav.
  Unlisted by convention only — the mirror/sitemap generator's `PAGES` allowlist
  doesn't include `discovery`, so no `.md` mirror and no sitemap row.
- **Form:** 3 required fields (name, email, company) + 1 optional ("what are you
  pursuing?"). Deeper intake is gathered later by a separate enrichment flow, not
  here. Submits via `fetch()` to `https://api.web3forms.com/submit`, honeypot
  `botcheck`, stays on page.
- **Access key:** `3e6cb410-9c3a-4af7-9a6a-dbf012e8d8a1` (shared with the contact
  form). **Hidden `subject`: "New Discovery Intake — Eagle Ridge"** so intake
  leads are distinguishable from contact leads in the inbox.
- **Shared quota:** both forms share the Web3Forms free-tier 250 submissions/month
  budget. A spam burst on the (leakable) discovery URL can exhaust it and silently
  drop real leads. Turnstile follow-up tracked separately.
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
npm run dev --prefix site          # local dev server (Astro, hot reload)
npm run build --prefix site        # astro build + md-mirror/sitemap generation
# Test contact form: submit manually in browser (Web3Forms blocks server-side requests)
```
