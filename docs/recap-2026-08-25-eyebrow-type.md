# Session Recap: Eyebrow / label type language

**Date:** 2026-08-25
**Project:** Eagle-Ridge (eagleridge.io)
**PRs:** #97 (draft, awaiting merge)

## What Was Built

- A design canvas comparing the current stack against three directions (Merriweather + Public Sans, Schibsted Grotesk, DM Serif Display + Figtree) plus an interactive Playground with headline/body/eyebrow/weight/size chips: https://claude.ai/code/artifact/7a4d0697-8f1f-4301-99a8-60ee6ffcddb7
- PR #97: 21 label rules across 6 files moved from IBM Plex Mono at 0.08–0.18em tracking to IBM Plex Sans 500, uppercase, 0.05em. `--er-tracking-eyebrow` 0.22em → 0.05em. Build and md-mirror parity green.

## Key Decisions

| Decision | Rationale |
|---|---|
| Keep Newsreader + IBM Plex Sans | The typefaces were not the "default" tell; the tracked-out mono eyebrows were. |
| Labels = Plex Sans 500 caps at 0.05em | Reads as a heading tag, not a terminal prompt; keeps uppercase per Chris. |
| No small caps | Plex Sans ships none; synthesized small caps look like a rendering bug at 13px. |
| Plex Mono stays for data only | Ranks, `.md` paths, readouts, `.er-mono` are legitimately monospace. |
| Manifesto page left as-is | Standalone art piece; decide separately (#98). |

## Corrections Applied

- PR target repo is `eagle-ridge/Eagle-Ridge` (first attempt used the wrong owner). Recorded in memory + PAPERCUTS.

## What's Next

- Merge #97 (deploy Action fires on `site/**` → main).
- Resolve #98: conform the manifesto page or document it as an exception.
