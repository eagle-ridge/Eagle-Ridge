# Session Recap: SEO/AEO + conversion build (ploy.ai findings)

**Date:** 2026-06-23
**Project:** eagleridge.io (Eagle Ridge Advisory)
**PRs Merged:** #51

## What Was Built

Turned three ploy.ai analyses (Design, CRO, SEO/AEO) + a ploy.build CMMC page draft into shipped, deployed changes:

- **Nav fix** — Resources dropdown was a recessed, detached well; now a floating panel (raised paper tone, radius, `--er-shadow-md`).
- **Homepage conversion** — two-column hero with an above-the-fold CTA ("Book a free readiness call") + a framework credential strip filling the empty right column; removed the unverifiable "15+ companies advised" stat; darkened `--er-mute` (#8B7D6E → #756857) to clear WCAG AA; form CTA "Send Message" → "See where you stand" + a next-step note.
- **`/cmmc-compliance-consultant`** — new service page targeting "cmmc compliance consultant" (320/mo, ~$78 CPC, low comp). Levels, 5-step process, deliverables, frameworks, FAQ. Carries `Service` + `FAQPage` JSON-LD.
- **`Faq.astro`** — reusable component that renders visible Q&A *and* emits FAQPage JSON-LD from one array (can't drift).
- **`/cmmc-readiness-checklist`** — new indexable lead-magnet page, written fresh.
- **`site/scripts/seo_aeo_eval.py`** — deterministic on-page SEO/AEO eval harness; ran before (main) vs after (PR); the before/after caught 3 real on-page defects (title length, meta length, zero internal links) which were then fixed.
- **`cta_click` instrumentation** — strip-safe `[data-cta]` listener in BaseLayout feeding a PostHog conversion funnel.
- **PostHog dashboard** — "Eagle Ridge — SEO/AEO" (project 209232, dashboard 1752162): AI-referrer watch, new-page traffic, CTA clicks.
- **Aug 7 cloud routine** (`trig_019C5AbqWEBFcNdXiG6cxkJK`) — post-deploy re-check.
- **`a.eagleridge.io` CNAME** → proxyhog (PostHog first-party reverse proxy), pending provisioning.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Reject CRO's PE/VC second-audience rec | CLAUDE.md removed PE/VC framing June 2026; single SMB-CEO audience |
| Remove "15+ companies advised" stat | Unverifiable proof; CRO itself says don't fabricate |
| CMMC + NIST is the core; no SOC2/ISO/FedRAMP pages | Stated core competency — others listed as supported only, not deep pages |
| Remove `HowTo` JSON-LD from checklist | Google deprecated HowTo rich results (2023); name-only steps = misleading-markup risk |
| Cloud routine over local scheduler | Chris reversed prior preference; cloud fires without the Mac awake |

## Corrections Applied

- **MFA mis-filed under CMMC Level 1** → it's a Level 2 / NIST 800-171 (3.5.3) control. Fixed; lesson saved to memory.
- **"Assessment-ready & monitored" overpromise** → reworded to readiness framing (no implied pass).
- **RemoteTrigger serialization** → must pass `action`/`body` as native params, not a stringified blob (long prompts truncate). Captured in memory.

## What's Next

- **#52** — trim homepage meta description (209→≤160) + sync the 3 copies.
- **#53** — flip PostHog `api_host` to `a.eagleridge.io` once proxyhog provisions.
- **GSC** (Chris) — verify the Domain property + submit sitemap (bead open). The Aug 7 routine will flag if undone.
- **~Aug 7** — re-run the eval harness + dashboard + AI/Google citation probe; first AI referral = AEO working.
