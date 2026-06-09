# Eagle Ridge Advisory — eagleridge.io

Static site hosted on GitHub Pages. Hand-written HTML pages, no build tools. `.nojekyll` disables Jekyll so `.md` mirrors are served raw.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Homepage — hero, services (GRC readiness), frameworks, social proof, contact form |
| `about.html` | About page — GRC readiness positioning, clients (small-business CEOs), approach |
| `discovery.html` | SSP intake form — Tally.so embed, unlisted (noindex), shared via direct URL |
| `market-map.html` | Public interactive market map of the CMMC services landscape (89 entities, periodic-table layout). Linked from all page footers. |
| `nobody-built-the-first-mile.html` | Long-form argument behind the market map. Buyer-first prose, cream/brown palette matching about.html. CTA target from market-map. Linked from all page footers. |
| `privacy.html` | Privacy policy — includes PostHog tracking disclosure |
| `glossary.html` | CMMC / NIST 800-171 terminology page (DefinedTermSet JSON-LD). Linked from all footers. |
| `logo.png` | Logo (also: `Geometric Eagle Head Logo.png`) |
| `CNAME` | Custom domain: `eagleridge.io` |
| `llms.txt` | LLM-readable site summary ([llmstxt.org](https://llmstxt.org/) standard). Page links point to `.md` mirrors — update when pages/services change |
| `AGENTS.md` | Guidance for AI agents consuming the site (markdown mirrors, sitemaps, JSON-LD) |
| `robots.txt` | Crawl rules + sitemap pointer; disallows `/discovery.html` |
| `sitemap.xml`, `sitemap.md` | Generated sitemaps (see generator below) |
| `*.md` (per page) | Generated Markdown mirrors of each HTML page; declared via `<link rel="alternate" type="text/markdown">` |
| `.nojekyll` | Disables Jekyll so `.md` mirrors serve as raw static files |
| `scripts/generate-md-mirrors.py` | Regenerates `.md` mirrors + sitemaps from HTML. Run after editing any page: `uv run --with markdownify --with beautifulsoup4 python scripts/generate-md-mirrors.py` |
| `.github/workflows/validate-llms-txt.yml` | PR check: validates llms.txt structure, URL liveness, and drift from HTML changes |

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
