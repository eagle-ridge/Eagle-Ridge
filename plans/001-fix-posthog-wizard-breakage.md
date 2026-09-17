# Plan 001: Repair the PostHog wizard's broken instrumentation (curly-quote syntax errors + dead token wiring)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: This plan targets **uncommitted working-tree
> changes** present at planning time (a PostHog setup wizard modified 7 files
> without committing). `git -C <repo> status --short` should show
> `site/src/components/ContactForm.astro`, `site/src/pages/discovery.astro`,
> and `site/src/layouts/BaseLayout.astro` as modified (plus 4 more site files).
> Compare the "Current state" excerpts against the live files. If the files
> match HEAD (`990e09f`) instead — i.e. the wizard diff was reverted or
> committed elsewhere — treat it as a STOP condition and report what you found.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `990e09f`, 2026-07-11 (against a dirty working tree — see drift check)

## Why this matters

A PostHog setup wizard edited 7 site files but left two showstoppers uncommitted
in the working tree. First, it replaced straight quotes with typographic curly
quotes (`‘…’`) inside JavaScript string literals in two `is:inline` scripts.
Curly quotes are not valid JS string delimiters, so those scripts throw a
`SyntaxError` in the browser: the contact form and the discovery intake form
lose their `fetch()` submit handlers entirely and fall back to a native POST
that navigates the visitor away to a raw Web3Forms JSON response — on the two
pages that generate leads. Second, it moved the PostHog project token/host into
`import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN` / `PUBLIC_POSTHOG_HOST`, but no
`.env` file exists anywhere in the repo and `.github/workflows/deploy.yml` sets
neither variable — so the next CI deploy would ship `posthog.init('')` and
silently kill analytics site-wide. Astro does not parse `is:inline` script
bodies, so `astro build` stays green through all of this (plan 002 adds the
missing gate).

The instrumentation the wizard added (new capture events) is wanted — keep it.
Only the syntax corruption and the token sourcing need repair.

## Current state

- `site/src/components/ContactForm.astro` — homepage/main contact form.
  Lines 88–105 (inside the `<script is:inline>` IIFE) contain curly-quote
  string literals, e.g.:

  ```js
  fetch(form.action, { method: ‘POST’, body: new FormData(form) })
  ...
  status.textContent = ‘Message sent! We’ll be in touch shortly.’;
  status.className = ‘ok’;
  window.posthog?.capture(‘contact_form_submitted’);
  ...
  window.posthog?.capture(‘contact_form_error’, { error_type: ‘api_error’ });
  ...
  window.posthog?.capture(‘contact_form_error’, { error_type: ‘network_error’ });
  ```

  Note `‘Message sent! We’ll be in touch shortly.’` — even the intended string
  *contains* a right single quote (`We’ll`), which is why the delimiters must be
  straight quotes with the curly apostrophe kept inside (that is exactly how the
  pre-wizard code at HEAD was written: `'Message sent! We’ll be in touch shortly.'`).

- `site/src/pages/discovery.astro` — unlisted discovery/booking page. Same
  corruption at lines 159–174:

  ```js
  fetch(form.action, { method: ‘POST’, body: new FormData(form) })
  ...
  status.textContent = ‘Thanks — we’ll be in touch before your call.’;
  status.className = ‘ok’;
  window.posthog?.capture(‘discovery_intake_submitted’);
  ...
  status.textContent = ‘Something went wrong. Please email contact@eagleridge.io.’;
  status.className = ‘err’;
  ...
  status.textContent = ‘Network error. Please email contact@eagleridge.io.’;
  status.className = ‘err’;
  ```

- `site/src/layouts/BaseLayout.astro` — shared layout; PostHog init at lines 59–69:

  ```astro
  <script is:inline define:vars={{ phToken: import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN, phHost: import.meta.env.PUBLIC_POSTHOG_HOST }}>
      ...
      posthog.init(phToken || '', {
          api_host: phHost || 'https://us.i.posthog.com',
  ```

  There is no `.env` / `.env.example` in `site/`, and
  `.github/workflows/deploy.yml` defines no `PUBLIC_POSTHOG_*` env vars. The
  token is a **public, client-safe** PostHog project token (`phc_*` tokens ship
  in HTML by design; repo `CLAUDE.md` documents it as "public, safe in HTML"):
  `phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg`, host `https://us.i.posthog.com`.

- Repo conventions: inline browser scripts use `<script is:inline>` with
  ES5-style `var`/`function` (see the untouched handler skeleton in
  `ContactForm.astro:74-87`). The wizard's `window.posthog?.capture(...)`
  optional chaining is fine to keep (other inline code on the site already
  assumes modern browsers).

## Commands you will need

| Purpose | Command (from repo root) | Expected on success |
|---|---|---|
| Install | `npm install --prefix site` | exit 0 |
| Build (Astro only) | `cd site && npx astro build` | exit 0, pages in `site/dist/` |
| Full build (needs Python deps) | `cd site && npm run build` | exit 0 (only if `bs4`/`markdownify` available; Astro-only build is sufficient for this plan) |
| Curly-quote scan | `grep -n "‘" site/src/components/ContactForm.astro site/src/pages/discovery.astro site/src/layouts/BaseLayout.astro` | no output, exit 1 |

## Scope

**In scope** (the only files you should modify):
- `site/src/components/ContactForm.astro`
- `site/src/pages/discovery.astro`
- `site/src/layouts/BaseLayout.astro`

**Out of scope** (do NOT touch, even though the wizard also modified them —
their changes are valid as-is):
- `site/src/pages/cmmc-compliance-consultant.astro`
- `site/src/pages/cmmc-readiness-checklist.astro`
- `site/src/pages/grc-tools.astro`
- `site/src/pages/insights.astro`
- `parity-baseline/*.md` — scripts are stripped from `.md` mirrors, so these
  changes cannot affect parity; if a parity file seems to need updating, STOP.
- The untracked report files (`posthog-self-driving-report.md`,
  `site/posthog-setup-report.md`, `site/.claude/`) — leave them; disposition is
  the maintainer's call.

## Git workflow

- Branch: `advisor/001-fix-posthog-wizard-breakage`
- The broken changes are **uncommitted**; fix them in place, then commit the
  whole corrected wizard diff (all 7 modified files — the 4 out-of-scope ones
  are correct and belong in the same logical change) as one commit.
- Message style (match `git log`): `fix(site): repair PostHog wizard instrumentation (quotes + token wiring)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix string delimiters in `ContactForm.astro`

In `site/src/components/ContactForm.astro` lines 88–105, replace every curly
quote used as a **string delimiter** (`‘` and its closing `’`) with a straight
single quote `'`. Keep the curly right single quote *inside* prose (`We’ll`).
Keep all `window.posthog?.capture(...)` calls. Target state for the three
status strings:

```js
status.textContent = 'Message sent! We’ll be in touch shortly.';
status.className = 'ok';
window.posthog?.capture('contact_form_submitted');
```

(and correspondingly `'err'`, `'contact_form_error'`, `{ error_type: 'api_error' }`,
`{ error_type: 'network_error' }`, `{ method: 'POST', ... }`).

**Verify**: `grep -c "‘" site/src/components/ContactForm.astro` → `0` (grep exits 1)

### Step 2: Fix string delimiters in `discovery.astro`

Same operation on `site/src/pages/discovery.astro` lines 159–174. Target:

```js
fetch(form.action, { method: 'POST', body: new FormData(form) })
...
status.textContent = 'Thanks — we’ll be in touch before your call.';
status.className = 'ok';
window.posthog?.capture('discovery_intake_submitted');
```

(keep the em-dash and the curly apostrophe in `we’ll`; the error-branch strings
become straight-quoted `'Something went wrong. Please email contact@eagleridge.io.'`
/ `'Network error. Please email contact@eagleridge.io.'` / `'err'`).

**Verify**: `grep -c "‘" site/src/pages/discovery.astro` → `0` (grep exits 1)

### Step 3: Give the PostHog token a working fallback in `BaseLayout.astro`

In `site/src/layouts/BaseLayout.astro` line 59, keep the env-var indirection
but add the public token/host as build-time fallbacks so builds work with no
env configured (the token is client-safe; it ships in the HTML either way):

```astro
<script is:inline define:vars={{
  phToken: import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN ?? 'phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg',
  phHost: import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
}}>
```

Leave the runtime `posthog.init(phToken || '', ...)` body unchanged.

**Verify**: `cd site && npx astro build` → exit 0, then
`grep -c "phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg" dist/index.html` → `1`

### Step 4: Syntax-check every inline script in the built pages

From `site/`, after the build in step 3:

```bash
node -e '
const fs = require("fs"), vm = require("vm");
let bad = 0;
for (const f of ["dist/index.html", "dist/discovery.html"]) {
  const html = fs.readFileSync(f, "utf8");
  const scripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
  scripts.forEach((m, i) => {
    if (/application\/ld\+json/.test(m[1])) return;
    try { new vm.Script(m[2]); }
    catch (e) { console.error(`${f} inline script #${i}: ${e.message}`); bad++; }
  });
}
if (bad) process.exit(1);
console.log("all inline scripts parse");
'
```

**Verify**: prints `all inline scripts parse`, exit 0.

### Step 5: Commit

Commit all 7 modified files on the branch per the Git workflow section.

**Verify**: `git status --short` → no modified tracked files remain (only the
untracked report files listed as out of scope).

## Test plan

This repo has no JS test suite; verification is the build plus the inline-script
syntax check in step 4 (plan 002 turns that check into a permanent CI gate — do
not add it to CI in this plan). Manual smoke check if a browser is available:
load `dist/index.html`, open devtools console, confirm no `SyntaxError`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "‘" site/src/` → no matches (exit 1)
- [ ] `cd site && npx astro build` → exit 0
- [ ] Step 4 script → `all inline scripts parse`, exit 0
- [ ] `grep -c "posthog?.capture('contact_form_submitted')" site/src/components/ContactForm.astro` → `1` (instrumentation kept, not reverted)
- [ ] `grep -c "phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg" site/dist/index.html` → `1`
- [ ] No files outside the in-scope list are modified beyond the wizard's pre-existing diff (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The three in-scope files match HEAD `990e09f` (no curly quotes, hardcoded
  token) — the wizard diff is gone; this plan's premise no longer holds.
- The curly quotes appear in files other than the two named ones.
- Fixing the quotes appears to require changing any parity-baseline file.
- Step 4 still reports a parse error after the quote fixes.

## Maintenance notes

- The env-var override (`PUBLIC_POSTHOG_PROJECT_TOKEN`) now exists but nothing
  sets it; if the project token ever rotates, update the fallback literal in
  `BaseLayout.astro` (it is a public `phc_` token — this is not a secret leak).
- Reviewer should scrutinize: that every wizard-added `capture()` call survived
  the quote repair, and that no prose copy lost its typographic apostrophes
  (site copy deliberately uses curly quotes in *content*, never in code).
- Deferred: disposition of the wizard's report files and `site/.claude/skills/`
  folder (commit, relocate to `_inbox/`, or delete) — maintainer's call.
