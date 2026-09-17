<!-- Markdown mirror of https://eagleridge.io/soc2-observation-window -->

# The Observation Window

Eagle Ridge Advisory · SOC 2 Type II

# The observation window

When an enterprise customer asks for your SOC 2, they mean a
**Type II report** — an independent CPA firm attesting that
your controls *operated* over a window of **three to
six months of real time**. That window is calendar time. No platform
and no budget compresses it.

So your start date sets the date you can hand a customer a report. If a
customer asks today, the earliest credible Type II report is roughly
**eight months out with the minimum three-month window, and closer to
eleven if they want six** — and every week of delay moves it a week.

Fig. 01 · Why the start date is the whole game

Representative schedule with the minimum three-month window; many
customers ask for six. Only readiness and remediation[1](#fn1) can move faster.
That’s where Eagle Ridge works.

## Exceptions are the enemy

A Type II report tells a story. The auditor writes every control that
failed during the window into it as an **exception**,[2](#fn2) and every
customer who asks for the report reads those exceptions. The point of
readiness work is to enter the window with no known failures left.
Entering clean is necessary but not sufficient: most Type II exceptions
are controls that lapse *during* the window — a skipped
access review, a missed scan — so the controls have to keep
operating, on schedule, every month.

Fig. 02 · Would-be exceptions, driven to zero before the window opens

Representative SaaS company; counts are Eagle Ridge’s readiness
findings, not audit results — 23 findings spread across 17 of the 38
criteria. Anything still open when the window starts, we raise with the
auditor before they find it.

## The criteria, accounted for

A typical SaaS scope covers **38 Trust Services criteria**: all
33 common criteria (the required Security category) plus Availability and
Confidentiality.[3](#fn3) The auditor tests the controls you’ve mapped
to each one,[4](#fn4) across the whole window.

Fig. 03 · 33 security · 3 availability · 2 confidentiality

2017 Trust Services Criteria (2022 revised points of focus). Some
companies add Processing
Integrity or Privacy — scope is set in the readiness assessment, against
what your customers ask for.

## Who does what

You are building a product, not an audit program. We keep your part small
and concrete. We build the program.

### What you do

* Answer the readiness questionnaire and one structured call
* Approve tooling and let your engineers apply the config changes
* Keep running the controls during the window — they’re yours now
* Sign policies and sit for the auditor’s interviews

### What Eagle Ridge does

* Assess all in-scope criteria and map every gap to a fix
* Write the policies and design controls that fit how you work
* Automate evidence collection so the window runs itself
* Help select the CPA firm, then manage the audit request list through report

### Notes

1. The two-month remediation shown assumes a managed engagement with
   templates, automation, and dedicated support. Self-managed programs commonly
   take three to five months for the same scope; the window can’t start until
   remediation is genuinely done. [↩](#r1)
2. An exception is a documented instance where a control didn’t
   operate as intended during the window. A few isolated exceptions with credible
   management responses rarely change the auditor’s opinion; a pattern across
   a criterion can lead to a qualified opinion. SOC 2 produces an opinion
   (unqualified, qualified, adverse, or disclaimer), not a pass/fail. [↩](#r2)
3. Availability and Confidentiality are the two most commonly added
   criteria beyond the mandatory Security baseline — appearing in
   roughly 75% and 64% of reports respectively (CBIZ 2024 SOC Benchmark Study).
   Processing Integrity and Privacy are added when customer commitments require
   them. [↩](#r3)
4. Criteria are the Trust Services objectives; controls are what we
   implement and the auditor tests against each one. A single criterion can carry
   many controls — one failed control under a criterion is an
   exception, not a failure of the whole criterion. [↩](#r4)

Figures show a representative engagement, not a quote — your
scope, window length, and timeline depend on your systems and what your customers
require. The audit itself is performed by an independent licensed CPA firm that
you engage; independence rules mean Eagle Ridge prepares you and never audits its
own work. Preparation aims at a clean report. Only the auditor can issue one.
Sources: AICPA 2017 Trust Services Criteria (with revised points of focus, 2022)
· AICPA attestation standards (AT-C 205) and CPA independence rules.
Eagle Ridge Advisory · [chris@eagleridge.io](mailto:chris@eagleridge.io) ·
[eagleridge.io](https://eagleridge.io)
