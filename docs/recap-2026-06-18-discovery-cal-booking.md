# Session Recap: /discovery intake + Cal.com self-serve booking

**Date:** 2026-06-18
**Project:** Eagle Ridge Advisory (eagleridge.io)
**PRs:** #45 (open), #48 (open) — both verified, off `main`, no conflicts

## What Was Built

1. **`/discovery` intake page** (PR #45) — replaces the never-built Tally embed.
   - New `noindex` prop on `BaseLayout.astro`: emits `robots noindex,nofollow` AND
     suppresses the `.md`-mirror alternate link (the generator never produces
     `discovery.md`). Unlisted from two directions (prop + generator `PAGES` allowlist).
   - `discovery.astro`: **book-first** layout — Cal.com inline embed
     (`chris-mcconnell/eagle50`) primary, minimal Web3Forms intake (name/email/company
     + optional one-liner) below as a "not ready to pick a time?" fallback. Distinct
     subject line + `.discovery-form` selector (decoupled copy of ContactForm's handler).
   - Analytics: `discovery_page_viewed` on load; `discovery_call_booked` on Cal
     `bookingSuccessful` (sendBeacon transport).
   - Gilfoyle-reviewed twice → fix-then-ship. Fixes applied: sendBeacon on the booking
     event, dropped `overflow:auto` (mobile nested-scroll), Cal-failure fallback link.

2. **"Book a call" nav CTA** (PR #48) — filled accent pill in desktop + mobile nav,
   plain `<a>` to the Cal hosted page (new tab), **zero JS** in the global Header.
   Beside Contact, not replacing it.

Both verified in-browser (Web3Forms submit → success; Cal embed renders live slots;
CTA at desktop 1500px + mobile 390px).

## Key Decisions

| Decision | Rationale |
|---|---|
| Cal.com **embed/link, not the v2 API** | API is for programmatic booking mgmt we don't have; embed does availability/timezones/booking/invites client-side, no backend, no key in page |
| **Book-first** layout, form as fallback | Goal is self-serve booking; don't gate it behind a form. Form still captures leads not ready to pick a slot |
| Nav CTA = **plain link, zero JS** | Robust, no global-header JS cost; easy upgrade to a Cal popup later |
| `/discovery` stays **unlisted**; CTA points at Cal directly | Keeps the intake page's link-shared role; one Cal event, no duplication |

## Corrections Applied

- AskUserQuestion menu rejected → user wanted "use your smarts to guide me."
  Codified to feedback memory: when Chris delegates, recommend-and-proceed.

## What's Next

- **Fix #47 first** — Cal event title typo "Eagle **River** Advisory" → "Ridge"
  (via `@calcom/cli`); now linked from every page via the CTA.
- Merge #45 + #48 (auto-deploys on push to `main` touching `site/**`); then
  `curl https://eagleridge.io/discovery`.
- #49 — verify `discovery_call_booked` fires after a real booking (post-deploy).
- #46 — Cloudflare Turnstile on the Web3Forms form (shared 250/mo quota).
- Bead `chrismcconnell-wiei` holds this pick-up context.
