---
description: Weekly GRC tools index refresh — discover, enrich, re-check, regenerate JSON, open a draft PR. Master = the Notion "GRC Vendors & Competitors" DB; you stay the approval gate.
---

# /grc-tools-update — keep the GRC tools index evergreen

You are maintaining the GRC tools index that powers `/grc-tools` on eagleridge.io.
The **master source of truth is the Notion database "GRC Vendors & Competitors"**
(id `0976fb7428e44fed847c5efc77b2716b`). The committed file
`site/src/data/grc-tools.json` is a generated snapshot of the **Published** rows.

Work on branch `claude/grc-tools-index-*` (create one if needed). Never publish or
merge — open a **draft PR** and stop. The human flips `Published` in Notion and
merges. This command is idempotent: running it twice should produce no spurious
changes.

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

2. **Enrich.** For any row that is new or missing fields (Blurb, Type, Market,
   Price tag, Frameworks), do a quick research pass and fill them. Blurb = one
   neutral sentence that says what it is and who it's for, ideally noting where it
   fits the readiness-vs-assessment journey. Keep enum values exactly as listed
   above (the build's Zod schema rejects anything else). Set Last reviewed = today.

3. **Re-check (freshness).** Take the ~10 rows with the oldest Last reviewed.
   Confirm the Website still resolves and the blurb/price are still accurate; fix
   drift; bump Last reviewed. If a tool is dead or acquired, note it and leave
   Published unchecked (or uncheck it).

4. **Regenerate the snapshot.** Read every **Published** row via the Notion MCP and
   rewrite `site/src/data/grc-tools.json` (array sorted however; the page re-sorts).
   Dedupe by normalized name + domain. Ensure each object has a unique kebab-case
   `id` slug and valid enum values.

5. **Build + verify.**
   - `npx astro build` from `site/` — the Zod `grcTools` collection validates the
     data; a bad enum or missing field **fails the build**. Fix and rebuild.
   - Regenerate mirrors: from `site/`, `uv run --with markdownify==1.2.2 --with
     beautifulsoup4==4.14.3 python scripts/generate-md-mirrors.py`.
   - Refresh the parity baseline: `cp site/dist/grc-tools.md
     parity-baseline/grc-tools.md` (the new content is intended, so the baseline
     moves with it).
   - If the indexed count changed, update the count wording is automatic (derived),
     but update `site/public/llms.txt` if the description should change.

6. **Open a draft PR** to `main` summarizing: tools added, enriched, re-checked,
   and any flagged as dead/acquired. Then stop. Do not merge.

## Guardrails

- Quality over quantity. A vague or unverifiable entry is worse than none.
- Tools/platforms only. Firms, assessors, MSSPs, and authorities stay on `/market-map`.
- Keep enums exact; the build is the validation gate.
- Never auto-publish or auto-merge. The human is the approval gate.
