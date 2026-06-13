# Session Recap: eagleridge.io DNS cutover + automated Cloudflare Pages deploys

**Date:** 2026-06-13
**Project:** Eagle Ridge (eagleridge.io)
**PRs Merged:** #31

## What Was Built

The session started as "sync this file to repo" for a prose edit on `compliance-should-just-work.astro` and uncovered that the live site was broken/stale across three layers. Fixed all three and automated the deploy so it can't recur.

1. **Deployed the stale content.** The edited prose was committed and pushed to `main`, but never went live — the Cloudflare Pages project `eagleridge` is **direct-upload (not git-connected)**, so pushes don't build. Built the Astro site (`astro build` + the pinned Python md-mirror generator) and uploaded `site/dist` via `wrangler pages deploy`.

2. **Cut DNS over from GitHub Pages → Cloudflare Pages.** The apex `eagleridge.io` still had 4 A (`185.199.x.153`) + 4 AAAA GitHub Pages records, and `www` CNAME'd to `eagle-ridge.github.io`, all proxied — so Cloudflare's edge served GitHub Pages content. Deleted all 8 apex records, pointed apex + `www` at `eagleridge-7z4.pages.dev` (proxied CNAME, apex flattening), and reactivated the Pages custom domains (they were `deactivated` because DNS didn't point at the project).

3. **Automated future deploys (PR #31).** Added `.github/workflows/deploy.yml`: any push to `main` touching `site/**` builds the Astro site (Node 22 + Python 3.12 + pinned md-mirror deps) and runs `wrangler pages deploy`. Set repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. Merged and verified the first automated run green in 30s.

Also corrected the root `CLAUDE.md` (was still "GitHub Pages, hand-written HTML, no build tools").

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Automate via GitHub Actions, not Cloudflare native Git | Could be done entirely via code/API in-session (workflow + `gh secret`), no manual dashboard OAuth, and zero risk to the just-activated custom domains (native connect can require recreating a direct-upload project). |
| Apex via proxied CNAME → pages.dev (flattening) | Cloudflare flattens CNAME at apex; keeps the record managed alongside the Pages custom-domain binding rather than hardcoding Pages anycast IPs. |
| Leave legacy root HTML / CNAME / .nojekyll in place | Avoid disrupting the live cutover; archive as a separate follow-up (#33). |
| Use "Dash Cloudflare API Credential" token | The older "Cloudflare Worker API" 1Password item is Workers-scoped and fails on DNS/Pages API calls. |

## Corrections Applied

- **"A git push is not a deploy."** Assumed pushing the prose edit made it live; it didn't (direct-upload project). Codified a verification rule in global CLAUDE.md and documented the deploy path in repo CLAUDE.md + memory.
- Root CLAUDE.md intro was stale (GitHub Pages framing) — rewritten to the Astro/Cloudflare Pages reality with build/deploy commands.

## What's Next

- **#32** — bump `deploy.yml` actions to Node 24-compatible versions (Node 20 deprecation, forced June 16 2026).
- **#33** — archive retired legacy GitHub Pages root files; confirm GitHub Pages is disabled in repo settings.
- **Chris action (bead `chrismcconnell-e826`)** — delete the Workers-scoped "Cloudflare Worker API" 1Password item to avoid future confusion.
