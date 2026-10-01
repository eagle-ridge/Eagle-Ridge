// SPRS scoring for the /demo page. Pure functions, no DOM — unit-tested by
// scripts/sprs.test.mjs. Weights come from src/data/demo/controls.json, which is
// generated from the methodology repo's nist-800-171-controls.yaml (DoD
// Assessment Methodology v1.2.1). Never hand-type a weight here.

export const MAX_SCORE = 110;
// 32 CFR 170.21: Conditional Level 2 needs >= 80% of max (88) and every open
// item POA&M-eligible.
export const CONDITIONAL_MIN = 88;

// Points a control loses in its current state. "partial" earns partial credit
// only where the methodology allows it (3.5.3, 3.13.11); elsewhere it is not met.
export function deduction(control, status) {
  if (status === 'met') return 0;
  if (status === 'partial' && control.partialWeight != null) return control.partialWeight;
  return control.weight;
}

// Lowest possible score: every control not met (-203 with the DoD weights).
export function minScore(controls) {
  return controls.reduce((s, c) => s - c.weight, MAX_SCORE);
}

export function score(controls, statusOf) {
  let s = MAX_SCORE;
  for (const c of controls) s -= deduction(c, statusOf(c.id));
  return s;
}

// Can this open item ride a POA&M instead of blocking certification?
export function poamAllowed(control, status) {
  if (status === 'met') return true;
  if (status === 'partial' && control.partialWeight != null) return Boolean(control.poamIfPartial);
  return Boolean(control.poamEligible);
}

export function readiness(controls, statusOf) {
  const counts = { met: 0, partial: 0, not_met: 0 };
  const blocking = [];
  const poamable = [];
  for (const c of controls) {
    const st = statusOf(c.id);
    counts[st] = (counts[st] ?? 0) + 1;
    if (st === 'met') continue;
    (poamAllowed(c, st) ? poamable : blocking).push(c.id);
  }
  const s = score(controls, statusOf);
  return {
    score: s,
    counts,
    blocking,
    poamable,
    pointsToConditional: Math.max(0, CONDITIONAL_MIN - s),
    conditionalReady: s >= CONDITIONAL_MIN && blocking.length === 0,
    finalReady: counts.met === controls.length,
  };
}
