# MIGRATION-NOTES — eagleridge.io Astro Rebuild

Working notes for the Astro rebuild on branch `astro-rebuild`. Updated as the build progresses.
Plan: `~/.claude/plans/can-we-just-do-bubbly-bubble.md` · Requirements: `REBUILD-PROMPT-v2.md`.

## Decision Log

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Build in `site/` subdirectory of this repo, branch `astro-rebuild` | Parity baseline + new build side by side; one migration PR; Cloudflare Pages root-directory setting handles the monorepo. Root HTML / `CNAME` / `.nojekyll` untouched until DNS cutover. |
| D2 | Keep `generate-md-mirrors.py` (adapted) for mirrors AND sitemaps; no `@astrojs/sitemap` | Same generator = clean parity diffs; avoids double sitemap generation. Pinned: `markdownify==1.2.2`, `beautifulsoup4==4.14.3` (versions verified against baseline 2026-06-09). |
| D3 | Market map: entities extracted to JSON, grid pre-rendered statically, thin vanilla JS island; grid containers marked `data-md-exclude` (generator strips them) | Removes ~25KB data from JS payload, grid becomes crawlable, mirror stays byte-stable. |
| D4 | Chrome unified: canonical 8-link footer (about.html's superset), skip-link site-wide | Zero mirror impact (generator extracts `<main>` only); deliberate markup normalization. |
| D5 | `build.format:'file'`, `trailingSlash:'never'`, `compressHTML:false` | Cloudflare serves `dist/about.html` at `/about`; uncompressed HTML keeps markdownify spacing stable for the oracle. |
| D6 | llms.txt rewritten by Fable (stale PE/VC copy removed) | Copy sourced only from current index/about GRC-readiness language. |
| D7 | `/discovery` dropped (user decision 2026-06-09) | Tally embed was never wired (placeholder only); page was never live (untracked until PR #16, merged same day). Re-add when the form exists in Tally. No redirect needed; robots.txt disallow removed. |
| D8 | Brand kit (`design-reference/brand-kit/`) adopted in full (user decision 2026-06-09) | Supersedes REBUILD-PROMPT-v2's "preserve cream/brown" lock. Parchment/umber/gold `--er-*` tokens, Newsreader + IBM Plex type, rules-over-boxes layout. Copy stays locked; PE/VC copy stays banned despite the kit's pitch-deck personality notes. |
| D9 | Fonts self-hosted via @fontsource (Newsreader 400+italic, Plex Sans 300/400/500, Plex Mono 400/500); Bricolage Grotesque skipped | Lighthouse ≥95 + no third-party font request; exact families/weights from the kit. |
| D10 | Signature `<em>` emphasis (one italic umber word in a headline) allowed as enumerated parity diff | Renders as `*word*` in mirrors; permitted only where asterisk-stripped text is byte-identical. Fable-applied only; instances logged below. |

## Build notes (P3/P4)

- **JSON-LD description swaps (D6 scope):** the source JSON-LD on index (`Organization`) and about (`AboutPage`) still carried retired PE/due-diligence copy in their `description` values (head-only, invisible to the mirror oracle). Both now use their page's meta description. All other JSON-LD keys/values are semantically identical to source (verified programmatically).
- **AGENTS.md intro:** old file described Eagle Ridge as serving "private-equity portfolio companies" — rewritten to the GRC-readiness framing.
- **Dark CTA band retired:** the old homepage's dark-brown contact band conflicted with the brand kit's language ("rules over boxes", one accent per view) and produced contrast failures with the new palette. The contact section is now a parchment section; the services grid's primary umber panel is the single accent area on the homepage.
- **Glossary "due diligence" mention kept:** the SOC 2 definition's "often requested in commercial due diligence" is factual glossary content, parity-locked — not positioning copy.

## Final audit (P6, 2026-06-09 — served via `wrangler pages dev`)

- **Parity oracle:** index.md byte-identical to baseline; all other mirrors differ only by the enumerated allowed diffs (mirror-header URL, `.html`→clean links). No D10 emphasis instances were applied.
- **JS audit:** dist ships exactly one JS file (the market-map island, ~32KB incl. entity data) + the PostHog inline snippet. Nothing else.
- **Lighthouse (≥95 gate):** home 99 perf / 100 a11y / 100 SEO; about 100 / 100 / 100. Required `build.inlineStylesheets: 'always'` (kills the render-blocking CSS request) and the contrast fixes below.
- **WCAG note — brand-kit deviation:** `--er-mute` (#8B7D6E) fails 4.5:1 on paper backgrounds at label sizes (12px). Small labels (footer colophon, stat labels, form labels) use `--er-ink-soft` instead. Reserve `--er-mute` for larger or non-essential text.
- **Redirects:** Cloudflare Pages serves `.html` → clean URL as an automatic **308** (its pretty-URL redirect takes precedence over the explicit `_redirects` 301s). 308 is also a permanent redirect and SEO-equivalent; the `_redirects` file stays as explicit intent. Verified in-browser: `/glossary.html` lands on `/glossary`.
- **Link check:** linkinator over the served site — 28 links, 0 broken. (The live GitHub Pages site already serves extensionless URLs, so absolute clean-URL references resolve even pre-cutover.)
- **Browser end-to-end:** all six pages rendered and console-clean (only the intentional "PostHog loaded" log). Market map: search (notes-inclusive), legend filter with `aria-pressed`, detail card (HTML entities + footnote links render), Escape-close all verified. Contact form: real Web3Forms submission succeeded — stays on page, success status shown (one test email sent, labeled "Astro Rebuild Test (ignore)"). `window.posthog` loaded.
- **Console-error count:** 0 across all pages.

## Pre-build findings

- Committed `market-map.md` was stale: `market-map.html` had gained the "On AI use" paragraph without mirror regeneration. Mirror regenerated 2026-06-09 and committed; `parity-baseline/` snapshots the regenerated (correct) state.
- `discovery.html` documented in CLAUDE.md was never committed before PR #16 — `/discovery.html` was 404 on the live site the entire time.
- `llms.txt` lines 3, 16, 25–26 still carry PE/VC due-diligence copy retired June 2026 (fixed by D6).

## URL map (old → new)

| Old | New | Mechanism |
|-----|-----|-----------|
| `/index.html` | `/` | `_redirects` 301 |
| `/about.html` | `/about` | `_redirects` 301 |
| `/market-map.html` | `/market-map` | `_redirects` 301 |
| `/nobody-built-the-first-mile.html` | `/nobody-built-the-first-mile` | `_redirects` 301 |
| `/glossary.html` | `/glossary` | `_redirects` 301 |
| `/privacy.html` | `/privacy` | `_redirects` 301 |
| `/discovery.html` | — (dropped, D7) | none — URL was never live |
| `/*.md` mirrors, `/llms.txt`, `/AGENTS.md`, `/robots.txt`, `/sitemap.xml`, `/sitemap.md`, `/logo.png` | unchanged | static files |

## Allowed parity diffs (everything else = drift)

1. Mirror header comment URL: `.../about.html` → `.../about` (5 pages; index already `/`).
2. In-body internal links: `.html` hrefs → clean URLs.
3. `#contact-form` deep links normalize to `/#contact-form`.
4. sitemap.xml / sitemap.md: clean URLs + new lastmod (verified structurally: 6 URLs, priorities 1.0/0.7, no discovery).
5. llms.txt: documented GRC-readiness copy rewrite (D6); `.md` link URLs unchanged.
6. Chrome unification (D4) — zero mirror impact by construction.
7. market-map.md byte-identical modulo items 1–2 (grid excluded via `data-md-exclude`).
8. Signature emphasis (D10): `*word*` in headlines, asterisk-stripped text byte-identical. Instances: _(none yet)_

NOT allowed: privacy "Last Updated" changes, heading-level changes, em dashes, rewording, dropped footnotes, hero variants, PE/VC copy.

## Manual steps for Chris (after PR review)

- [ ] Create the Cloudflare Pages project (Git-connected): root dir `site/`, build command per README, output `dist`.
- [ ] DNS cutover per README checklist (GitHub Pages stays live until then).
- [ ] Archive the retired PostHog experiment `eagle-ridge-homepage-hero-experiment` / flag `hero-variant` in the dashboard (no code references it).
- [ ] Decide on `/discovery` re-add once the Tally form is built (spec: `eagle-ridge-methodology/clients/nereid-bio/discovery/tally-form-spec.md`).

## Post-cutover cleanup (2026-06-17)

The legacy root-HTML site (HTML pages, `.md` mirrors, sitemaps, `llms.txt`/`robots.txt`/`AGENTS.md`, `CNAME`, `.nojekyll`, root `scripts/generate-md-mirrors.py`, and stale `REBUILD-PROMPT*`/`pr-description.md`) was deleted now that the Astro site in `site/` has been live on Cloudflare Pages since the 2026-06-13 cutover. **Recover any of it from commit `92ffb7a` (the commit immediately before the deletion).** Live equivalents live under `site/public/` and `site/scripts/`; `parity-baseline/` was kept (CI parity oracle).
