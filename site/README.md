# eagleridge.io — Astro + EmDash site

The Eagle Ridge Advisory marketing site: Astro with the
[EmDash CMS](https://github.com/emdash-cms/emdash) integration, deployed as a
Cloudflare Worker (see `../plans/006-migrate-to-emdash.md`). All marketing
pages are prerendered — near-zero client JS ships on them (the market-map
island, the contact-form script, and the PostHog snippet); the EmDash admin
(`/_emdash/admin`) and API render on demand.

Brand system: `../design-reference/brand-kit/` (tokens in
`src/styles/tokens.css`). Content parity is enforced against
`../parity-baseline/` — see `../MIGRATION-NOTES.md` for the decision log and
the allowed-diff list.

## Local development

```sh
npm install
npm run dev          # dev server at localhost:4321
```

## Build

```sh
npm run build        # astro build + markdown-mirror/sitemap generation
```

The build is two steps (wired into `npm run build`):

1. `astro build` → the Worker bundle in `dist/server/` (from `src/worker.ts`)
   and prerendered static pages in `dist/client/`
2. `scripts/generate-md-mirrors.py` → `.md` mirrors, `sitemap.xml`,
   `sitemap.md` in `dist/client/`

The Python step needs `beautifulsoup4` and `markdownify` at the **pinned
versions** in `scripts/requirements.txt` (they define the parity oracle's
output — do not bump casually). Locally, if they aren't installed:

```sh
uv run --with markdownify==1.2.2 --with beautifulsoup4==4.14.3 python scripts/generate-md-mirrors.py
```

## Parity check

After any content change, regenerate and diff against the baseline:

```sh
for f in ../parity-baseline/*.md; do diff -u "$f" "dist/client/$(basename $f)"; done
```

Only the diffs enumerated in `../MIGRATION-NOTES.md` § Allowed parity diffs
are acceptable.

## Preview with production URL behavior

Prerendered pages use `format:'file'` (`about.html` served at `/about`).
Plain static servers won't map clean URLs or run the Worker — use wrangler,
which runs the real Worker (markdown negotiation, legacy 301s, EmDash) with
local D1/R2 simulations, after a build:

```sh
npx wrangler dev
```

## Deploy — Cloudflare Workers

`.github/workflows/deploy.yml` deploys on pushes to `main` touching `site/**`
(build + `npx wrangler deploy`; wrangler follows `.wrangler/deploy/config.json`
to the build-emitted `dist/server/wrangler.json`). Bindings and cutover
provisioning live in `wrangler.jsonc` and `../plans/006-migrate-to-emdash.md`.

`public/_redirects` 301s every legacy `.html` URL to its clean URL — served
by the Worker (`src/lib/redirects.js`). `public/_headers` sets
`text/markdown` for the `.md` mirrors and `text/plain` for `llms.txt`, applied
by the static-asset layer.
