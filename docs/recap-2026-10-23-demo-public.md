# Session Recap: /demo goes public

**Date:** 2026-10-23
**Project:** eagleridge.io (`eagle-ridge/Eagle-Ridge`)
**PRs Merged:** #164

## What Was Built

- **`/demo` is public.** The fictional Kestrel workspace no longer has `noindex`. It is in the header Resources menu as "Demo Workspace", in the sitemap, in `llms.txt`, and has a `.md` mirror with a parity baseline. (#164)
- **Verified live after deploy.** No robots meta, the nav link shows on other pages, `sitemap.xml` lists `/demo`, `demo.md` returns 200. The plain URLs served the new HTML right away.

## Key Decisions

| Decision | Rationale |
|---|---|
| Promote `/demo` now, before reading the PostHog `demo_*` events | Chris asked for it. The PostHog check moves to a follow-up that measures traffic after launch. |
| Nav only, not the footer | The request named the nav. The footer is a curated list. |
| Label "Demo Workspace" under Resources | It sits with the other explainers. The page title stays "Try the workspace". |

## Corrections Applied

- None from Chris. A new CLAUDE.md section lists the five places that make a page public, because only a grep of a sibling page found them all.

## What's Next

- Linear follow-up: read the PostHog `demo_*` events about two weeks after launch.
- #158 (demo controls drift check) is still open.
- #160 (the 2026-10-02 recap PR) is still open and unmerged.
