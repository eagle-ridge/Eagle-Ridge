# Session Recap: Open PR sweep

**Date:** 2026-08-26
**Project:** eagle-ridge/Eagle-Ridge
**PRs Merged:** #95, #99, #88, #92, #86 (closed: #85)

## What Was Built

- Marketing explainers `/path-to-88` and `/soc2-observation-window` shipped (#95) and are live.
- #99: all 7 chart SVGs carry `data-md-exclude`, so the LLM-facing `.md` mirrors contain figcaptions only, not flattened axis labels. Parity baselines regenerated.
- #88: GitHub Actions pinned to commit SHAs.
- #92: grc-tools weekly refresh (supersedes #85).
- #86: referral partner agreement plan (renumbered to 005).

## Key Decisions

| Decision | Rationale |
|---|---|
| Latchkey migration (#87) parked, `deploy` job stays on `ubuntu-latest` | No runner picks up `latchkey-small`; the deploy job holds the Cloudflare API token and should not run on third-party infra. |
| Chart SVGs excluded from `.md` mirrors | markdownify emits axis text as noise; figcaptions already carry every number. |

## Corrections Applied

- #95 was squash-merged two minutes before the mirror fix reached its branch; the fix was cherry-picked to a new branch and shipped as #99.

## What's Next

- GH #100: add Article/WebPage JSON-LD to both explainer pages.
- #87 stays open until Latchkey is installed on the org, or gets closed.
