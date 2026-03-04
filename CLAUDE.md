# Eagle Ridge Advisory — eagleridge.io

Static site hosted on GitHub Pages. Four HTML pages, no build tools.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Homepage — hero (A/B tested), services, frameworks, social proof, contact form |
| `about.html` | About page — expertise, clients, approach |
| `discovery.html` | SSP intake form — Tally.so embed, unlisted (noindex), shared via direct URL |
| `privacy.html` | Privacy policy — includes PostHog tracking disclosure |
| `logo.png` | Logo (also: `Geometric Eagle Head Logo.png`) |
| `CNAME` | Custom domain: `eagleridge.io` |
| `llms.txt` | LLM-readable site summary ([llmstxt.org](https://llmstxt.org/) standard) — update when pages/services change |
| `.github/workflows/validate-llms-txt.yml` | PR check: validates llms.txt structure, URL liveness, and drift from HTML changes |

## Do NOT Touch (during routine site edits)

- `README.md`, `DOMAIN_REPUTATION_GUIDE.md`
- Logo files

## Integrations

### PostHog Analytics
- **Snippet**: In `<head>` of all 4 pages (loads async, non-blocking)
- **Project token**: `phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg` (public, safe in HTML)
- **Project ID**: `209232`
- **API key**: `op://Private/PostHog MCP/credential` (use 1Password, never hardcode)
- **Host**: `https://us.i.posthog.com`

### A/B Test: Homepage Hero
- **Experiment**: `eagle-ridge-homepage-hero-experiment` (ID: 358074)
- **Feature flag**: `hero-variant` (ID: 585380), 50/50 split
- **Variant A** (control): "Eliminate the security poverty line" — unified message
- **Variant B** (test): "Cybersecurity compliance, made practical" — two audience cards linking to `#contact-form`
- **Anti-FOUC**: `.hero-variant { display: none }` + fallback timer (registered first) + `onFeatureFlags` callback (guarded with `typeof`)
- **Tracking event**: `hero_variant_shown` with `{ variant: 'a' | 'b' }`
- Use `/posthog-experiment` skill for changes

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

Two buyer personas:
1. **Small business CEOs** — need CMMC/SOC 2 compliance to win government contracts
2. **PE/DD teams** — acquiring companies that need compliance readiness

## Dev Workflow

```bash
python3 -m http.server 8000   # Local testing
# Test A/B: Variant A shows as fallback after 1.5s (no flag configured locally)
# Test form: Submit manually in browser (Web3Forms blocks server-side requests)
```
