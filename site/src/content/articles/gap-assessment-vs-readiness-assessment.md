---
title: "What Is the Difference Between a CMMC Gap Assessment and a Readiness Assessment?"
description: "A CMMC gap assessment measures where you stand against the 110 controls and produces a score and a list. Readiness closes the list and gets you to a passable posture. Where 88 and the C3PAO fit."
pubDate: 2026-09-10
draft: false
tags: ["CMMC", "readiness", "assessment"]
---

A CMMC gap assessment measures where you stand against the 110 NIST SP 800-171 controls and produces a score and a list of open items. A readiness assessment (or readiness engagement) closes that list, writes the documentation, and confirms you could pass. The gap assessment comes first, readiness comes second, and the C3PAO assessment comes after both.

People use the two terms loosely, and some vendors use them interchangeably. This article separates them so you know what you are buying.

## What is a CMMC gap assessment?

A gap assessment is a measurement. Someone walks through all 110 controls and marks each one met or not met for your systems. Only two controls (multi-factor authentication and FIPS-validated encryption) allow partial credit.

The output is three things:

1. Your honest SPRS score, calculated the way the DoD does it.
2. A list of every open control, with its point weight (1, 3, or 5).
3. A prioritized plan: which fixes return the most points for the least money and time.

A gap assessment takes a small contractor from "we think we are mostly fine" to a number. That number is usually lower than the company expected. See [The Path to 88](/path-to-88) for one real trajectory.

A gap assessment does not fix anything. It does not write your System Security Plan (SSP). It tells you the size of the job.

## What is a CMMC readiness assessment?

Readiness is the work between the gap assessment and the official assessment. It includes:

- Closing the open controls, in priority order, with your IT support doing the technical changes.
- Writing the SSP: a narrative for each of the 110 controls that describes what your company actually does.
- Drafting and signing the policies the SSP references.
- Building an evidence inventory an assessor can follow, control by control.
- Recalculating and submitting your SPRS score.
- An assessor-style review of the whole package before anyone official looks.

Some firms call the final step a "readiness assessment" or "mock assessment." It is a dress rehearsal. It answers one question: if the C3PAO came tomorrow, would we pass?

Documentation is the largest share of this work. An assessor scores "not documented" as "not met," so a control that works but has no narrative and no evidence does not count.

## Gap assessment vs. readiness, side by side

| | Gap assessment | Readiness |
|---|---|---|
| Question it answers | Where do we stand? | Can we pass? |
| Output | Score and a prioritized list | Closed controls, SSP, policies, evidence, submitted score |
| Changes your systems? | No | Yes |
| Length | Days to a couple of weeks | Weeks to months |
| Who does it | Readiness partner | Readiness partner plus your MSP or IT support |
| What comes next | Readiness | C3PAO assessment |

## What is the SPRS score and why does 88 matter?

Every contractor handling CUI must post an SPRS score. It starts at 110 and subtracts 1, 3, or 5 points for each unmet control, down to a floor of minus 203.

88 matters because it is the conditional certification line. The rule is score divided by 110 at or above 0.80, which works out to 88 or higher. At 88 or above, a C3PAO can grant conditional Level 2 certification with the remaining items on a Plan of Action and Milestones. Those items must close within 180 days for the certification to become final.

Three constraints shape how you get there:

- Only one-point controls may remain open at certification. Every 3-point and 5-point control must be met.
- MFA (control 3.5.3) is never eligible to stay open, whatever its weight.
- 22 points is the most you can leave on the table (110 minus 88), so at most 22 one-point items can remain open. That is arithmetic from the 88 line, not a separate rule.

This is why a gap assessment is not enough on its own. It shows you a score of, say, minus 12. Readiness is the climb from minus 12 to 88 or above, with the 3-point and 5-point controls closed first.

## Where does the C3PAO assessment fit?

After both. The C3PAO is the independent assessor. It examines your SSP, your evidence, and your systems, and issues the certification result. By rule, the C3PAO cannot be the firm that did your readiness work. That is why the two jobs belong to two firms, in order.

A good readiness engagement ends with the C3PAO week being uneventful. The assessor reads an SSP that matches reality, follows evidence that is already organized, and interviews people who have practiced.

Eagle Ridge does the gap assessment and the readiness work, and never the C3PAO assessment. Read [Why Readiness Comes Before the Assessment](/insights/readiness-before-the-assessment) for the reasoning.

## Which one do I need?

If you have never scored yourself honestly against all 110 controls, you need a gap assessment first. It is short, and every later decision depends on it.

If you have a score and a list but no SSP, no signed policies, and no evidence inventory, you need readiness.

If you have all of that and an assessor-style review found no critical findings, you are ready to hire a C3PAO.

Not sure where you fall? The [CMMC readiness checklist](/cmmc-readiness-checklist) is a quick self-check. [Book a readiness call](/contact) when you want a real score.

## FAQ

**Can I do my own gap assessment?**
You can, and DFARS 252.204-7012 already expects you to self-assess against 800-171. The risk is optimism. Companies that score themselves tend to land high, and the first score with an outside reviewer usually lands lower. An independent gap assessment gives you the number the assessor will see.

**Is a gap assessment the same as a self-assessment for SPRS?**
They cover the same 110 controls and use the same scoring. A gap assessment done by a readiness partner adds the prioritized fix list and a second set of eyes. You can post the resulting score to SPRS.

**Is a readiness assessment the same as a mock assessment?**
Roughly. A mock assessment is the rehearsal step at the end of readiness. Readiness also includes the fixing and the writing that happen before the rehearsal. Ask a vendor which parts its "readiness assessment" includes.

**How long is the gap between readiness and the C3PAO assessment?**
As short as you can make it. An assessment is a snapshot of what is true on the day. If systems or people change between readiness and the assessment, update the SSP and the evidence before the assessor arrives.
