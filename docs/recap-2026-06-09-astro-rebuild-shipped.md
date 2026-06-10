# Session Recap: Astro rebuild shipped — eagleridge.io live on Cloudflare Pages

**Date:** 2026-06-09
**Project:** Eagle-Ridge (eagleridge.io)
**PRs Merged:** #16 (pre-rebuild baseline), #17 (Astro rebuild)
**Issues filed:** #18 (GRC accuracy), #19 (homepage conversion copy), #20 (auto-deploy), #21 (housekeeping)

## What Was Built

Full rebuild of eagleridge.io on Astro 6, shipped to production in one session:

- **`site/`** — six pages (index, about, market-map, first-mile essay, glossary, privacy), restyled to the pitch-deck brand kit (`design-reference/brand-kit/`: parchment/umber/gold `--er-*` tokens, Newsreader + IBM Plex self-hosted via @fontsource). Near-zero JS: one ~32KB market-map island + the inline contact-form script + PostHog.
- **Market map** — 89 entities extracted to `src/data/market-map-entities.json`; grid/legend/mobile-list pre-rendered at build (now crawlable); vanilla island for search/filter/detail/Escape.
- **Parity oracle** — `parity-baseline/` snapshots the old `.md` mirrors; the adapted generator (pinned `markdownify==1.2.2`/`beautifulsoup4==4.14.3`) regenerates from `dist/`; CI normalizes the enumerated allowed diffs and fails on anything else. `index.md` shipped byte-identical to baseline.
- **LLM/SEO layer** — llms.txt rewritten (PE/VC copy removed), AGENTS.md/robots.txt/sitemaps regenerated, JSON-LD verified semantically identical to source.
- **Production** — Cloudflare Pages project `eagleridge` (direct upload), custom domains apex + www, Porkbun DNS flipped (apex ALIAS + www CNAME → `eagleridge-7z4.pages.dev`). Legacy `.html` URLs 301 to clean URLs. Verified live: all pages 200, Lighthouse 99–100/100/100, live Web3Forms submit, zero console errors.

## Key Decisions

| Decision | Rationale |
|---|---|
| Brand kit adopted in full (supersedes cream/brown) | User decision mid-plan; kit was created explicitly "for updating eagleridge.io" |
| Content parity machine-enforced, visuals free | Mirrors capture `<main>` text only — oracle is style-blind by construction |
| Keep the Python mirror generator (pinned), no `@astrojs/sitemap` | Same generator = clean parity diffs; avoids double sitemaps |
| Market-map grid pre-rendered + thin island | ~25KB data out of the JS payload; grid becomes crawlable |
| `/discovery` dropped | Tally embed was never wired; page was never live. Re-add when the form exists |
| `--er-mute` banned at small label sizes | Fails WCAG 4.5:1 on paper backgrounds; use `--er-ink-soft` |
| Direct-upload deploy now, automation later (#20) | Unblocked launch; Git-connect/Action needs a fresh CF API token |

## Corrections Applied

- Stale committed `market-map.md` mirror (missing "On AI use" paragraph) — regenerated before baselining.
- Stale PE/due-diligence copy in index/about JSON-LD descriptions and AGENTS.md intro — replaced with GRC-readiness language.
- Three-lens PR review (technical + customer persona + GRC expert) found zero blockers; in-scope fixes applied (mobile-view `aria-hidden`, llms.txt "after you're assessed", generator gate comment).

## What's Next

1. **#20** — auto-deploy (until then: `npm run build` + `npx wrangler pages deploy dist --project-name eagleridge --branch main` from `site/`)
2. **#18** — GRC accuracy copy fixes (C3PAO expansion, "implement and audit", independence-rule overstatement, Nov-2026 date)
3. **#19** — surface pricing + no-pitch-deck promise on the homepage
4. **#21** — disable orphaned GitHub Pages, remove legacy root HTML, archive the PostHog hero experiment
