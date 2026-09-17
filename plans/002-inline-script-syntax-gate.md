# Plan 002: Add a CI syntax gate for inline scripts in built pages

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 990e09f..HEAD -- site/scripts site/package.json .github/workflows`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (complements plan 001; order between them doesn't matter)
- **Category**: tests
- **Planned at**: commit `990e09f`, 2026-07-11

## Why this matters

This Astro site relies heavily on `<script is:inline>` blocks (form submit
handlers, PostHog init, CTA tracking). Astro copies `is:inline` script bodies
into the HTML **without parsing them**, so a JavaScript syntax error in one —
exactly what a code-gen wizard just produced by writing curly-quote string
delimiters (see plan 001) — sails through `npm run build` and both GitHub
workflows with green checks, then throws `SyntaxError` in every visitor's
browser and kills the contact form. The repo has no JS lint, no typecheck
step, and no tests, so nothing stands between that class of bug and
production. A ~30-line Node script that parses every inline script in the
built `dist/` HTML closes the gap with zero new dependencies.

## Current state

- `site/scripts/check-entity-fields.mjs` — the repo's existing pattern for a
  standalone Node check script: plain `node:fs` + a loop, `console.error` per
  problem, `process.exit(1)` on any error, a final `✓ ...` success line. New
  check scripts should match this shape. Its npm wiring in `site/package.json`:

  ```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && python3 scripts/generate-md-mirrors.py",
    "preview": "astro preview",
    "astro": "astro",
    "check:entities": "node scripts/check-entity-fields.mjs"
  }
  ```

- `.github/workflows/deploy.yml` — deploys on push to `main`; runs
  `npm run check:entities` then `npm run build` (steps named
  "Validate entity fields (HTML allowlist + https url enforcement)" and
  "Build (astro build + md mirrors)"), then wrangler deploy.
- `.github/workflows/validate-llms-txt.yml` — PR check; runs
  `npm run build` (step "Build site (includes mirror + sitemap generation)")
  then `npm run check:entities` (step "Validate entity fields") plus llms.txt
  structure checks. Its `defaults.run.working-directory` is `site`.
- Built pages land in `site/dist/*.html` and `site/dist/insights/*.html`
  (`build.format: 'file'` in `site/astro.config.mjs`).
- Inline scripts to check: every `<script>` without a `src` attribute, except
  `type="application/ld+json"` blocks (JSON-LD, not executable JS). Processed
  (non-inline) Astro scripts are emitted as external `_astro/*.js` files or
  inline without `src` — checking them too is harmless and free.

## Commands you will need

| Purpose | Command (from repo root) | Expected on success |
|---|---|---|
| Install | `npm install --prefix site` | exit 0 |
| Build (Astro only) | `cd site && npx astro build` | exit 0 |
| New check | `cd site && npm run check:inline-scripts` | `✓ ...` line, exit 0 |

Note: the full `npm run build` also needs Python deps (`bs4`, `markdownify`)
for the mirror generator. For local verification of this plan, `npx astro build`
alone is enough to populate `dist/*.html`.

## Scope

**In scope**:
- `site/scripts/check-inline-scripts.mjs` (create)
- `site/package.json` (add one script entry)
- `.github/workflows/deploy.yml` (add one step)
- `.github/workflows/validate-llms-txt.yml` (add one step)

**Out of scope** (do NOT touch):
- Any file under `site/src/` — this plan adds detection only; broken sources
  are plan 001's job.
- `parity-baseline/**`, `site/public/**`.
- Do not add ESLint, `@astrojs/check`, TypeScript, or any new dependency —
  the gate must stay dependency-free (`node:vm` is built in).

## Git workflow

- Branch: `advisor/002-inline-script-syntax-gate`
- One commit; message style (match `git log`):
  `ci(site): syntax-check inline scripts in built HTML`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `site/scripts/check-inline-scripts.mjs`

Model the file on `site/scripts/check-entity-fields.mjs` (imports at top,
errors counted, exit 1 on failure, `✓` summary on success). Behavior:

1. Recursively collect every `*.html` file under `dist/` (use
   `fs.readdirSync(dir, { recursive: true })` — Node 22 supports it — or
   `fs.globSync`; the repo pins Node >= 22.12 in `site/package.json` engines).
   If `dist/` is missing or contains no HTML, print an error telling the user
   to run the build first, and exit 1.
2. For each file, extract inline scripts with a regex equivalent to:
   `/<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g`
3. Skip matches whose attributes (`m[1]`) contain `application/ld+json`.
4. For each remaining body, run `new vm.Script(body, { filename })` from
   `node:vm` inside try/catch. A catch = one error: print
   `<file>: inline script #<n>: <error message>` via `console.error`.
5. On success print `✓ <N> inline scripts across <M> pages parse cleanly`.

Include a one-line header comment stating why this exists: Astro does not
parse `is:inline` script bodies, so this is the only syntax gate for them.

**Verify**: `cd site && npx astro build && node scripts/check-inline-scripts.mjs`
→ if plan 001 has landed: `✓ ...`, exit 0. If plan 001 has NOT landed and the
wizard's broken working-tree diff is present, the script must FAIL, naming
`index.html` and `discovery.html` — that failure is the proof the gate works;
note it and continue (the gate is correct either way).

### Step 2: Wire the npm script

In `site/package.json` scripts, after `"check:entities"`, add:

```json
"check:inline-scripts": "node scripts/check-inline-scripts.mjs"
```

**Verify**: `cd site && npm run check:inline-scripts` → same result as step 1.

### Step 3: Add the CI steps

In `.github/workflows/deploy.yml`, insert after the "Build (astro build + md
mirrors)" step and before the deploy step:

```yaml
      - name: Syntax-check inline scripts in built HTML
        working-directory: site
        run: npm run check:inline-scripts
```

In `.github/workflows/validate-llms-txt.yml`, insert directly after the
"Build site (includes mirror + sitemap generation)" step (its job already has
`working-directory: site` as a default — omit the `working-directory` key
there):

```yaml
      - name: Syntax-check inline scripts in built HTML
        run: npm run check:inline-scripts
```

**Verify**: `npx --yes yaml-lint .github/workflows/deploy.yml` is NOT available
offline — instead verify with Node:
`node -e "const y=require('site/node_modules/yaml') " ` is also not guaranteed;
use the simplest reliable check:
`git diff --stat` shows exactly the two workflow files changed, and
`grep -c "check:inline-scripts" .github/workflows/deploy.yml .github/workflows/validate-llms-txt.yml`
→ `1` per file. (Workflow YAML is validated for real on the first PR run.)

## Test plan

The gate is its own test. Prove both directions once, locally:

1. Negative case: with a clean build, run the check → passes.
2. Positive case: temporarily corrupt one delimiter in
   `site/dist/index.html` (edit the *built* file, not source — e.g. replace
   one `'POST'` with `‘POST’`), rerun → must fail naming that file. Rebuild or
   revert the dist edit afterward. (`dist/` is gitignored; no source files are
   harmed.)

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `site/scripts/check-inline-scripts.mjs` exists; `cd site && npm run check:inline-scripts` exits 0 on a clean build
- [ ] The positive-case test above (corrupted dist copy) exits 1 and names the file
- [ ] `grep -c "check:inline-scripts" site/package.json` → `1`
- [ ] `grep -c "check:inline-scripts" .github/workflows/deploy.yml` → `1`
- [ ] `grep -c "check:inline-scripts" .github/workflows/validate-llms-txt.yml` → `1`
- [ ] `git status` shows only the four in-scope files changed
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `node:vm` `new vm.Script(...)` rejects a *legitimately valid* inline script
  (e.g. ES-module-only syntax in an inline classic script) — report which
  script and why rather than loosening the check.
- The workflow files' step structure no longer matches the excerpts above.
- You find yourself wanting to add a dependency (ESLint, parser packages) —
  out of scope by design.

## Maintenance notes

- If a future page legitimately needs an inline `type="module"` script with
  syntax `vm.Script` can't parse, extend the script to use
  `new vm.SourceTextModule` (behind `--experimental-vm-modules`) or skip
  `type="module"` blocks explicitly — decide then, not now.
- Deferred (not worth it today): `@astrojs/check`/`tsc` typechecking of `.astro`
  frontmatter and processed scripts. Revisit if frontmatter bugs start slipping
  through; it adds two devDependencies and ~30s of CI.
- Reviewer should scrutinize: the JSON-LD skip (those blocks are JSON, and some
  contain `&`-escaped text that is not valid JS) and that the recursive dist
  walk includes `dist/insights/*.html`.
