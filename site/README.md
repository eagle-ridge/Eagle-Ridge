# eagleridge.io — Astro site

The Eagle Ridge Advisory marketing site, rebuilt on Astro. Static output,
near-zero client JS (the market-map island, the contact-form script, and the
PostHog snippet are the only JavaScript that ships).

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

1. `astro build` → static pages in `dist/`
2. `scripts/generate-md-mirrors.py` → `.md` mirrors, `sitemap.xml`,
   `sitemap.md` in `dist/`

The Python step needs `beautifulsoup4` and `markdownify` at the **pinned
versions** in `scripts/requirements.txt` (they define the parity oracle's
output — do not bump casually). Locally, if they aren't installed:

```sh
uv run --with markdownify==1.2.2 --with beautifulsoup4==4.14.3 python scripts/generate-md-mirrors.py
```

## Parity check

After any content change, regenerate and diff against the baseline:

```sh
for f in ../parity-baseline/*.md; do diff -u "$f" "dist/$(basename $f)"; done
```

Only the diffs enumerated in `../MIGRATION-NOTES.md` § Allowed parity diffs
are acceptable.

## Preview with production URL behavior

`dist/` uses `format:'file'` (`about.html` served at `/about`). Plain static
servers won't map clean URLs — use wrangler, which reproduces Cloudflare
Pages routing including `_redirects`:

```sh
npx wrangler pages dev dist
```

## Deploy — Cloudflare Pages

Git-connected Pages project:

| Setting          | Value                                                            |
|------------------|------------------------------------------------------------------|
| Production branch| `main`                                                           |
| Root directory   | `site`                                                           |
| Build command    | `python3 -m pip install -r scripts/requirements.txt && npm run build` |
| Output directory | `dist`                                                           |
| Env vars         | `PYTHON_VERSION=3.12`                                            |

`public/_redirects` 301s every legacy `.html` URL to its clean URL.
`public/_headers` sets `text/markdown` for the `.md` mirrors and
`text/plain` for `llms.txt`.

## DNS cutover checklist (manual — do not automate)

The old site keeps serving from GitHub Pages until you do this:

1. Create the Cloudflare Pages project (settings above) and confirm the
   `*.pages.dev` preview renders all six pages correctly.
2. Add the custom domain `eagleridge.io` to the Pages project (Cloudflare
   dashboard → the project → Custom domains).
3. At the DNS provider, point `eagleridge.io` (apex `A`/`AAAA` or `CNAME`
   flattening) at the Pages project per Cloudflare's instructions. Keep TTL
   low (300s) for the cutover.
4. Verify: `curl -I https://eagleridge.io/about.html` returns `301` →
   `/about`; `curl https://eagleridge.io/llms.txt` serves the new copy;
   spot-check `/market-map` interactivity and the contact form.
5. Only after verification: archive the GitHub Pages deployment (disable
   Pages in the old repo settings or remove the legacy root HTML in a
   follow-up PR). Do NOT delete `CNAME` before DNS has moved.
