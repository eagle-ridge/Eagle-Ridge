# Session Recap: EmDash cutover, PR cleanup, Latchkey runners

**Date:** 2026-09-16 / 2026-09-17
**Project:** eagle-ridge/Eagle-Ridge (eagleridge.io)
**PRs Merged:** #105, #109, #114, #124, #130, #131, #132, #134, #135, #136, #137
**PRs Closed:** #106 (superseded), #129 (duplicate), #133 (obsolete heal)
**Issues Closed:** #107, #122 · **Opened:** #139, #140, #141, #142, #143

## What Was Built

- **EmDash CMS in production.** PR #105 (plan 007) merged after rebasing on main and seeding the four articles main had gained; all six posts imported into production D1 with original dates. `eagleridge.io` and `www` moved from the Pages project to the `eagleridge` Worker; the Pages project is deleted. Plan 006 is complete.
- **CI restored.** The repo's Cloudflare token had been revoked (last green deploy 2026-09-11). Re-issued into 1Password `Cloudflare Workers API`, repo secret updated, deploy proven green.
- **CI on Latchkey.** PR #132 moved both workflows to `latchkey-small`. After rotating the Latchkey API key (1Password `LATCHKEY_API_KEY`), a runner attached in under a minute and the deploy passed. Latchkey MCP server and CLI wired for future sessions.
- **PR queue 9 → 0.** Three docs recaps rebuilt on current main with their papercut lines inserted in date order; 28 merged remote branches deleted.
- **Skills.** `humanizer` (blader/humanizer v3) installed; `pangram` skill gained a flagged-windows loop and a recorded data point.

## Key Decisions

| Decision | Rationale |
|---|---|
| Custom domains attached in the dashboard, not declared in `wrangler.jsonc` `routes` | The CI token would need DNS scope to re-assert them on every deploy; one-time dash attach avoids that |
| Merge #130 despite the page scoring AI 1.00 on Pangram | The page already scored AI 1.00 before the PR; the PR is six accuracy fixes. From-scratch rewrite tracked in #140 |
| Merge #132 (Latchkey runners) despite its validate check failing there | Chris's call; deploy proven green after key rotation; validate still to be confirmed (#143) |
| Humanizer is a handoff-draft tool, not a Pangram gate bypass | Full pass on the SOC 2 page: zero movement (AI 1.00 → AI 1.00, every window 0.99 High) |
| Latchkey feedback drops the stacked-PR complaint | Chris had created the stack himself; the bot only authored the PR |

## Corrections Applied

- Attributed a PR's `stack` field to the Latchkey bot without checking who set it. Global CLAUDE.md now requires provenance before blaming a vendor.
- The Cloudflare token was pasted on a `!` command line; tracked for rolling in #139. The Latchkey key was rotated the same day.

## What's Next

- #139 roll the pasted Cloudflare token · #140 from-scratch SOC 2 page rewrite · #141 unreliable push-event deploy triggers · #142 committed `.wrangler/` state in tools/aeo-tracker · #143 confirm validate workflow on Latchkey.
- Send the Latchkey feedback (four product points, drafted in-session).
