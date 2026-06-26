# Session Recap: Move First Mile + Manifesto essays under /insights

**Date:** 2026-06-26
**Project:** Eagle Ridge (eagleridge.io)
**PRs Merged:** #67

## What Was Built

Relocated the two standalone essays from root-level URLs to the Insights section:

| Old URL | New URL |
|---------|---------|
| `/nobody-built-the-first-mile` | `/insights/nobody-built-the-first-mile` |
| `/compliance-should-just-work` | `/insights/compliance-should-just-work` |

Both bespoke `.astro` pages (First Mile reads the `pages` content collection;
Manifesto is an inline essay with 6 script-driven SVG figures) moved into
`site/src/pages/insights/`. Because the build then emits them under
`dist/insights/`, the mirror generator's `discover_insights()` auto-produces
their `.md` mirrors and sitemap rows — no fixed `PAGES` entries needed.

Touchpoints updated: both files' imports / `path` prop / JSON-LD `url`; nav
(Header, Footer); cross-links (market-map ×2, grc-tools); `llms.txt` mirror
URLs; `_redirects` (301s from old clean + `.html` URLs); and the parity
baselines for market-map + grc-tools (links to the moved page). Deleted the
now-stale `parity-baseline/nobody-built-the-first-mile.md`.

Verified locally before push: `astro build`, mirror generation, and the CI
parity loop all green; both PR checks passed. Squash-merged (`4554ce8`); the
Cloudflare deploy Action fired on merge.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Move files into `pages/insights/` rather than convert to `articles` | Preserves the bespoke interactive layouts; conversion to markdown articles would be lossy (manifesto's 6 SVG figures) |
| Let `discover_insights()` own the mirrors; drop fixed `PAGES` entries | Auto-discovery already handles `dist/insights/*` — keeping fixed entries would duplicate/garble output |
| Delete the first-mile parity baseline | Discovered insights mirrors have no parity backstop (matches the readiness article); a stale baseline expecting flat `dist/<slug>.md` would fail CI |
| Don't add the essays to the `/insights` hub index now | Hub lists only the `articles` collection; surfacing non-article essays is a separate product call — tracked in #69 |

## Corrections Applied

None — landed correct on the first pass; no rework.

## What's Next

- #68 — nav double-highlight: relocated essays light both "Insights" and their "Resources" entry as `aria-current` (cosmetic).
- #69 — decide whether to surface First Mile + Manifesto on the `/insights` hub index (pending direction).
