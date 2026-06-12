# Insights Hub + Header Navigation — Design
**Date:** 2026-06-12 **Site:** eagleridge.io (Astro static site in `site/`, deployed to Cloudflare Pages) **Goal:** Give the site a real header navigation and a content hub ("Insights") where dated articles auto-list from markdown, so a visitor can both _navigate_ the site and _learn who Eagle Ridge is_ through published thinking.
## Context
- The live site is the Astro rebuild in `site/`. The repo-root `*.html` files are legacy; the root `CLAUDE.md` is stale (still describes hand-written root HTML as canonical).
  
- **There is no navigation menu today.** `Header.astro` is a logo lockup + "GRC Readiness" tagline only. Pages are reachable solely via the footer and inline CTAs.
  
- An existing `pages` content collection (`src/content.config.ts`, `src/content/pages/*.md`) backs glossary/privacy/essay via thin `.astro` wrappers. There is no _listing_ page or blog-style hub.
  
- The build runs `scripts/generate-md-mirrors.py`, which emits a `.md` mirror + sitemap entry per page from a **hardcoded** `PAGES` **list**. It strips `<header>/<footer>/<nav>` and `[data-md-exclude]` from mirrors. A parity oracle (`parity-baseline/`) and a `validate-llms-txt` CI guard against drift.
  
## Decisions (confirmed with user)
1. **Content hub shape:** Insights hub (blog index) — auto-listing dated articles. (Chosen over a curated resource library: the footer already links evergreen assets, and dated thinking is the trust signal that converts the CEO buyer.)
  
2. **Nav contents:** Lean — **About · Insights · Contact**. Market Map / Glossary stay in the footer.
  
3. **Seed content:** Author writes the real copy; this work seeds **one short starter article** (flagged for user approval) so the hub launches non-empty.
  
## Architecture
### 1. Navigation — `src/components/Header.astro`
- Add `<nav aria-label="Primary">` inside the existing `.site-header` with three links: **About** (`/about`), **Insights** (`/insights`), **Contact** (`/#contact-form`).
  
- Brand-consistent styling (IBM Plex Mono, uppercase, small caps tracking) added to `src/styles/global.css`.
  
- `aria-current="page"` on the active link — derived from a `currentPath` prop threaded from `BaseLayout` (which already receives `path`).
  
- Responsive: three short links wrap cleanly; **no hamburger** (YAGNI for 3 items). Verify wrap behavior at 360px.
  
- Mirrors are unaffected — the generator strips `<header>`/`<nav>`.
  
### 2. Footer — `src/components/Footer.astro`
- Insert an **Insights** link (after About) for nav/footer parity.
  
### 3. Content collection — `src/content.config.ts`
Add an `articles` collection alongside `pages`:

```ts
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    author: z.string().default('Eagle Ridge Advisory'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});
export const collections = { pages, articles };
```
### 4. Insights index — `src/pages/insights.astro`
- `getCollection('articles')` → filter `!data.draft` → sort by `pubDate` desc.
  
- Render a list of article cards: title (links to article), formatted `pubDate`, `description`, "Read →".
  
- Empty-state fallback ("New thinking coming soon") if the collection is empty.
  
- `BaseLayout` with `path="/insights"`, `title`, `description`; `Blog` JSON-LD in the head slot.
  
### 5. Article template — `src/pages/insights/[...slug].astro`
- `getStaticPaths()` over `getCollection('articles')` (drafts excluded), one route per article.
  
- `render(entry)` into a `.prose container` `<article>`: H1 title, date byline (+ author), "← Back to Insights".
  
- `BaseLayout` with `path={`/insights/${entry.id}`}`; `BlogPosting` JSON-LD (headline, datePublished, dateModified, author).
  
### 6. Seed article — `src/content/articles/<slug>.md`
- One ~400-word on-brand starter (working title: "Why readiness comes before the assessment"), plain-language CEO voice, `draft: false`, dated 2026-06-12.
  
- Copy flagged in the PR/spec as author-review-pending.
  
### 7. Build pipeline — `site/scripts/generate-md-mirrors.py`
- Keep the static `PAGES` list for fixed pages; **append** `/insights` **and dynamically-discovered** `dist/insights/*.html` so each article auto-gets a `.md` mirror + sitemap row. No per-post edits.
  
- Preserve existing extraction/strip logic byte-compatibly (parity oracle).
  
### 8. `site/public/llms.txt` (or source of it)
- Add an **Insights** section pointing at `/insights.md` and article `.md` mirrors.
  
## Data flow
```
src/content/articles/*.md ──glob──> articles collection
        │                                   │
        ├── insights.astro (index) ─────────┤
        └── insights/[...slug].astro ───────┘
                     │ astro build
                     ▼
        dist/insights.html + dist/insights/*.html
                     │ generate-md-mirrors.py
                     ▼
        dist/insights.md + dist/insights/*.md + sitemap rows
```
## Error / edge handling
- Empty collection → index empty-state, no broken build.
  
- `draft: true` → excluded from index, `getStaticPaths`, and mirrors.
  
- Generator: missing `dist/insights/` glob → zero article mirrors, index mirror still emitted (partial-build tolerant, matches existing warn-and-skip behavior).
  
## Verification
- `npm run build` succeeds (Astro build + md-mirror generation).
  
- `/insights` lists the seed article; article page renders with correct title/date/JSON-LD.
  
- Nav appears site-wide, `aria-current` correct per page, wraps at 360px, keyboard-focusable.
  
- Parity oracle / `validate-llms-txt` CI green (or baseline updated intentionally for the new pages).
  
- Run the build and inspect `dist/` mirrors myself — do not trust subagent self-reports.
  
## Subagents (parallel workers)
- **A — Nav:** `Header.astro`, `Footer.astro`, header CSS in `global.css` + `BaseLayout` path threading.
  
- **B — Hub:** `content.config.ts`, `insights.astro`, `insights/[...slug].astro`, seed article.
  
- **C — Pipeline:** `generate-md-mirrors.py`, `llms.txt`, build + parity verification (runs after A & B land). A and B touch mostly disjoint files (shared: `global.css`, `BaseLayout`); coordinate those two edits. Main session does final `npm run build` + parity check.
  
## Clean up / Housekeeping
- Root `CLAUDE.md` staleness (describes legacy root HTML as canonical; live site is Astro in `site/`). Tracked in **[#26](https://github.com/eagle-ridge/Eagle-Ridge/issues/26)** — out of scope for this PR.
- Tag/category filtering, RSS, pagination, author pages — deferred (YAGNI until article volume warrants). Tracked in **[#27](https://github.com/eagle-ridge/Eagle-Ridge/issues/27)**.
