You are designing a single small UI control for **Eagle Ridge Advisory** (eagleridge.io), a compliance-readiness advisory firm. Produce an **interactive HTML artifact** that mocks up the control in our brand, in several variants and states, so we can pick a direction. This is a visual mockup only — clean, production-quality HTML/CSS, no framework.

## What the control is

The hero concept is a **human ⇄ robot view toggle**: a switch in the page that flips between the normal human-readable page and a **"robot view"** showing the visitor exactly what an AI/LLM sees — the clean Markdown representation of the same page. The point is to let a human *see the machine version*, as a confident signal that this firm is built for the AI era. Our site already generates a clean `.md` mirror of every page (e.g. `/about` → `/about.md`), so the robot view renders that same content.

For comparison, also mock up the **conventional** industry pattern: a "Copy page" / "View as Markdown" button (shipped by Anthropic's docs, Linear, Mintlify, Vercel, DatoCMS). We want to see our distinctive toggle *and* the proven convention side by side, then choose.


## Brand system (use these exactly)

**Palette (warm cream + deep brown, editorial):**
- Page background `--er-bg: #F6F2EA`
- Panel/paper `--er-paper: #FAF7F0`
- Ink (headings) `--er-ink: #1A1614`
- Body ink `--er-ink-soft: #44372F`
- Muted `--er-mute: #8B7D6E`
- Hairline rule `--er-rule: #D9D0BF`
- Accent (primary, deep brown) `--er-accent: #4A2F22`
- Gold (sparing) `--er-gold: #B08A4E`

**Type:**
- Serif (headings): **Newsreader** (Georgia fallback)
- Sans (body/UI): **IBM Plex Sans**
- Mono (eyebrows, nav, meta — uppercase, letter-spaced ~0.16em): **IBM Plex Mono**

**Voice of the masthead:** logo mark + uppercase wordmark "EAGLE RIDGE ADVISORY" on the left; primary nav (About · Insights · Contact) in uppercase mono on the right, with a small mono "GRC READINESS" tagline. The aesthetic is restrained, trustworthy, print-like — NOT a colorful dev-tools UI. The audience is **non-technical small-business CEOs**, so the control must read as discreet and credible, not gimmicky.

## What to mock up

Render a realistic **page masthead + the start of an article** (an H1 like "Why Readiness Comes Before the Assessment", a date/byline line, a paragraph) so the control can be shown in context. Then present these variant directions, each clearly labeled:

1. **Human ⇄ Robot toggle (LEAD — our distinctive concept).** A small switch/segmented control in the masthead or right of the H1, with two labeled states — e.g. `HUMAN` / `ROBOT` (consider also "Read view / AI view"). Show what happens in BOTH positions:
   - **Human view (default):** the normal, styled page.
   - **Robot view (toggled on):** the SAME page content visibly transformed into its machine-readable self — clean Markdown rendered in mono/plain styling (front-matter-ish metadata, `#` headings, a `[link](/path.md)`), as if peeking at what the AI ingests. Make this feel intentional and on-brand, not like a broken page. Explore at least two treatments: (a) the whole article column swaps to the markdown rendering in place, and (b) a side-by-side / split showing human and robot together.
   - Show the toggle control itself in both states (knob left/right or segment active), plus its keyboard-focus state.
2. **Split button (the proven convention).** A "Copy page" button with a clipboard icon; a caret opens a small dropdown menu with: `Copy page (Markdown)`, `View as Markdown`. On-brand (mono or sans label, accent or outline treatment). Show placement near/right of the H1. Include states: default (closed), dropdown open, "Copied ✓" confirmation (describe the `aria-live` announcement), keyboard-focus.
3. **Minimal** — a single quiet text link near the H1: `View as Markdown`. The lowest-key fallback.
4. **Maximal (for reference only)** — the split button plus dropdown items `Open in ChatGPT` and `Open in Claude` (simple monochrome marks, not full-color logos). Show it so we can judge whether it's too dev-toolsy for our CEO audience.

Lead with and give the most space to **Variant 1 (the toggle)** — that's the direction we're most excited about. Treat 2–4 as comparison options.

## Constraints & details

- Match the existing nav styling: mono, uppercase, ~12px, letter-spacing 0.16em, accent on hover/active. The control should feel like it belongs next to that nav.
- Accessibility: real `<button>` with an accessible menu (focusable, arrow-key navigable), visible focus, an `aria-live="polite"` "Copied" region, and `aria-label`s on any icon-only items. Tap targets ≥ 44px on mobile. Call these out in annotations.
- Show light **annotations/callouts** next to each variant explaining the choice (placement, what it does, why it fits or doesn't).
- Mobile: show how the control collapses / where it sits on a ~375px width.
- Do NOT invent new brand colors or use bright/SaaS-style gradients. Stay within the palette above.

## Deliverable

One self-contained HTML artifact (inline CSS, system-loaded Google Fonts for Newsreader / IBM Plex Sans / IBM Plex Mono) that I can open in a browser and visually compare all variants and their states. Make the artifact's toggle actually interactive if practical (clicking `HUMAN`/`ROBOT` flips the demo article between styled and markdown views). Lead with and give the most visual weight to **Variant 1, the Human ⇄ Robot toggle** — that's our preferred direction; the Copy-page/Markdown options are shown for comparison.
