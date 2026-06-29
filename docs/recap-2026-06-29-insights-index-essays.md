# Session Recap: Insights index now lists all essays

**Date:** 2026-06-29
**Project:** eagle-ridge / eagleridge.io
**PRs Merged:** #73
**Issues Filed:** #74

## What Was Built

The `/insights` index page showed only one post (`Why Readiness Comes Before
the Assessment`). The two essays — **Nobody Built the First Mile** and
**Compliance should just work** — rendered at their own URLs but were missing
from the index.

**Root cause:** `site/src/pages/insights.astro` built its card list by iterating
*only* the `articles` content collection (one `.md` file). The two essays live as
standalone `.astro` pages under `src/pages/insights/` (the Manifesto is a 50KB
interactive page with SVG figures — not markdown), so they were never in that
collection.

**Fix:** Merged a small static array of the standalone pages into the array the
index already sorts and maps over. Dates pulled from each page's own jsonLd
(Manifesto `2026-06-12`, First Mile `2026-06-09`). The JSON-LD `Blog` schema
picks them up automatically too. Verified live on `eagleridge.io/insights` via
`curl` — all three cards present, newest-first.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| No JS unit-test runner for the site | Real failure modes (build break, content drift) are already gated by `astro build` + Zod schemas + the parity oracle + `check-entity-fields.mjs`. A component-render suite would test Astro, not business logic. |
| Defer pytest for `generate-md-mirrors.py` | Its only untested logic is normalization, already covered indirectly by the parity oracle. Add only if it breaks twice. |
| Register standalone essays as a static list, not convert to collection | The Manifesto is a bespoke interactive page; forcing it into the markdown-rendered `articles` collection would destroy it. A 2-entry static list is the right altitude. |

## Corrections Applied

- Hit the no-compound-commands hook once (`;` in a Bash call); split into
  separate calls. Rule already documented — no codification needed.

## What's Next

- **#74** — bump GitHub Actions off the deprecated Node 20 runner
  (`checkout@v4`, `setup-node@v4`, `setup-python@v5`, `wrangler-action@v3`)
  before GitHub removes the Node 24 fallback. Non-blocking.
- If a third standalone essay is added, consider whether the static-list
  pattern still holds or the index deserves a small content-collection for
  "external" pages.
