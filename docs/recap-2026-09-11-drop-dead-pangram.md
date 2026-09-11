# Session Recap: "Pentagon to C3PAOs: Drop Dead" + Pangram gate

**Date:** 2026-09-11
**Project:** Eagle-Ridge (eagleridge.io)
**PRs Merged:** #117, #118, #119, #120, #121

## What Was Built

- Insights article at `/insights/pentagon-to-c3paos-drop-dead` on the Sept 3 class deviation that turns the CMMC Phase 2 third-party assessment pause into a binding rule. Final body is Chris's 264-word rewrite, linking the Tenaglia deviation memo PDF on acq.osd.mil and the DOJ Logzone press release ($507,144).
- `.md` mirrors now served as `text/plain` (`site/public/_headers`, `BaseLayout.astro` alternate link). ChatGPT's browser refused `text/markdown` and reported the article unreadable. The `Accept: text/markdown` negotiation path is unchanged.
- New global skill `/pangram` (`~/.claude/skills/pangram/`): stdlib script, POST /task then poll, prints verdict, fractions, and per-window labels. Key from 1Password "Pangram local-dev".
- LinkedIn post (Chris's text) published. Reddit dropped.

## Key Decisions

| Decision | Rationale |
|---|---|
| Pangram is a publish gate for Eagle Ridge prose ("not 100% of the time, but a gate") | Claude long-form draft scored AI 0.93 to 1.00 after fact-check and a Deirdre pass. Chris's hand edits on it still scored AI 1.00. His from-scratch rewrite scored Human 1.00, High. |
| Chris drafts public prose; Claude does facts, links, mechanical fixes, publishing | Editing a model draft never moved the score. Only from-scratch text did. Sentence-level Claude edits on a human draft pull it back toward AI. |
| Short form replaces long form | A 264-word piece that passes beats a 900-word piece that fails. |
| `.md` mirrors as `text/plain` | AI browsing tools render text/plain, refuse text/markdown. Direct `.md` requests bypass Worker negotiation in both Pages and Worker, so `_headers` is the single source. |
| Reddit dropped for this piece | r/CMMC automod deleted the original structured summary; not worth a third rewrite. |

## Corrections Applied

- Sample output in the first SKILL.md draft was invented; replaced with a real run. The only "human" window on the mirror was its HTML comment header, so score source markdown, not the published mirror.
- Frontmatter `description:` written by Claude flagged as an AI window inside an otherwise human file. Replaced with Chris's opening two sentences; whole file then scored Human 1.00.
- First manual Pages deploy reported "couldn't ascertain the final status", went Active, served 404s. Re-running the identical deploy fixed it. Always curl the apex.

## What's Next

- #122: merges to main do not reach eagleridge.io (deploy.yml deploys the Worker; DNS still on Pages). Add a Pages deploy step or finish #107.
- #123: `npm run build` fails locally on bs4; wrap the mirror step in `uv run`.
- Bead: decide whether to rotate or rename the "Pangram local-dev" key; check credit balance.
