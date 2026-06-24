# Session Recap: Market Map — Table View, Sortable Columns, Source URLs

**Date:** 2026-06-24
**Project:** Eagle-Ridge (eagleridge.io)
**PRs Merged:** #56

## What Was Built

PR #56 shipped:
- **Table view toggle** — grid ↔ full `Name | Category | CMMC L2 fit | Pricing | Source` table
- **Sortable columns** — asc → desc → restore original order; `aria-sort` on headers
- **Per-entity source URLs** — all 89 entities now have a `url` field; detail card shows `↗ hostname` link
- **Mobile CMMC chip** — confidence chip added to mobile cells
- **CI validation script** — `site/scripts/check-entity-fields.mjs` validates HTML allowlist + URL scheme

## Review Process

3-agent parallel review (code, silent-failure, test coverage) + inline security review. 12 fixes applied before merge.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Add `check:entities` to `validate-llms-txt.yml` not `deploy.yml` | PR validation is the correct gate — blocks unsafe data before merge, not after deploy |
| SRI hash on Tabler CDN | Pins external CSS; CDN compromise without SRI is a real CSS-exfiltration vector |
| `delete mapBody.dataset.view` vs `= ''` | `[data-view]` attribute-present selectors would match `=""`, causing latent future bugs |
| `localeCompare` with `'en', { sensitivity: 'base' }` | Sort order must be deterministic across browser locales |
| `<template>` element issue filed (not fixed in PR) | Defense-in-depth only — `check:entities` CI gate is the primary control; `<template>` is a separate hardening pass |

## Corrections Applied

- Parity baseline `parity-baseline/market-map.md` updated to include "Table view" button text — CI was failing with spurious content-drift error after merge

## What's Next

- #58: Add CSP + security headers (`X-Content-Type-Options`, `frame-ancestors`, `Referrer-Policy`) to `site/public/_headers`
- #59: Switch `htmlFrag()` from `Range.createContextualFragment` to `<template>` element
- #57: Close (resolved — `check:entities` wired into CI)
