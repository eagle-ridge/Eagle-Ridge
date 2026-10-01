// Unit tests for src/lib/sprs.js (the /demo page's scoring). Run via `npm test`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { score, minScore, readiness, deduction, MAX_SCORE } from '../src/lib/sprs.js';

const here = dirname(fileURLToPath(import.meta.url));
const data = (f) => JSON.parse(readFileSync(join(here, '..', 'src', 'data', 'demo', f), 'utf8'));
const { controls } = data('controls.json');
const byId = Object.fromEntries(controls.map((c) => [c.id, c]));

test('all met scores 110 and is final-ready', () => {
  const r = readiness(controls, () => 'met');
  assert.equal(r.score, MAX_SCORE);
  assert.equal(r.finalReady, true);
});

test('nothing met scores the DoD worst case, -203', () => {
  assert.equal(score(controls, () => 'not_met'), -203);
  assert.equal(minScore(controls), -203);
});

test('partial credit only on 3.5.3 and 3.13.11', () => {
  assert.equal(deduction(byId['3.5.3'], 'partial'), 3);
  assert.equal(deduction(byId['3.13.11'], 'partial'), 3);
  assert.equal(deduction(byId['3.1.1'], 'partial'), 5); // no partial credit elsewhere
});

test('a 5-point gap blocks Conditional status even at a high score', () => {
  const r = readiness(controls, (id) => (id === '3.1.1' ? 'not_met' : 'met'));
  assert.equal(r.score, 105);
  assert.deepEqual(r.blocking, ['3.1.1']);
  assert.equal(r.conditionalReady, false);
});

test('POA&M rules for the partial-credit controls', () => {
  const fips = readiness(controls, (id) => (id === '3.13.11' ? 'partial' : 'met'));
  assert.deepEqual(fips.poamable, ['3.13.11']);
  assert.equal(fips.conditionalReady, true);
  const mfa = readiness(controls, (id) => (id === '3.5.3' ? 'partial' : 'met'));
  assert.deepEqual(mfa.blocking, ['3.5.3']);
});

test('fictional client data is complete and scores as the page claims', () => {
  const client = data('client.json');
  assert.equal(client.fictional, true);
  assert.equal(Object.keys(client.controls).length, 110);
  for (const c of controls) assert.ok(client.controls[c.id], `missing ${c.id}`);
  const r = readiness(controls, (id) => client.controls[id].status);
  assert.ok(r.score > client.baseline.sprs, 'current score should beat the baseline');
  // The SPRS document's prose quotes the live numbers; keep them in step.
  const sprsDoc = client.documents.find((d) => d.kind === 'SPRS');
  const prose = [sprsDoc.summary, ...sprsDoc.sections.map((s) => s.body)].join(' ');
  assert.match(prose, new RegExp(`${r.score} out of ${MAX_SCORE}\\b`));
  assert.match(prose, new RegExp(`${r.counts.met} controls are met and ${r.counts.partial + r.counts.not_met} are open\\b`));
  assert.match(prose, new RegExp(`up from ${client.baseline.sprs}\\b`));
  const people = new Set(client.people.map((p) => p.id));
  for (const [id, c] of Object.entries(client.controls)) {
    assert.ok(people.has(c.owner), `${id} owner ${c.owner} unknown`);
  }
});
