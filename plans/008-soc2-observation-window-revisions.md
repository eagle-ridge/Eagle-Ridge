# Spec: Revisions to "The Observation Window" (`/soc2-observation-window`)

## Purpose
Tighten the page so it holds up under a skeptical read from a knowledgeable buyer (CISO, security engineer, GRC lead). The compliance content is already accurate; the risk is a handful of optimistic numbers and one over-simplified promise that a sharp reader will catch and use to discount the rest. Most fixes are footnotes that add nuance without breaking the clean narrative. Two are body edits, because a footnote can't undo a headline a reader has already anchored on.

Priority key: **P1** = body edit, credibility-critical. **P2** = footnote, strengthens rigor. **P3** = optional polish.

---

## Change 1 (P1 — body edit): Stop leading with the best-case "eight months"

**Where:** Intro, second paragraph.

**Current:**
> If a customer asks today, the earliest credible Type II report is about **eight months out** — and every week of delay moves it a week.

**Problem:** The eight-month figure only works with the *minimum* three-month window. The same page then says "many customers ask for six," which pushes the real number to ~11 months. A reader who does the arithmetic sees the headline as the rosiest possible case, which undercuts trust in every other number.

**Change to:** Lead with a range tied to window length, and make the six-month case visible up front.

> If a customer asks today, the earliest credible Type II report is roughly **eight months out with the minimum three-month window, and closer to eleven if they want six** — and every week of delay moves it a week.

**Rationale / sources:**
- Type II observation windows run 3–12 months; enterprise buyers commonly expect ≥6 months of evidence. [SOC 2 Type 2 report guide](https://soc2auditors.org/insights/what-is-a-soc-2-type-2-report/); [Konfirmity SOC 2 Audit Timeline](https://www.konfirmity.com/blog/soc-2-audit-timeline)
- Post-window phases are not instant: audit fieldwork ~2–4 weeks, report drafting ~3–6 weeks. The eight-month total already depends on these running fast. [Konfirmity SOC 2 Audit Timeline](https://www.konfirmity.com/blog/soc-2-audit-timeline)

---

## Change 2 (P2 — footnote on Fig. 01): Qualify the two-month remediation

**Where:** Fig. 01, "Months 2–3: the heavy lift" caption.

**Problem:** Fitting policy authoring, control design, evidence automation, and standing up brand-new access/vendor review processes into two months is aggressive for a company starting from 23 findings across 17 criteria. It's achievable with a managed provider, but self-managed teams routinely take longer, and a reader who has lived through this knows it.

**Add footnote:**
> The two-month remediation shown assumes a managed engagement with templates, automation, and dedicated support. Self-managed programs commonly take three to five months for the same scope; the window can't start until remediation is genuinely done.

**Rationale / sources:**
- Managed pre-audit prep compresses to ~6 weeks; self-managed efforts run 3–5 months. [Konfirmity SOC 2 Audit Timeline](https://www.konfirmity.com/blog/soc-2-audit-timeline)

---

## Change 3 (P1 — body edit + footnote): Don't imply a clean start guarantees a clean report

**Where:** "Exceptions are the enemy" section.

**Current framing:** Readiness drives *known* failures to zero before the window opens, implying the report comes out clean.

**Problem:** Exceptions in a Type II are overwhelmingly *operating-effectiveness* failures that occur **during** the window — a missed quarterly access review, a lapsed scan, an offboarding that ran past SLA. Entering the window clean is necessary but not sufficient. The current text is silent on in-window drift, which is the single biggest residual risk and the thing an experienced reader will immediately ask about.

**Body edit — add one sentence to close the section:**
> Entering clean is necessary but not sufficient: most Type II exceptions are controls that lapse *during* the window — a skipped access review, a missed scan — so the controls have to keep operating, on schedule, every month.

**Footnote (attach to "exception"):**
> An exception is a documented instance where a control didn't operate as intended during the window. A few isolated exceptions with credible management responses rarely change the auditor's opinion; a pattern across a criterion can lead to a qualified opinion. SOC 2 produces an opinion (unqualified, qualified, adverse, or disclaimer), not a pass/fail.

**Rationale / sources:**
- Exceptions surface during Type II because the auditor tests operating effectiveness over the whole window; common causes are missed access reviews, missed scans, and late deprovisioning. [Scrut: SOC 2 exceptions](https://www.scrut.io/hub/soc-2/soc-2-audit-exceptions); [Sprinto: SOC 2 exceptions](https://sprinto.com/soc-2/exceptions/)
- One isolated exception rarely moves the opinion; a pattern can qualify it. Auditors issue one of four opinions, not a pass/fail. [Scrut: SOC 2 exceptions](https://www.scrut.io/hub/soc-2/soc-2-audit-exceptions)

---

## Change 4 (P2 — footnote): Fix the criteria-vs-controls slippage

**Where:** "The criteria, accounted for" section and Fig. 03 (e.g., "17 criteria with gaps" vs. "controls you've mapped to each one").

**Problem:** The prose uses "criteria" and "controls" interchangeably. The existing footnote helps, but a reader tracking the distinction will notice the looseness. Criteria are the TSC objectives; controls are what you implement and the auditor tests. A criterion can have many controls under it (CC6.1 alone carries a large set).

**Add footnote (or tighten inline):**
> Criteria are the Trust Services objectives; controls are what we implement and the auditor tests against each one. A single criterion can carry many controls — one failed control under a criterion is an exception, not a failure of the whole criterion.

**Rationale / sources:**
- A single failed control under a broad criterion (e.g., CC6.1) is an exception; the other controls under it still hold. [Scrut: SOC 2 exceptions](https://www.scrut.io/hub/soc-2/soc-2-audit-exceptions)

---

## Change 5 (P2 — footnote): Ground the scope claim with a benchmark

**Where:** "The criteria, accounted for" — the 33 + 3 + 2 = 38 framing (Security + Availability + Confidentiality).

**Note:** The math is correct and the scope choice is well-defended. Optional strengthening: cite how common Availability and Confidentiality actually are, so the "typical SaaS scope" claim is evidence-backed rather than asserted.

**Add footnote:**
> Availability and Confidentiality are the two most commonly added criteria beyond the mandatory Security baseline — appearing in roughly 75% and 64% of reports respectively (CBIZ 2024 SOC Benchmark Study). Processing Integrity and Privacy are added when customer commitments require them.

**Rationale / sources:**
- CBIZ 2024 SOC Benchmark: Availability in 75.3% of reports, Confidentiality in 64.4%. [SOC 2 Type 2 report guide (citing CBIZ)](https://soc2auditors.org/insights/what-is-a-soc-2-type-2-report/)

---

## Change 6 (P3 — polish): Reduce repetition across the three figures

**Problem:** Fig. 01, Fig. 02, and Fig. 03 all restate "the window is fixed." Fig. 01 makes the point decisively.

**Change:** Let Fig. 03 carry its own weight (scope coverage), and trim the "fixed window" restatement from its caption so each figure earns its place. No factual change — density only.

---

## Non-changes (verified accurate, leave as-is)
- Type II = independent CPA attestation over a window; 3–6 month framing. Correct. [SOC 2 Type 2 report guide](https://soc2auditors.org/insights/what-is-a-soc-2-type-2-report/)
- 33 common (Security) + 3 Availability + 2 Confidentiality = 38. Correct against 2017 TSC.
- Independence framing ("we prepare, never audit our own work"; "only the auditor can issue" a report). Correct per AICPA independence rules and AT-C 205 — already cited on the page. Keep.
- The core thesis (start date determines report date; window is fixed calendar time). Correct and well-argued. Keep as the spine.

---

## Sources
- AICPA 2017 Trust Services Criteria (rev. 2022) and AT-C 205 — already cited on the page; retain.
- SOC 2 Type 2 report guide — window length, attestation-not-certification, CBIZ benchmark: https://soc2auditors.org/insights/what-is-a-soc-2-type-2-report/
- Konfirmity, SOC 2 Audit Timeline (2026) — phase durations, remediation reality: https://www.konfirmity.com/blog/soc-2-audit-timeline
- Scrut, SOC 2 exceptions — exception types, in-window drift, opinion impact: https://www.scrut.io/hub/soc-2/soc-2-audit-exceptions
- Sprinto, SOC 2 exceptions — common operational causes: https://sprinto.com/soc-2/exceptions/
