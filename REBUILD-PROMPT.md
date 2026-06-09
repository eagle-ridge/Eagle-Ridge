# Build Prompt — Rebuild eagleridge.io in Astro

Copy everything below the line into a fresh Claude Code / Cowork session that has access to the
Eagle Ridge repo. It is written to be handed off as a single instruction.

---

## Role & Goal

You are rebuilding the **Eagle Ridge Advisory** marketing site (eagleridge.io) from scratch on
**Astro**. The current site is hand-written static HTML on GitHub Pages. The rebuild must be
**static-first, lightweight, and ship as little JavaScript as possible** — Astro's default of zero
client JS is the target; only hydrate the few interactive pieces that genuinely need it.

This is a **port, not a redesign**: carry over the existing content, positioning, visual identity,
and integrations. Improve the structure and maintainability, not the message.

Do not start coding until you have (1) read the current site and (2) confirmed the page inventory
and component plan with me.

## Source Material — Read First

The current site lives in this repo. Before writing anything, read:

- `index.html`, `about.html`, `market-map.html`, `nobody-built-the-first-mile.html`,
  `glossary.html`, `privacy.html`, `discovery.html`
- `CLAUDE.md` — authoritative on positioning, audience, integrations, and constraints
- `llms.txt`, `AGENTS.md`, `robots.txt`, `sitemap.xml`
- `scripts/generate-md-mirrors.py` — the current Markdown-mirror + sitemap generator

**Positioning is locked (see CLAUDE.md):**
- Single primary persona: **small-business CEOs** — founder-led teams with no dedicated
  security/compliance function who need CMMC, SOC 2, or ISO 27001 to win or keep contracts.
- Category: **GRC readiness** — full lifecycle (gap assessment → remediation → SSP → SPRS →
  evidence → ConMon). We get clients ready *before* they're assessed.
- Key frame: a C3PAO cannot perform readiness AND the assessment for the same client, so Eagle
  Ridge is the **upstream readiness partner**, not a competitor to assessors.
- Copy rule: plain language in headline copy (no "GRC", "remediation", "POA&M" in headlines);
  "GRC readiness" is acceptable as a service/SEO/industry label.
- **Do NOT reintroduce PE/VC or due-diligence framing** — it was deliberately removed.
- The homepage hero A/B test was retired; the hero is a single static message
  ("Win the contract. Be ready to pass."). Do not rebuild any A/B variant machinery.

**Visual identity to preserve:** cream/brown palette (`#f9f6ec` background, `#3d2817` dark brown
text/cards, `#e0ddc8`/`#d0cdb8` borders, white section bands), system font stack, generous
spacing, rounded cards, the dark CTA band. Pull the exact tokens from the current CSS and
centralize them.

## Tech Stack

- **Astro** (latest stable), static output (`output: 'static'`).
- **No UI framework** unless a component truly needs interactivity. Prefer `.astro` components
  and plain HTML/CSS. If something interactive is unavoidable, use an Astro island with a
  lightweight approach — do not pull in React for the whole site.
- **Styling:** centralize the existing palette/spacing as CSS custom properties (a single
  `tokens.css` or Astro global style). Keep CSS hand-written and small; do not add Tailwind or a
  heavy CSS framework unless I ask.
- **Content:** use Astro **content collections** for the long-form/markdown-heavy pages
  (`nobody-built-the-first-mile`, glossary, privacy) so they're authored in Markdown/MDX, and
  `.astro` pages for the structured marketing pages (home, about).
- **Node + package manager:** use `npm` and commit a lockfile. Pin the Astro version.

## Pages to Build (full parity port)

| Route | Source | Notes |
|-------|--------|-------|
| `/` | `index.html` | Hero (single static message), GRC Readiness services (readiness leads as primary dark card), frameworks, social proof, contact form |
| `/about` | `about.html` | GRC readiness positioning, who-we-serve (CEO-only), approach, CTA |
| `/market-map` | `market-map.html` | Interactive CMMC market map (89 entities, periodic-table layout). This is the one genuinely interactive page — port its JS as an Astro island/script; keep it client-side but isolated |
| `/nobody-built-the-first-mile` | `nobody-built-the-first-mile.html` | Long-form essay, Markdown content collection |
| `/glossary` | `glossary.html` | CMMC/NIST terminology, preserve `DefinedTermSet` JSON-LD |
| `/privacy` | `privacy.html` | Privacy policy incl. PostHog disclosure |
| `/discovery` | `discovery.html` | Unlisted Tally embed, `noindex,nofollow`. Keep out of sitemap and disallowed in robots.txt |

Match the current footer nav across all pages (About, Market Map, First Mile, Glossary, Privacy,
LinkedIn, Contact).

## Integrations to Preserve

**PostHog analytics**
- Inject the snippet site-wide via a single Astro layout/head component (loads async).
- Token `phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg`, host `https://us.i.posthog.com`,
  `person_profiles: 'identified_only'`, register `{ site: 'eagleridge.io' }`.
- Preserve the `discovery_page_viewed` event on `/discovery`.
- Do NOT carry over any `hero_variant_shown` / `hero-variant` flag code — that test is retired.

**Web3Forms contact form**
- Keep the fetch-based submit that stays on the page (no redirect).
- Access key `3e6cb410-9c3a-4af7-9a6a-dbf012e8d8a1`, endpoint `https://api.web3forms.com/submit`,
  subject "New Lead for Eagle Ridge", hidden `botcheck` honeypot, `id="contact-form"` anchor.
- This is one of the few places client JS is justified — keep it a tiny inline/island script.

**LLM/SEO layer (rebuild as part of the Astro build, not a separate post-step if avoidable)**
- Per-page **Markdown mirrors** (`/index.md`, `/about.md`, …) declared via
  `<link rel="alternate" type="text/markdown">`. Generate these from the rendered content during
  the build (an Astro integration, build hook, or endpoint) rather than the standalone Python
  script — but it's acceptable to port `generate-md-mirrors.py` if that's faster and reliable.
- **`sitemap.xml`** (use `@astrojs/sitemap`, exclude `/discovery`) and a human-readable
  **`sitemap.md`**.
- **`llms.txt`** at the root — keep the llmstxt.org structure, point links at the `.md` mirrors,
  and update copy to the current GRC-readiness positioning (the existing one may still have stale
  PE/service language — fix it).
- **`AGENTS.md`** — port and update to match the new build.
- **`robots.txt`** — crawl rules + sitemap pointer, disallow `/discovery`.
- **JSON-LD:** preserve `Organization` (home), `AboutPage` (about), and `DefinedTermSet`
  (glossary) structured data.
- Keep `.nojekyll` semantics irrelevant now (no Jekyll), but ensure the `.md` mirrors are served
  as raw static files on Cloudflare.

## Hosting / Deploy — Cloudflare Pages

- Target **Cloudflare Pages** with a Git-connected build (`npm run build`, output `dist/`).
- Provide a `wrangler.toml` / Pages config as appropriate and document the build command + output
  directory in the README.
- Custom domain **eagleridge.io** (currently on GitHub Pages via CNAME). Document the DNS cutover
  steps but **do not change DNS yourself** — flag it as a manual step for me, including how to keep
  the old GitHub Pages site live until cutover.
- Ensure correct `Content-Type` for `.md` mirrors and `llms.txt` (`text/markdown` / `text/plain`)
  via Cloudflare Pages `_headers` if needed.
- Add a `_redirects` file if any old paths (e.g. `/about.html` → `/about`) need 301s so existing
  links and SEO don't break. **Preserve `.html` URLs or 301 them — do not silently drop them.**

## Constraints & Quality Bar

- **Ship minimal JS.** Audit the final `dist/` — only the market map, the contact form, and the
  PostHog snippet should produce client JS. Everything else is static HTML/CSS.
- **No console errors**, valid HTML, Lighthouse performance/SEO/accessibility ≥ 95 on home and
  about.
- Preserve the **skip-link** and existing accessibility affordances (focus styles, `aria-*` on the
  form, alt text).
- Don't touch `README.md`-class docs except to update build instructions; don't touch logo files.
- Keep secrets that are already public (PostHog token, Web3Forms key) inline as today — they are
  safe in client HTML. Do not invent new secrets or env requirements beyond the Cloudflare build.

## Deliverables

1. A working Astro project (new repo or a clean subdirectory — propose which and why).
2. All pages above at parity, same look and message.
3. Integrations wired (PostHog, Web3Forms, LLM/SEO layer).
4. Cloudflare Pages build config + a README section covering local dev (`npm run dev`), build,
   and the **manual DNS cutover checklist**.
5. A short `MIGRATION-NOTES.md`: what changed, what URLs map where, what I still need to do by hand.

## Process

1. Read the source material and restate the page inventory + component breakdown back to me.
2. Propose the project structure (collections vs. pages, where tokens live, how `.md` mirrors are
   generated) and **wait for my go-ahead**.
3. Build incrementally: scaffold → layout + tokens → home + about → remaining pages → market map
   → SEO/LLM layer → Cloudflare config.
4. After each milestone, show me the diff/preview. Verify the build output is JS-light before
   calling it done.

Ask clarifying questions whenever a choice would be hard to reverse. Do not assume — confirm.
