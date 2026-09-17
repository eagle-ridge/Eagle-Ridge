# Session Recap: checkout restore, CI fixes, token roll, cross-harness skills

**Date:** 2026-09-17 (afternoon)
**Project:** eagle-ridge/Eagle-Ridge (eagleridge.io) + home skills layout
**PRs Merged:** #145, #146, #147
**Issues Closed:** #78, #139, #142 · **Opened:** #148, #149, #150

## What Was Built

- **Checkout restored.** `~/GitHub/Eagle-Ridge` back on current main; merged branches `fix/posthog-wizard-token-wiring` (#115) and `add-soc2-observation-window-spec` (#130) deleted with their remotes; the `Eagle-Ridge-soc2-spec` worktree removed. Untracked files triaged: plans 001–003 + README committed (#145, 001 marked DONE), the PostHog wizard report moved to `docs/`, wizard skill dirs (`.agents/`, `.claude/skills/`, `site/.claude/`) deleted.
- **#146** untracks 19 miniflare sqlite/cache files under `tools/aeo-tracker/.wrangler/` and ignores the dir.
- **#147** flips the `workers-deploy` concurrency group to queue instead of cancel-in-progress, so a late push run can no longer cancel the newer run on main's head.
- **Cloudflare token rolled** (#139): same token id, new secret; 1Password item updated by Chris; repo secret `CLOUDFLARE_API_TOKEN` re-set from 1Password; deploy run 35249724629 green.
- **Cross-harness skills.** `~/.agents/skills` is now the single source; every `~/.claude/skills` and `~/.codex/skills` entry is a relative symlink. `~/scripts/link-skills.sh` re-links after `skl skills install` (which writes real copies to both dirs).

## Key Decisions

| Decision | Rationale |
|---|---|
| `.agents/skills` canonical, `.claude/skills` symlinks | Claude Code only scans `.claude/skills` but supports symlinked entries; Codex and the Agent Skills spec read `.agents/skills`. One source ends the drift skl's dual-write creates |
| Delete the PostHog wizard's skill dirs from the repo | PostHog gives no guidance; the replay-vision skills duplicate the PostHog plugin already enabled; the Astro integration skills are regenerated per wizard run |
| Queue deploys, never cancel | Ordering matters more than saving a runner-minute; the newest commit must land last |
| Latchkey "queued forever" fix = cancel + re-dispatch | `latchkey run --no-context` answered instantly with the same key while two Actions jobs sat 20 min; key rotation was a coincidence earlier in the day |

## Corrections Applied

- Ops/home-level automation (the skills link script) belongs in `~/scripts`, not the client repo or a job temp dir. Chris flagged the scope question mid-task.
- Latchkey memory note corrected: key rotation is not the fix for a runner that never attaches.

## What's Next

- #140 SOC 2 page rewrite (Chris-drafted). Its PR is also what closes #143 (validate workflow on Latchkey).
- #141 stays open for the "no push run at all" case; #148/#149 track plans 002/003; #150 the Cloudflare allow rule.
- Latchkey feedback: Chris is sending it separately after a phone call.
