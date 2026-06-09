# Eagle Ridge — Brand Kit

Handoff package for updating **eagleridge.io**. Everything here is derived from the institutional pitch deck, which is the current source of truth for the brand.

> **Eagle Ridge** is the consulting / advisory brand — credibility-forward, built to be read by VC/PE diligence teams and defense-industrial-base (DIB) operators. The voice is **institutional, editorial, and quietly confident** — think a research desk or a private-bank memo, not a SaaS landing page.

---

## 0. What's in this folder

| File | Use |
|------|-----|
| `BRAND_KIT.md` | This document — read first. |
| `tokens.css` | Drop-in CSS custom properties (`--er-*`) + a few opt-in base classes. |
| `tokens.json` | Same tokens as data, for Tailwind/JS config or a token pipeline. |
| `brand-kit.html` | Visual reference — open in a browser to see colors, type, and components rendered. |
| `assets/eagle-ridge-mark.png` | The eagle-head logo mark (transparent PNG, 300×300). |

**Fastest path:** link `tokens.css`, load the four Google fonts (§3), and build with the `--er-*` variables.

---

## 1. Brand personality

- **Institutional, not startup-y.** Restraint signals credibility. Avoid hype, emoji, gradients-for-the-sake-of-it, and rounded-pill everything.
- **Editorial.** Serif headlines with italic emphasis, generous whitespace, hairline rules, mono labels. It should feel like a well-set document.
- **Precise.** Tabular numerals, real data, sober color. Every element earns its place.
- **Warm, not corporate-cold.** The parchment/umber palette is deliberately analog and human — paper, ink, not blue-chrome.

---

## 2. Color

Default theme is **Parchment**. Use semantic names, never raw hex, in code — pull from `--er-*`.

| Token | Hex | Role |
|-------|-----|------|
| `--er-bg` | `#F6F2EA` | Page background — warm paper |
| `--er-paper` | `#FAF7F0` | Cards, raised surfaces |
| `--er-ink` | `#1A1614` | Headlines, primary text |
| `--er-ink-soft` | `#44372F` | Body copy, secondary text |
| `--er-mute` | `#8B7D6E` | Captions, labels, meta |
| `--er-rule` | `#D9D0BF` | Hairlines, borders, dividers |
| `--er-accent` | `#4A2F22` | **Deep umber — brand primary.** Links, buttons, italic emphasis. |
| `--er-gold` | `#B08A4E` | Gold — emphasis only, used sparingly |

**Alternate themes** (set `data-theme` on `<html>`): `slate` (cool institutional), `bone` (bright, vermilion `#B14E26` accent), `onyx` (dark mode). Full values in `tokens.css` / `tokens.json`.

**Usage rules**
- Backgrounds are paper tones, never pure white (except `bone` paper). Never pure-black text — use `--er-ink`.
- One accent per view. Umber does the work; gold is a garnish (a single rule, a tick mark), never a fill for large areas.
- Borders are 1px hairlines in `--er-rule`. This is the primary way sections are separated — prefer a rule over a shadow or a filled box.

---

## 3. Typography

Four families. Load from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,300;1,6..72,400;1,6..72,500&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&display=swap" rel="stylesheet">
```

| Family | Token | Role |
|--------|-------|------|
| **Newsreader** | `--er-font-serif` | Display & editorial headlines. The face of the brand. |
| **IBM Plex Sans** | `--er-font-sans` | All UI and body copy. Body is weight 400; ledes/intros are **300**. |
| **IBM Plex Mono** | `--er-font-mono` | Eyebrow labels, data, page numbers, timestamps. |
| **Bricolage Grotesque** | `--er-font-grotesk` | Alternate "modernist" display voice — optional, for a more contemporary section. |

### Type ramp (web-scaled)

| Style | Family / weight | Size token | Notes |
|-------|-----------------|-----------|-------|
| Display | Newsreader 400 | `--er-text-display` | Hero headline. Tighten tracking to `-0.028em`. |
| H2 | Newsreader 400 | `--er-text-h2` | Section titles. |
| Lede | Plex Sans **300** | `--er-text-lede` | Intro paragraph under a headline. |
| Body | Plex Sans 400 | `--er-text-body` | 17px, line-height 1.55. |
| Eyebrow | Plex Sans 500 | `--er-text-eyebrow` | UPPERCASE, tracking `0.22em`, color `--er-accent`. |
| Mono label | Plex Mono 400/500 | `--er-text-small` | Data, kickers, page markers. |

> **Signature move:** serif headline with one word in *italic* set in `--er-accent` — e.g. "CMMC is the wedge. *GRC is the market.*" Use the `<em>` element; `tokens.css` styles it automatically inside `.er-display` / `.er-h2`.

The deck uses very large display sizes (up to 120px+) because it's a 1920px slide canvas — for the website, use the `clamp()`-based ramp in `tokens.css`, which is tuned for responsive web.

---

## 4. Logo

`assets/eagle-ridge-mark.png` — a geometric eagle-head mark rendered in the umber accent on transparent ground.

- **Clear space:** keep at least the height of the mark's "beak" notch clear on all sides.
- **Minimum size:** 24px tall in nav chrome; 48px+ as a standalone mark.
- **Lockup:** mark + wordmark "Eagle Ridge" (or "Eagle Ridge Advisory" for formal contexts) set in IBM Plex Sans 500, uppercase, tracking ~0.18em, in `--er-ink`.
- **On dark (`onyx`):** the mark is umber/gold on dark paper; do not recolor to pure white.
- Do not stretch, add shadows, place on busy photos, or rotate the mark.

> The avian identity is intentional — Eagle Ridge sits in a family of bird-named ventures, and for a GRC product the bird is a *sentinel / indicator species* metaphor (compliance posture as a signal of organizational health). Keep iconography geometric and systems-minded, never illustrative/mascot-y.

---

## 5. Layout & components

- **Container:** max-width `--er-maxw` (1200px), side gutter `--er-gutter`.
- **Spacing:** 8px rhythm via `--er-space-*`. Be generous — whitespace is a brand asset.
- **Rules over boxes:** separate content with 1px `--er-rule` hairlines and a top-rule + label pattern, rather than cards with borders + shadows.
- **Radius:** near-square. `--er-radius-sm/md/lg` = 2/4/8px. Nothing pill-shaped.
- **Shadows:** barely-there (`--er-shadow-sm/md`). The brand leans on rules and tone, not elevation.
- **Buttons:** solid umber (`.er-btn`) or ghost/outline (`.er-btn--ghost`). Small, confident, not chunky.
- **Numbers/data:** enable tabular figures (`font-feature-settings: "tnum","lnum"`) wherever stats appear.

### Minimal example

```html
<link rel="stylesheet" href="tokens.css">

<section style="background: var(--er-bg); padding: var(--er-space-7) var(--er-gutter);">
  <p class="er-eyebrow">What we do</p>
  <h2 class="er-display">Compliance, made <em>credible</em>.</h2>
  <p class="er-lede" style="max-width: 52ch; margin-top: var(--er-space-3);">
    Eagle Ridge gets small defense contractors CMMC-ready without the six-figure
    remediation theater.
  </p>
  <a class="er-btn" href="#" style="margin-top: var(--er-space-4);">Book a readiness review</a>
</section>
```

---

## 6. Voice & copy

- Plain, declarative sentences. Lead with the claim; support with a number.
- Name real things (frameworks, sources, figures). Cite sources in a mono footnote line.
- No exclamation marks, no "revolutionary/seamless/cutting-edge," no emoji.
- Sentence case in body; UPPERCASE only for eyebrow labels and the wordmark.

---

## 7. Notes for the build

- Default `data-theme` is Parchment (the `:root` block) — no attribute needed.
- All tokens are CSS custom properties, so dark mode = `<html data-theme="onyx">`.
- If you use Tailwind, map `tokens.json` into `theme.extend` (colors → `er.*`, fontFamily, fontSize).
- Fonts must be loaded for the brand to read correctly; system fallbacks are in the stacks but the serif/mono pairing is doing the heavy lifting.
