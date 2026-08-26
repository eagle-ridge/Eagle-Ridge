# 004 — Port the marketing explainers to eagleridge.io

**Status:** implemented (branch feat/port-marketing-explainers, 2026-08-24) · **Written:** 2026-08-24 · **Source pages:** `eagle-ridge-methodology/marketing/` (merged there via PR #191)

## Goal

Two client/prospect-facing explainer pages, already reviewed (deirdre prose pass, claim-by-claim fact check, gilfoyle substance review, final verification) and live as private Claude artifacts, become public pages on eagleridge.io:

| Source (eagle-ridge-methodology) | Target URL |
|---|---|
| `marketing/path-to-88.html` — CMMC L2, SPRS waterfall | `eagleridge.io/path-to-88` |
| `marketing/soc2-observation-window.html` — SOC 2 Type II, observation window | `eagleridge.io/soc2-observation-window` |

Both are self-contained HTML: inline CSS token block, Google Fonts links, hand-authored inline SVGs with `<title>` tooltips. All figure arithmetic is verified — **do not change any number without rerunning the claims against `eagle-ridge-methodology/data/nist-800-171-controls.yaml` and the sources cited in each page's footer.**

## Approach: convert to Astro pages (NOT raw `public/` HTML)

Raw HTML in `site/public/` would serve, but it bypasses nav, the `.md` mirror pipeline, the sitemap, and fails `validate-llms-txt.yml` (every non-noindex `dist/*.html` must appear in `public/llms.txt`). Convert instead:

1. **Create `site/src/pages/path-to-88.astro` and `site/src/pages/soc2-observation-window.astro`**, each wrapped in `BaseLayout` with `title`, `description`, `path` props.
   - `title` is PARITY-CRITICAL (becomes the mirror H1). Use "The Path to 88" / "The Observation Window".
   - Page content goes inside the layout's `<main>` (the mirror generator strips header/footer/nav and takes `<main>` — content outside it mirrors as junk).
   - Move each page's CSS into the component's scoped `<style>` block (SVG classes `.ax`, `.lbl`, `.num`, `.thresh` are generic; scoping prevents collisions). Drop the pages' own `<meta charset>`, viewport, and `<title>` — BaseLayout provides all three plus `<html lang="en">`.
   - SVGs paste in verbatim. Keep the `<title>` tooltips and `aria-label`s.

2. **Fonts:** delete the Google Fonts `<link>`s. The site self-hosts via @fontsource imports in `site/src/layouts/BaseLayout.astro` — but ships only Newsreader 400 and IBM Plex Sans 300/400/500. The pages use Newsreader 500/600 (h1/h2) and Plex Sans 600 (labels). Add `@fontsource/newsreader/500.css`, `/600.css`, `@fontsource/ibm-plex-sans/600.css` imports to BaseLayout (preferred), or snap the weights down and eyeball the headings.

3. **Tokens:** remap page vars to the site set in `site/src/styles/tokens.css`: `--paper`→`--er-paper`, `--ink`→`--er-ink`, `--ink-soft`→`--er-ink-soft`, `--mute`→`--er-mute`, `--rule`→`--er-rule`, fonts→`--er-font-*`. Exceptions: `--terra #B14E26` has no `--er-*` equivalent and `--er-gold` fails WCAG as a mark — keep `--terra`, `--slate`, and `--mark-gray #9A8E7A` as page-scoped variables. Verify the swap doesn't shift chart contrast (the gray/terracotta palette was validated against `#FAF7F0`; `--er-paper` may differ slightly from `--er-bg #F6F2EA` — check which one backs the content column and re-check the "68 met" ink-on-gray labels).

4. **Mirror / SEO plumbing** (all CI-enforced):
   - Add both pages to the `PAGES` list in `site/scripts/generate-md-mirrors.py` (dist filename, clean path, sitemap label).
   - Create `parity-baseline/path-to-88.md` and `parity-baseline/soc2-observation-window.md` — a PAGES entry with no baseline fails the parity job. Generate via the mirror script, then review.
   - Add `## Pages` bullets in `site/public/llms.txt` (this file, NOT a root llms.txt) pointing at `https://eagleridge.io/path-to-88.md` etc.
   - Sitemap rows come free from `PAGES`.

5. **Links in:**
   - `site/src/components/Header.astro` `resources` array (single const covers desktop + mobile menus).
   - `site/src/components/Footer.astro` flat link list.
   - In-body: `cmmc-compliance-consultant.astro` SPRS/process section → Path to 88; `about.astro` and `cmmc-compliance-consultant.astro:133` "we also support SOC 2 Type 2" (currently linkless) → Observation Window. ⚠️ Any in-`<main>` edit to those pages requires regenerating their `parity-baseline/*.md`; header/footer edits are parity-safe.

## Build, verify, deploy

- Build: `cd site && npm run build` (Node ≥ 22.12). The mirror step needs `uv run --with markdownify==1.2.2 --with beautifulsoup4==4.14.3 python scripts/generate-md-mirrors.py` locally.
- Visual check: serve `dist/`, screenshot both pages at 1280×800 and mobile width. The three historical bug classes on these pages: mojibake (charset), label collisions, clipped annotations. Also hover a few SVG tooltips.
- Deploy: push to `main` touching `site/**` fires `.github/workflows/deploy.yml`. Manual fallback: `env -C site npx wrangler pages deploy dist --project-name eagleridge --branch main` with `CLOUDFLARE_API_TOKEN` from `op://Developer Vault/Dash Cloudflare API Credential/credential`, account `702342b70e150343381e0829834cbcc7`.
- **A git push is not a deploy.** Either way, `curl -s https://eagleridge.io/path-to-88 | grep "conditional-pass line"` (and the SOC 2 equivalent) before calling it live.

## Copy constraints (must survive the port verbatim in substance)

- CMMC: "Registered Provider" (never CCP); "gap-documented SSP … becomes assessment-ready once policies are signed and tools are deployed"; representative-engagement disclaimer; sources footer (DoD Methodology v1.2.1, 32 CFR §170.21, NIST SP 800-171 Rev 2).
- SOC 2: auditor-independence disclaimer (CPA firm audits, Eagle Ridge never audits its own work); no clean-report promise ("Preparation aims at a clean report. Only the auditor can issue one."); sources footer (AICPA TSC 2017 w/ 2022 PoF, AT-C 205).
- Both: `chris@eagleridge.io`.

## Follow-ups (note, don't do in this pass)

- No og:image convention exists site-wide; if added later, see memory `social-og-image-rendering` (fixed-viewport HTML → screenshot → same-origin og.png).
- The claude.ai artifacts (c3dbbb07…, eefa57c1…) stay as internal previews; once live, the site is canonical — stop republishing the artifacts on copy changes, edit the .astro pages instead, and back-port any copy fix to `eagle-ridge-methodology/marketing/` so the two repos don't drift.
- Maturity-ladder artifact: bead `chrismcconnell-u3rj` in eagle-ridge-methodology.
