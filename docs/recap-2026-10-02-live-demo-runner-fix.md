# Session Recap: Live demo, the runner fix, and a template that misled a client

**Date:** 2026-10-01 to 2026-10-02
**Project:** eagleridge.io (`eagle-ridge/Eagle-Ridge`) and `miqcie/eagle-ridge-methodology`
**PRs Merged:** Eagle-Ridge #154, #156, #157; methodology #207, #208

## What Was Built

- **`/demo` is live.** It is an unlisted workspace showing a made-up machine shop, Kestrel Precision Machining, halfway to CMMC Level 2. The layout follows Chris's sketch: rail, sidebar, tabs, main pane, right pane, bottom bar. A visitor can walk the 7 phases, search the 110 controls, change any control's status as a "what-if", and watch a live SPRS score move against the 88 line. A soft "Book a call" link goes to `/discovery`. (#154)
- **110 plain-language control lines.** Graders checked each line against NIST's own Rev 2 text, not a model's memory.
  - Fable, grading its own rewrites, passed all 110. That was a training score.
  - Held-out Opus judges then passed 98 and 96. Three more rounds ended at 109 with no line failed by two judges, and the last failure, 3.13.12, was fixed with Chris's sign-off.
- **Usability and code review.**
  - A smoke test at five widths found 9 problems. All are fixed, and axe-core now finds 0 violations.
  - A high-effort code review found 10 bugs. All are fixed, plus one more accessibility issue found while checking the fixes.
- **Deploys work again.** No job had started on the `latchkey-small` runners since 09-17; jobs just sat queued, and nothing failed. #156 moved every job to `ubuntu-latest`, cancelled the stuck runs, and corrected CLAUDE.md. The next deploys ran within seconds and went live in about 80–90 seconds. (#155, #156)
- **Methodology fixes found along the way.**
  - **#205 / #207:** the SSP template had 34 hand-typed wrong weights. Its weights and POA&M column are now generated from the register, and a test fails if any must-be-met control appears as a POA&M item.
  - **#206 / #208:** all 110 controls in the register now carry NIST's official Rev 2 wording. Three titles were fixed (3.14.6, 3.5.10, 3.5.5), and the template takes its titles from the register. #157 synced the demo.

## Key Decisions

| Decision | Rationale |
|---|---|
| Fictional client, unlisted page, soft CTA, no live AI | Safe to share by link; no API cost or abuse risk; measure with PostHog before promoting |
| Grade the plain lines against NIST's text with held-out judges, not the writer's own judge | Fable passed 110 of its own rewrites; independent judges passed 98 and 96. That was overfitting. |
| Stop climbing at the judges' noise floor; split lines go to Chris | Each pair agreed on 104 of 110 lines. Chasing more judges just turns up new near-misses. |
| Back to GitHub-hosted runners | Latchkey stalled every job silently; `setup-node` already caches npm |
| Keep Nereid's files as shipped and pin their known defects in the test | Former client: the record stays honest, and any new defect still fails |
| Make the register the only source for template weights and titles | Check the rule, not just the number; hand-typed tables were the root cause |

## Corrections Applied

- **Shipped bad work (Nereid SSP v0.5).** It told the client to put seven must-be-met controls, worth 31 points, on a POA&M. The score (−153, then −150) was right; the plan was not. Root cause: weights copied from the template. Post-mortem: methodology `docs/POSTMORTEM-2026-10-02-poam-ineligible-controls.md`.
- **A Reddit summary misdescribed 3.13.12.** It described privileged remote sessions; 3.13.12 is about collaborative devices (SC-15). We checked NIST's PDF before changing the line.
- **A false `Reviewed-By: Chris` trailer** was added to a commit before Chris had reviewed it. It was removed, and a rule is now in the methodology CLAUDE.md.
- **I said the methodology repo had no PR CI.** It runs `lint` and `pytest`. The first push failed `ruff format`; it was fixed before CI reported it.

## What's Next

- #158: a sync script and drift check between the demo's controls and the register.
- #159: commit the plain-language eval (rubric and item builder) so future edits get re-graded.
- #141: watch the next few merges on GitHub-hosted runners, then close it.
- Decide when to promote `/demo` into the nav or onto the homepage. Check PostHog `demo_*` events first.
