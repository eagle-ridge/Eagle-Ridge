# Session Recap: GRC Tools Index — page, pipeline, and weekly routine

**Date:** 2026-07-08 (session spanned 2026-06-19 → 2026-07-08)
**Project:** Eagle-Ridge (eagleridge.io)
**PRs Merged:** #50

## What Was Built

- **`/grc-tools`** — a 52-tool GRC/compliance directory, live on eagleridge.io. Structure adapted from terminalvalue.io (status line, scannable rows with price tags, category + A→Z grouping) rendered in the Eagle Ridge brand (serif H1, mono status line, hairline rows). Client-side search/sort/filter cloned from the market-map pattern; zero new dependencies.
- **Data pipeline** — `site/src/data/grc-tools.json` validated by a Zod `grcTools` content collection in `site/src/content.config.ts`; bad enums or missing fields fail `astro build`. The catalog lands in the `.md` mirror and `llms.txt` (GEO ingestion path), with `CollectionPage`/`ItemList`/`FAQPage` JSON-LD.
- **Notion master DB synced** — "GRC Vendors & Competitors" extended with `Published`/`Blurb`/`Type`/`Price tag`; 26 rows created, 26 enriched (clipped names repaired), 5 dupes/non-tools unpublished. Verified 52 Published == 52 site rows.
- **Weekly routine** — claude.ai RemoteTrigger `trig_01NFoySW2SePKL4dkPXcHoZF`, Mondays 7:23am ET: discover → enrich → re-check stale → regenerate JSON → build → **draft PR**. Never merges or publishes. Playbook: `.claude/commands/grc-tools-update.md`.

## Key Decisions

| Decision | Rationale |
|---|---|
| Clone the market-map pattern; one page, zero new deps | Simplest thing that works; JSON→Astro→vanilla script→mirror already proven in-repo |
| Notion is master; the agent *is* the sync | No sync script/API token to maintain; Chris's `Published` checkbox is the approval gate |
| Defer per-tool spoke pages (GH #76) | Avoid thin content; build only when Search Console shows long-tail demand |
| Routine, not Val.town | The job needs judgment (scoping, research, blurbs, PR authoring) — Val.town is for deterministic glue |
| Drop terminalvalue's "upvotes" | No real vote data; fake counts undermine the manually-reviewed positioning |

## Corrections Applied

- Notion MCP writes erroring "requires approval" → fixed by allowlisting `mcp__Notion` in `.claude/settings.local.json` (gitignored); rule added to global CLAUDE.md (don't retry blind).
- RemoteTrigger `cron_expression` is **UTC**, and MCP connectors attach per-trigger (least privilege — only Notion attached).
- Research corrections during verification: CISO Assistant canonical URL → `intuitem.com/ciso-assistant/`; ZenGRC retagged `$$$` (entry ~$2.5k/mo).

## What's Next

- First routine run **Mon 2026-07-13**: expect a draft PR (Mycroft enrichment queued) or a no-op report.
- Weekly cadence: skim the draft PR + Notion queue, tick `Published`, merge (~10 min).
- Spoke pages when GSC shows demand — tracked in #76.
