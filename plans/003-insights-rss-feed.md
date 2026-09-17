# Plan 003: Publish an RSS feed for the Insights hub

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 990e09f..HEAD -- site/src/pages/insights.astro site/src/layouts/BaseLayout.astro site/src/content.config.ts site/package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. Note: at planning time the working
> tree carried uncommitted PostHog-wizard edits to `insights.astro` (tracking
> attributes) and `BaseLayout.astro` (token wiring) — plan 001 resolves those;
> this plan's excerpts show the parts those edits don't touch.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (but land after 001 so you're not building on a broken tree)
- **Category**: direction
- **Planned at**: commit `990e09f`, 2026-07-11

## Why this matters

The site's whole content strategy is machine-readable distribution: `.md`
mirrors of every page, `llms.txt`, `sitemap.md`, and per-article "Send to LLM"
buttons. The Insights hub lists dated articles from a proper content collection
(with `pubDate`, `description`, drafts) — yet there is no RSS/Atom feed, the
one syndication surface feed readers, newsletter tools, and many AI crawlers
actually poll. Astro ships an official `@astrojs/rss` helper, the data is
already structured, and the hub already solves the only wrinkle (two essays
live outside the collection) with a hand-maintained list this plan reuses. This
is the "surface asymmetry" case: publish-side infrastructure exists everywhere
except the standard feed format.

## Current state

- `site/src/content.config.ts` — defines the `articles` collection
  (glob over `src/content/articles/*.md`; schema has `title`, `description`,
  `pubDate: z.date()`, `draft`, `author`). Currently one article:
  `src/content/articles/readiness-before-the-assessment.md`.
- `site/src/pages/insights.astro` — the hub. Lines 5–29 hand-maintain a
  `standalone` array for the two essays that are bespoke `.astro` pages, with a
  deliberate decision comment (KEEP honoring it — do not migrate the essays):

  ```ts
  // Bespoke essays that live as standalone .astro pages under src/pages/insights/
  // ... aren't in the `articles` collection, so they'd never appear here. List
  // them so the index is complete.
  // ponytail: 2 hand-maintained entries — keep title/description/pubDate in sync
  // with each page's jsonLd. Promote to the collection only if these multiply.
  const standalone = [
    { id: 'compliance-should-just-work', data: { title: 'Compliance should just work', description: '...', pubDate: new Date('2026-06-12') } },
    { id: 'nobody-built-the-first-mile', data: { title: 'Nobody Built the First Mile', description: '...', pubDate: new Date('2026-06-09') } },
  ];

  const articles = [
    ...(await getCollection('articles')).filter((entry) => !entry.data.draft),
    ...standalone,
  ].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  ```

- `site/src/layouts/BaseLayout.astro` — shared `<head>`; `<link rel="alternate"
  type="text/markdown" ...>` at line 53 shows the existing pattern for alternate
  representations. Site constant: `const SITE = 'https://eagleridge.io';` (line 30).
- `site/astro.config.mjs` — `site: 'https://eagleridge.io'`, `output: 'static'`,
  `build.format: 'file'`. An endpoint file `src/pages/rss.xml.ts` emits
  `dist/rss.xml` regardless of `format: 'file'`.
- `site/package.json` — deps: `astro@6.4.5` + three `@fontsource` packages.
  Repo rule (from `CLAUDE.md` conventions): keep deps minimal; `@astrojs/rss`
  is the one official add this needs.
- The mirror/sitemap generator (`site/scripts/generate-md-mirrors.py`) only
  touches `*.html` pages — `rss.xml` needs no changes there. `robots.txt` and
  llms.txt validation are unaffected (the llms.txt CI check iterates
  `dist/*.html` only).

## Commands you will need

| Purpose | Command (from repo root) | Expected on success |
|---|---|---|
| Add dep | `npm install --prefix site @astrojs/rss` | exit 0; `site/package.json` + lockfile updated |
| Build | `cd site && npx astro build` | exit 0; `dist/rss.xml` exists |
| Feed well-formedness | `cd site && node -e "const s=require('fs').readFileSync('dist/rss.xml','utf8'); if(!/^<\?xml/.test(s)) process.exit(1); console.log('rss.xml present,', (s.match(/<item>/g)||[]).length, 'items')"` | `rss.xml present, 3 items` |

## Scope

**In scope**:
- `site/src/pages/rss.xml.ts` (create)
- `site/src/data/insights-standalone.ts` (create — shared standalone-essay list)
- `site/src/pages/insights.astro` (import the shared list instead of the local array)
- `site/src/layouts/BaseLayout.astro` (one `<link rel="alternate" type="application/rss+xml">` line)
- `site/package.json` + `site/package-lock.json` (`@astrojs/rss`)

**Out of scope** (do NOT touch):
- The two standalone essay pages under `site/src/pages/insights/*.astro` —
  the decision comment says they stay bespoke; do not migrate them into the
  collection.
- `site/public/llms.txt`, `site/scripts/*`, `parity-baseline/**` — the feed is
  additive; if any of these seem to need edits, STOP.
- `site/src/pages/insights/[...slug].astro`.

## Git workflow

- Branch: `advisor/003-insights-rss-feed`
- One commit; message style (match `git log`):
  `feat(site): RSS feed for Insights (/rss.xml)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract the standalone-essay list to a shared module

Create `site/src/data/insights-standalone.ts` exporting the exact `standalone`
array currently defined in `insights.astro:10-29` (same shape: `{ id, data: {
title, description, pubDate } }`), **moving the ponytail decision comment with
it**. Then in `site/src/pages/insights.astro`, delete the local array and
import the shared one:

```ts
import { standalone } from '../data/insights-standalone';
```

The rendered output of `/insights` must not change.

**Verify**: `cd site && npx astro build` → exit 0, and
`grep -c "Nobody Built the First Mile" dist/insights.html` → unchanged vs. before
(run the grep before and after; both non-zero and equal).

### Step 2: Create the feed endpoint

Create `site/src/pages/rss.xml.ts`:

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { standalone } from '../data/insights-standalone';

export async function GET(context: APIContext) {
  const articles = (await getCollection('articles')).filter((e) => !e.data.draft);
  const items = [...articles, ...standalone]
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map((e) => ({
      title: e.data.title,
      description: e.data.description,
      pubDate: e.data.pubDate,
      link: `/insights/${e.id}`,
    }));
  return rss({
    title: 'Eagle Ridge Advisory — Insights',
    description:
      'Plain-language thinking on CMMC, SOC 2, and ISO 27001 readiness for small-business CEOs who need to win and keep contracts.',
    site: context.site!,
    items,
  });
}
```

(The description string matches the hub's JSON-LD description in
`insights.astro` — keep them identical.)

**Verify**: `cd site && npx astro build` → exit 0; `ls dist/rss.xml` → exists;
the well-formedness command from the table → `rss.xml present, 3 items`.

### Step 3: Advertise the feed in `<head>`

In `site/src/layouts/BaseLayout.astro`, directly after the markdown-alternate
line (line 53, `{!noindex && <link rel="alternate" type="text/markdown" ...>}`),
add:

```astro
<link rel="alternate" type="application/rss+xml" title="Eagle Ridge Advisory — Insights" href="/rss.xml" />
```

(Unconditional — a site-wide feed link on every page is standard.)

**Verify**: `cd site && npx astro build && grep -c 'application/rss+xml' dist/index.html` → `1`

## Test plan

No test framework exists; the gates are build success plus the feed checks:

- Well-formedness + item count (commands table).
- Every `<link>` in the feed is absolute:
  `cd site && node -e "const s=require('fs').readFileSync('dist/rss.xml','utf8'); const links=[...s.matchAll(/<link>([^<]+)<\\/link>/g)].map(m=>m[1]); if(links.some(l=>!l.startsWith('https://eagleridge.io/'))) {console.error(links); process.exit(1)} console.log('links absolute:', links.length)"`
  → `links absolute: 4` (3 items + the channel link).
- Parity guard: `.md` mirrors are unaffected — if the repo's Python deps are
  available, run the full `npm run build` and confirm the generator output
  lists the same mirrors as before.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `cd site && npx astro build` exits 0
- [ ] `dist/rss.xml` exists, XML-prefixed, with exactly 3 `<item>` entries (1 collection article + 2 standalone essays)
- [ ] All feed links are absolute `https://eagleridge.io/...` URLs
- [ ] `grep -c 'application/rss+xml' site/dist/index.html` → `1`
- [ ] `grep -c "const standalone" site/src/pages/insights.astro` → `0` (moved, not duplicated)
- [ ] `git status` shows only the six in-scope files changed
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `@astrojs/rss` is incompatible with `astro@6.4.5` (peer-dependency error on
  install) — report the version matrix; do not force or downgrade anything.
- `insights.astro` no longer contains the `standalone` array as excerpted
  (drifted).
- The feed endpoint changes any existing `dist/*.html` or `.md` mirror output
  (it must be purely additive).

## Maintenance notes

- New collection articles appear in the feed automatically. New *standalone*
  essays must be added to `site/src/data/insights-standalone.ts` (same
  hand-sync rule the hub already had — the shared module means one edit now
  covers hub + feed + its JSON-LD ordering).
- If the standalone essays ever get migrated into the collection (the decision
  comment's "only if these multiply" trigger), delete the shared module and
  the feed's spread of it in the same PR.
- Optional follow-up, deliberately deferred: add the feed URL to
  `site/public/llms.txt` and the footer. Cosmetic; do it when either file is
  next edited.
