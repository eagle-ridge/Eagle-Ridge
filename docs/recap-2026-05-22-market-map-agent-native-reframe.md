# Session Recap: Market-map agent-native reframe + Nereid post-engagement check-in

**Date:** 2026-05-22
**Project:** Eagle Ridge Advisory (with cmmc-bd pipeline fixes)
**PRs Merged:** eagle-ridge/Eagle-Ridge#13, miqcie/cmmc-bd#34

## What Was Built

### Eagle-Ridge #13 — Market-map cell rewrite

The Eagle Ridge cell on `market-map.html` was rewritten to align with the May 2026 pitch deck and resolve the highest-leverage finding from the persona/expert/community pre-publish review.

- "AI-augmented 0→1 readiness" → "Agent-native 0→1 CMMC readiness for DIB SMBs: SSP draft + SPRS submission; POA&M-to-Conditional path via retainer."
- Pricing "$3K–$25K/engagement" → "$5K Full Prep + $1–1.5K/mo retainer." $3K is now framed as Nereid proof-of-concept pricing, not the standard floor.
- "Validated on the Nereid Biomaterials engagement" → "Field-tested on…" — matches the never-promise-assessment-ready stance.
- New methodology paragraph: *"On AI use. Eagle Ridge uses LLMs internally to accelerate control-narrative drafting and gap analysis. All output is reviewed by a Registered Provider. Client CUI and Security Protection Data (per 32 CFR §170.4) is never sent to commercial LLMs."* This paragraph is the trust anchor that lets "Agent-native" land safely in r/CMMC.

### cmmc-bd #34 — Discovery resilience

The 2026-05-11 weekly pipeline failure (one slow USASpending `/recipient/` response raising `httpx.ReadTimeout` and killing the run) was originally patched as a narrow `ReadTimeout` catch. Reviewer flagged that the same symptom is also produced by ConnectTimeout, PoolTimeout, WriteTimeout, and RemoteProtocolError when the endpoint sheds connections under load.

- Widened catch to `(httpx.TimeoutException, httpx.RemoteProtocolError)`. Log message includes the exception class name so post-incident triage can tell timeout vs connection-shed apart.
- Added a one-line skip-count summary at the end of `discover_prospects` so unattended launchd runs leave grep-able evidence ("discover: X/Y recipients fetched (N skipped)") instead of silently losing prospects.
- Four new regression tests (ReadTimeout, ConnectTimeout, PoolTimeout, RemoteProtocolError) so the next sibling-exception incident does not reopen the same hole.
- Added `.beads/` to `.gitignore` so the local beads daemon's state files cannot be accidentally staged.

### Nereid post-engagement check-in

First post-close outreach to Nereid (Alyson Santoro, cc Madison Cohen) ~25 days after engagement complete. Soft-touch framing — three asks: POA&M progress, ongoing guidance, engagement feedback. Held-back artifacts (gap checklist, evidence inventory, ConMon plan) intentionally NOT mentioned in the email; reserved for the call itself.

### Tooling

- Installed `roughdraft` v0.1.8 via bun globally. Appended the canonical instruction block to `~/.claude/CLAUDE.md` so AI sessions use `roughdraft open` for markdown review handoffs.
- Cloned `letta-ai/skills` to `~/.skills/` as a read-only reference library. Decided against bulk-symlinking into `~/.claude/skills/` — ~half duplicate existing plugins/document-skills, and symlinking expands the agent's trust surface to upstream changes.

## Key Decisions

| Decision | Rationale |
|---|---|
| Lead with "Agent-native" on the public market map | Pitch deck commits to this positioning; methodology paragraph + Registered Provider + §170.4 citation flip the r/CMMC trust signal from negative to positive. |
| $5K is the public floor; $3K is proof-of-concept history | Matches deck slide 8. "$5K Full Prep + $1–1.5K/mo retainer" is the explicit tiered structure. |
| Nereid check-in uses soft-touch framing, not artifact-first | Deliberate departure from the leverage-first plan. Soft first-touch (POA&M progress, ongoing guidance, feedback ask) avoids spending the artifact leverage in the email. Reveal happens on the call. |
| `~/.skills/` stays a read-only library, never bulk-symlinked | 31 third-party SKILL.md files into the agent's auto-load path expands the trust surface to live upstream changes. Copy-on-demand instead. |
| Don't migrate cmmc-bd to structured logging in this PR | Codebase uses `print()` throughout; flipping one module mid-stream is inconsistent. Tracked separately as cmmc-bd#36. |

## Corrections Applied

- Caught "CCP" reference in the AI methodology paragraph before publishing — Chris is a Registered Provider, not CCP-certified. New memory `feedback_chris-credential-status.md` indexed so this won't repeat.
- Caught `chris@caldris.io` signature in the Nereid email source file — Eagle Ridge correspondence uses `chris@eagleridge.io`. New memory `feedback_eagle-ridge-email-banner.md` indexed.
- Rebase trap on cmmc-bd #34: three of the branch's commits had been independently merged to main as separate PRs (#32, #33, plus the recap). Recovery: soft-reset onto main, re-commit just the genuinely new work, force-push with `--force-with-lease`.

## What's Next

- Nereid: monitor for reply to check-in; if the call books, use the held-back artifacts to re-pitch retainer on the call.
- bd-executor agent spec at `~/.claude/agents/bd-executor.md` still references `enrich-dfars`. Self-modification guard means Chris applies the swap by hand. Tracked as bead `racc` and Notion CMC-349.
- Three market-map content beads still open: Kieri / Cuick Trac / Sentinel Blue adds (`ldvf`), Coalfire / Schellman recat out of "boutique" (`4xgo`), regulatory facts reconcile (`dols`).
- cmmc-bd: GH issues #35 (recap nit) and #36 (logging migration) are filed and waiting.
