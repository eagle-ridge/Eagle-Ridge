# Session Recap: AEO fix-five, Origami cleanup, pangram gate

**Date:** 2026-09-10 to 2026-09-11
**Project:** Eagle Ridge (eagleridge.io)
**PRs Merged:** #116, #126, #127

## What Was Built

Reviewed the AEO/GEO plan for eagleridge.io against a real financial and market analysis, then shipped it:

1. **Crawlers unblocked.** Cloudflare's managed robots.txt was disallowing GPTBot, ClaudeBot, and Google-Extended. Fixed via the dashboard (the API rejects this PATCH regardless of token scope — see below). GH #112 closed.
2. **AI visibility tracker.** Built first on Val.town, then moved to a private Cloudflare Worker cron after Chris flagged secrets on a public val as the wrong call. Asks 10 buyer-intent prompts daily via Claude Sonnet 5 with web search, scores `retrieved` / `cited` / `mentioned` independently for eagleridge.io, posts to PostHog as `ai_search_visibility`. Secret set via `op read | wrangler secret put`, never on a command line.
3. **Self-reported attribution.** "How did you hear about us?" plus a conditional "What did you ask it?" on the contact and discovery forms, feeding `heard_from` / `ai_prompt` into the existing PostHog form event.
4. **workers.dev noindex.** The preview host now serves `X-Robots-Tag: noindex, nofollow`, keeping the EmDash admin reachable. GH #110 closed, verified live.
5. **Three Insights articles** answering battleground buyer prompts in their first sentence (choosing a readiness consultant, Level 2 readiness cost, gap assessment vs readiness assessment). Corrected same day for the 2026-07-13 CMMC Phase 2 suspension after a research pass turned it up — the original drafts assumed a November 2026 deadline that no longer exists.

Separately, diagnosed and fixed the Origami outreach campaigns: found `auto_lead_refill_enabled: true` on all 8 campaigns silently spending ~460 credits overnight on new leads while 437 already-found people sat uncontacted. Disabled it everywhere, re-templated all 8 to a 3-step email-only sequence (LinkedIn steps were live but had never sent a single connect request), and rewrote the opener around the suspension: self-attestation and SPRS obligations never paused, only the third-party certification requirement did.

Bought sending capacity ahead of a possible volume increase: two lookalike domains, four mailboxes, warming at a 10/day cap, not yet attached to any campaign.

## Key Decisions

| Decision | Rationale |
|---|---|
| Tracker on Cloudflare Worker, not Val.town | Secrets on a public val were the wrong tradeoff even though env vars are encrypted; the Worker keeps code in the repo and secrets in Wrangler, same account as the site |
| Engine = Claude Sonnet 5, not Opus or Haiku | Sonnet is the free-tier claude.ai model most buyers actually use; Haiku also uses an older web-search tool with different retrieval behavior |
| Publish 3 articles at pangram `ai=1.00` | Chris ran his own 3-loop edit test first (flat 1.00, zero movement) rather than take the house rule on faith, then made the call to override and ship anyway |
| Eagle Ridge: mothball, not wind down, pending the CMMC reform task force report | The plan assumed a November 2026 deadline; DoD suspended it in July. The report (expected ~late September) is the fact that should decide the business's future, not a guess made before it lands |
| Stop buying Origami leads until the existing 437 are sent | Was about to double-spend: acquiring more contacts while none of the current list had been messaged |

## Corrections Applied

- **CLAUDE.md:** documented that a merge to `main` does not deploy to eagleridge.io — DNS still points at Cloudflare Pages, not the Worker (plan 006 phase 2 pending, GH #107/#122). Every content PR needs a manual `wrangler pages deploy` after merging.
- **CLAUDE.md:** documented that Cloudflare's `bot_management` API object rejects PATCHes on two fields (the AI-bot-block toggle and `is_robots_txt_managed`) regardless of token scope — dashboard-only.
- **Wrap-up self-correction:** a papercut written during this same wrap-up sweep mislabeled a 2026-09-10 finding as 2026-09-11 and overstated what the Cloudflare API could do. Caught and fixed before it propagated (PR #126).

## What's Next

- **2026-09-28ish:** read the CMMC Reform Task Force's public report. If it keeps meaningful third-party certification demand and Origami sends have cleared ~300 with under 1% replies, that's the wind-down signal (bead `chrismcconnell-sne0`). If not, revisit appetite.
- Get a valid OpenAI API key to activate the tracker's ChatGPT engine (Notion CMC-502, bead `chrismcconnell-8gvk`).
- GH #125: reconcile the Level 1 safeguard count (glossary says 15, two service pages say 17) — found while writing this content, unrelated to it.
- Watch the Origami reply rate as the 437-person queue clears over the next ~2-3 weeks.
