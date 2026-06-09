# Build Prompt — Rebuild eagleridge.io in Astro (v2, orchestrated)

Copy everything below the line into a fresh Claude Code session running **Fable** with access to
`~/GitHub/Eagle-Ridge` and `~/GitHub/eagle-ridge-methodology`. It is written to be handed off as a
single instruction and run autonomously.

---

## Orchestration & Decision Authority

You (Fable) are the **planner, manager, and reviewer**. Worker agents run on **Haiku**.

- **Fable owns every decision.** Architecture, repo layout, component breakdown, token extraction,
  how mirrors are generated — decide, record it in the Decision Log (`MIGRATION-NOTES.md`), and keep
  moving. Do not pause to ask the user. The only items reserved for the user are: the DNS cutover
  (manual by design), deleting or force-pushing anything on the live `main`, and any change to
  positioning or copy beyond what this prompt locks.
- **Fable does the design-judgment work itself**: reading the source site, extracting the design
  tokens, building the base layout/components, the market-map island, and all reviews/audits.
- **Haiku workers get mechanical tasks only**: port page X using the layout and tokens Fable
  already built; convert essay/glossary/privacy HTML to Markdown content collections; port the
  JSON-LD blocks. Every worker task ships with explicit acceptance criteria and the exact source
  file. Workers make no design or copy decisions — if a worker hits ambiguity, it stops and
  reports; Fable decides.
- **Never trust worker self-reports.** After each worker task, Fable verifies directly: run the
  build, run the parity diff (below), inspect the output. A worker saying "done" is a claim, not
  evidence.

## Role & Goal

Rebuild the **Eagle Ridge Advisory** marketing site (eagleridge.io) on **Astro** (latest stable,
`output: 'static'`). The current site is hand-written static HTML on GitHub Pages. The rebuild is
**static-first**: Astro's zero-client-JS default is the target; only the market map, the contact
form, and the PostHog snippet may produce client JS.

This is a **port, not a redesign**: same content, positioning, visual identity, and integrations.
Improve structure and maintainability, not the message.

## Source Material

**Primary — `Eagle-Ridge` repo (the live site):**

- Pages: `index.html`, `about.html`, `market-map.html`, `nobody-built-the-first-mile.html`,
  `glossary.html`, `privacy.html`, `discovery.html`
- `CLAUDE.md` — authoritative on positioning, audience, integrations, constraints
- `llms.txt`, `AGENTS.md`, `robots.txt`, `sitemap.xml`, the `.md` mirrors
- `scripts/generate-md-mirrors.py` — mirror + sitemap generator
- `.github/workflows/validate-llms-txt.yml` — CI check; **port it** (adapt paths to the new build)
- `Specs/market-map-rewrite-spec.md` — **already applied** to `market-map.html`. The current HTML
  is the copy authority. Honor the spec's standing rules on that page: no em dashes in body copy
  (en dashes in pricing ranges are fine); the deliberate "prepare you / test you" repetition stays.
- **Ignore stray files**: `eagleridge_landing.html`, `eagleridge_landing (1).html`,
  `pr-description.md`, `REBUILD-PROMPT*.md`.

**Reference (read-only) — `eagle-ridge-methodology` repo:**

- `CLAUDE.md` + `CMMC_METHODOLOGY.md` — verify positioning language against the 7-phase readiness
  lifecycle (gap assessment → remediation → SSP → SPRS → evidence → ConMon) if any copy question
  arises.
- **Scope guard:** `brand-research/` explores a brand for a *separate future GRC platform product*
  (kestrel/peregrine/tern naming). It is NOT Eagle Ridge's identity. Do not import anything from
  it. The eagle + cream/brown identity of the current site is the only visual authority.

## Positioning Invariants (locked — see Eagle-Ridge CLAUDE.md for full detail)

- Single persona: **small-business CEOs** needing CMMC / SOC 2 / ISO 27001 to win or keep contracts.
- Category: **GRC readiness** — upstream readiness partner; a C3PAO cannot do readiness AND the
  assessment for the same client.
- Plain language in headlines (no "GRC", "remediation", "POA&M"); "GRC readiness" OK as
  service/SEO label.
- **No PE/VC or due-diligence framing** — deliberately removed.
- Hero is a single static message: "Win the contract. Be ready to pass." The A/B experiment is
  retired — do not port any `hero-variant` / `hero_variant_shown` code.
- Visual identity (**amended 2026-06-09**): the brand kit at `design-reference/brand-kit/`
  supersedes the old cream/brown identity. Use its `tokens.css` (`--er-*`, Parchment default),
  `BRAND_KIT.md` rules (rules-over-boxes, near-square radii, serif-headline italic-umber
  signature), and Newsreader + IBM Plex type. Copy stays locked — the kit governs visuals only,
  and PE/VC copy remains banned.

## Tech Stack

- Astro, static output, pinned version, `npm` with committed lockfile.
- No UI framework. `.astro` components + plain HTML/CSS. Interactive pieces are isolated Astro
  islands/scripts — never React-for-the-site.
- Hand-written CSS with a single tokens file (custom properties). No Tailwind, no CSS framework.
- Content collections (Markdown) for `nobody-built-the-first-mile`, glossary, privacy; `.astro`
  pages for home, about, market map.

## Pages (full parity port)

| Route | Source | Notes |
|-------|--------|-------|
| `/` | `index.html` | Hero (static), GRC Readiness services (readiness leads, dark card), frameworks, social proof, contact form |
| `/about` | `about.html` | Positioning, who-we-serve (CEO-only), approach, CTA |
| `/market-map` | `market-map.html` | The one genuinely interactive page (89 entities, periodic-table layout). Fable ports its JS as an isolated island |
| `/nobody-built-the-first-mile` | same `.html` | Long-form essay → content collection |
| `/glossary` | `glossary.html` | Preserve `DefinedTermSet` JSON-LD |
| `/privacy` | `privacy.html` | Incl. PostHog disclosure |

> **Amended 2026-06-09:** `/discovery` is dropped from the rebuild (user decision — the Tally
> embed was never wired and the page was never live). Re-add later when the form exists.

Match the current footer nav on all pages (About, Market Map, First Mile, Glossary, Privacy,
LinkedIn, Contact). Preserve skip-link, focus styles, form `aria-*`, alt text.

## Integrations to Preserve

**PostHog** (project ID 209232) — snippet site-wide via one layout/head component, async.
Token `phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg`, host `https://us.i.posthog.com`,
`person_profiles: 'identified_only'`, register `{ site: 'eagleridge.io' }`.

**Web3Forms** — fetch-based submit, stays on page. Access key
`3e6cb410-9c3a-4af7-9a6a-dbf012e8d8a1`, endpoint `https://api.web3forms.com/submit`, subject
"New Lead for Eagle Ridge", hidden `botcheck` honeypot, `id="contact-form"` anchor. Tiny
island/inline script.

**LLM/SEO layer** (rebuild inside the Astro build where practical):

- Per-page `.md` mirrors declared via `<link rel="alternate" type="text/markdown">` — generate
  from rendered output during build (integration/hook/endpoint), or port
  `generate-md-mirrors.py` as a post-build step if that's more reliable. Fable decides; log it.
- `sitemap.xml` + human-readable `sitemap.md` (generated by the ported mirror script — no `@astrojs/sitemap`, see MIGRATION-NOTES D2).
- `llms.txt` — keep llmstxt.org structure, links point at `.md` mirrors, **update any stale
  PE/services copy** to current GRC-readiness positioning.
- `AGENTS.md` — port and update for the new build.
- `robots.txt` — crawl rules, sitemap pointer.
- JSON-LD: `Organization` (home), `AboutPage` (about), `DefinedTermSet` (glossary).
- Correct `Content-Type` for `.md` / `llms.txt` via Cloudflare `_headers` if needed.
- Port the `validate-llms-txt.yml` CI check.

## Parity Verification (the quality gate — run it, don't eyeball it)

The old site ships generated `.md` mirrors of every page. Use them as the **parity oracle**:

1. **Before building anything**, snapshot the current mirrors (`index.md`, `about.md`, …) to a
   `parity-baseline/` directory.
2. After each page port and at every milestone, run the mirror generator against the **new built
   HTML** and diff each new mirror against its baseline.
3. **Allowed diffs only**: `.html` → clean-URL link changes, the documented `llms.txt` copy
   updates, whitespace. Anything else is content drift — the worker's output is rejected and
   redone. Enumerate every allowed diff in `MIGRATION-NOTES.md`.

Additional machine checks before any milestone is called done:

- **JS audit**: list every `.js` (and inline `<script>`) in `dist/` — only market map, contact
  form, PostHog. Anything else gets removed.
- Internal link check across `dist/`; JSON-LD present on home/about/glossary; valid HTML;
  no console errors on any page.
- Lighthouse ≥ 95 performance/SEO/accessibility on home and about.

## Hosting / Deploy — Cloudflare Pages

- Git-connected build: `npm run build`, output `dist/`. Provide Pages config / `wrangler.toml` as
  appropriate; document build command + output dir in the README.
- `_redirects`: 301 every old `.html` path to its clean URL (`/about.html` → `/about`, all pages).
  **Never silently drop a `.html` URL.**
- Custom domain `eagleridge.io` is live on GitHub Pages via `CNAME`. **Leave `CNAME` and the old
  site untouched.** Document the DNS cutover as a manual checklist (including keeping GitHub Pages
  live until cutover) — do not change DNS.
- Public keys (PostHog token, Web3Forms key) stay inline as today. No new secrets or env vars.

## Deliverables

1. Working Astro project — Fable decides new repo vs. clean subdirectory of this repo, records the
   choice and rationale in the Decision Log.
2. All six pages at content parity (oracle-verified), restyled per the brand kit.
3. Integrations wired; LLM/SEO layer rebuilt; CI check ported.
4. Cloudflare Pages config + README covering `npm run dev`, build, and the manual DNS cutover
   checklist.
5. `MIGRATION-NOTES.md` containing: **Decision Log** (every choice Fable made and why), URL map
   (old → new), allowed parity diffs, and the remaining manual steps.

## Process (autonomous)

1. **Plan (Fable):** read all source material in both repos; write the component breakdown, token
   set, and worker task list with acceptance criteria; snapshot the parity baseline; start the
   Decision Log.
2. **Foundation (Fable):** scaffold the project; tokens + base layout + head component
   (PostHog/meta/JSON-LD slots); port the market-map island.
3. **Fan-out (Haiku):** page ports and content-collection conversions as parallel worker tasks,
   each scoped to one page with its acceptance criteria.
4. **Verify (Fable):** for each returned task — build, parity-diff, JS audit. Reject and redo on
   drift.
5. **Layer (mixed):** LLM/SEO layer, redirects, headers, Cloudflare config, CI port.
6. **Final audit (Fable):** full parity run, link check, Lighthouse, JS audit; write
   `MIGRATION-NOTES.md` and the README sections.

Work on a feature branch with a commit at every milestone. Open a PR at the end — do not merge or
touch DNS. If genuinely blocked on one of the three user-reserved items, stop and say exactly what
is needed; otherwise run to completion.
