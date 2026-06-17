# Eagle Ridge Advisory

GRC readiness for small-business CEOs — get prepared to pass CMMC, SOC 2, or
ISO 27001 before you're assessed.

## Overview

Eagle Ridge Advisory takes founder-led teams through the full compliance
readiness lifecycle — gap assessment → remediation → SSP → SPRS → evidence →
continuous monitoring — so they're ready before a C3PAO or auditor shows up.
Because a C3PAO cannot perform readiness *and* the assessment for the same
client, Eagle Ridge is the upstream readiness partner, not a competitor to
assessors.

Frameworks: CMMC / NIST 800-171, SOC 2, ISO 27001.

## Website

The live site is **[eagleridge.io](https://eagleridge.io)**, built with **Astro**
in [`site/`](site/) and hosted on **Cloudflare Pages**.

### Tech stack
- Astro (static site generation)
- Cloudflare Pages (hosting; DNS cut over from GitHub Pages 2026-06-13)
- A Python post-build step generates `.md` mirrors + sitemaps for LLM/agent
  readability (`site/scripts/generate-md-mirrors.py`)

### Local development

```bash
cd site
npm install
npm run dev      # local dev server
npm run build    # astro build + .md mirror generation (output in site/dist)
```

### Deployment

Automated. Pushes to `main` that touch `site/**` trigger
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the
Astro site and uploads `site/dist` to the `eagleridge` Cloudflare Pages project
via `wrangler`. The Pages project is direct-upload (not git-connected), so the
Action is what deploys. See [`CLAUDE.md`](CLAUDE.md) for the full deploy runbook
and Cloudflare facts.

## Project structure

```
Eagle-Ridge/
├── site/                 # Astro source — the live site (pages, components, content)
├── parity-baseline/      # .md mirror snapshots (CI parity oracle)
├── docs/                 # session recaps, design briefs
├── design-reference/     # brand kit
├── CLAUDE.md             # deploy runbook + project context for Claude Code
├── MIGRATION-NOTES.md    # Astro rebuild decision log
└── README.md             # this file
```

## Contact

**Email:** contact@eagleridge.io

---

© 2026 Eagle Ridge Advisory. All rights reserved.
