---
description: Weekly GRC tools index refresh — discover, enrich, re-check, regenerate JSON, open a PR that auto-merges on green CI. Master = the Notion "GRC Vendors & Competitors" DB; the human gate is the Published checkbox.
---

# /grc-tools-update — keep the GRC tools index evergreen

You are maintaining the GRC tools index that powers `/grc-tools` on eagleridge.io.
The **master source of truth is the Notion database "GRC Vendors & Competitors"**
(id `0976fb7428e44fed847c5efc77b2716b`). The committed file
`site/src/data/grc-tools.json` is a generated snapshot of the **Published** rows.

Work on branch `claude/grc-tools-update-<YYYYMMDD>` — the prefix matters: the
`data-pr-guard` CI job only arms on `claude/grc-tools-update*` branches, and
auto-merge (step 7) is only allowed when that guard runs and passes. The human
gate is the **Published checkbox in Notion** — never check it yourself; rows you
add stay unchecked until a human reviews them. This command is idempotent:
running it twice should produce no spurious changes.

## Schema (Notion master)

Per row: **Vendor** (title), **Blurb** (one sentence), **Type** (Compliance
automation / Enterprise GRC / CMMC-native / Data protection / Third-party risk /
Privacy management / Open-source GRC), **Market** (SMB / Mid-market / Enterprise),
**Price tag** ($, $$, $$$, FREE, N/A), **Frameworks / focus** (multi: SOC 2,
ISO 27001, HIPAA, PCI DSS, CMMC, NIST 800-171, FedRAMP, GDPR, Privacy, Vendor risk,
CUI/ITAR), **Website** (url), **Last reviewed** (date), **Published** (checkbox),
**Notes**, **Source** (where discovered). These map 1:1 to the JSON fields
(`name, blurb, type, market, priceTag, frameworks[], website, lastReviewed,
published`); the JSON `id` is the url slug.

## Steps

1. **Discover (weekly).** Web-search a rotating query set for tools we don't have
   yet, e.g.: "new GRC platform 2026", "compliance automation startup", "Vanta
   alternative", "Drata alternative", "CMMC compliance software", "open-source GRC",
   "FedRAMP compliance automation", plus Product Hunt / G2 new entrants. Normalize
   each candidate by name + domain and diff against existing Notion rows and
   `grc-tools.json`. For genuinely new, in-scope **tools/platforms** (not consulting
   firms, assessors, MSSPs, or authorities — those belong on `/market-map`), add a
   Notion row with Vendor + Website + Source and **Published unchecked**. Do not
   invent tools; only add ones you can verify exist.

2. **Enrich.** Scan **every** row — published or not — and for any row that is
   new or has a blank Blurb, Type, Market, Price tag, or Frameworks, do a quick
   research pass and fill them. Unpublished rows matter most here: they are the
   ones waiting on a human review, and that review needs the fields filled.
   Write values in the exact formats the schema shows (plain strings, checkbox
   `__YES__`/`__NO__`, dates under `date:Last reviewed:start`). Blurb = one
   neutral sentence that says what it is and who it's for, ideally noting where it
   fits the readiness-vs-assessment journey. Keep enum values exactly as listed
   above (the build's Zod schema rejects anything else). Set Last reviewed = today.

3. **Re-check (freshness).** Take the ~10 rows with the oldest Last reviewed.
   Confirm the Website still resolves and the blurb/price are still accurate; fix
   drift; bump Last reviewed. If a tool is dead or acquired, note it and leave
   Published unchecked (or uncheck it).

4. **Regenerate the snapshot.** Read every **Published** row via the Notion MCP and
   rebuild `site/src/data/grc-tools.json` **from scratch** from those rows — do not
   patch the existing file, or Published rows it never had get silently missed
   (array sorted however; the page re-sorts). Afterwards, confirm the entry count
   equals the number of Published rows (after dedupe).
   Dedupe by normalized name + domain. Ensure each object has a unique kebab-case
   `id` slug and valid enum values.

5. **Build + verify.**
   - `npx astro build` from `site/` — the Zod `grcTools` collection validates the
     data; a bad enum or missing field **fails the build**. Fix and rebuild.
   - Regenerate mirrors: from `site/`, `uv run --with markdownify==1.2.2 --with
     beautifulsoup4==4.14.3 python scripts/generate-md-mirrors.py`.
   - Refresh the parity baseline: `cp site/dist/client/grc-tools.md
     parity-baseline/grc-tools.md` (the new content is intended, so the baseline
     moves with it).
   - If the indexed count changed, update the count wording is automatic (derived),
     but update `site/public/llms.txt` if the description should change.

6. **Self-review, then open the PR (ready, not draft).** Before opening it, run
   this review checklist against `git diff origin/main`:
   - **Scope:** the diff touches ONLY `site/src/data/grc-tools.json`,
     `parity-baseline/grc-tools.md`, and (optionally) `site/public/llms.txt`.
   - **Shape:** every entry has a unique kebab-case `id`, an https `website`,
     valid enums, a one-sentence blurb; no duplicate normalized name+domain.
   - **Delta sanity:** the entry count shrank by at most 3 (bigger shrinks mean
     a Notion accident, not editorial intent); every removed entry corresponds
     to a row deliberately unpublished in Notion; every added entry's Published
     box was ticked by a human, not you.
   - Write the checklist outcome + the week's summary (added / enriched /
     re-checked / flagged dead) into the PR body.
   If every item passes, open the PR **ready for review**. If anything fails,
   open it as a **draft** instead, say what failed in the body, and stop.

7. **Auto-merge on green.** Subscribe to the PR's activity
   (`subscribe_pr_activity`) and wait for CI. All checks green — including
   `data-pr-guard`, which independently re-verifies scope and shrink — →
   **squash-merge** the PR (deploy to eagleridge.io follows automatically on
   merge). A check fails → fix mechanically if it's yours to fix (e.g. stale
   parity baseline), push, and wait again; if it isn't mechanical, convert the
   PR to draft, comment what's wrong, and stop. Never merge a PR whose
   `data-pr-guard` job did not run.

## Guardrails

- Quality over quantity. A vague or unverifiable entry is worse than none.
- Tools/platforms only. Firms, assessors, MSSPs, and authorities stay on `/market-map`.
- Keep enums exact; the build is the validation gate.
- **The human gate is the Notion `Published` checkbox — never tick it yourself.**
  Auto-merge is allowed only under step 7's conditions (data-only diff, bounded
  shrink, all CI green including `data-pr-guard`). Anything outside those
  conditions goes to a draft PR for a human.
- Rollback story: a bad merge is one `git revert` PR away, and the site data is
  regenerated from Notion on the next run anyway.
