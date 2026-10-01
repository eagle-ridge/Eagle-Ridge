// Integrity checks for src/data/demo/controls.json (NIST SP 800-171 Rev 2, DoD weights).
// Official id lists copied from eagle-ridge-methodology tests/test_register.py
// (test_weights_match_dod_methodology). Run via `node --test`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, '..', 'src', 'data', 'demo', 'controls.json'), 'utf8'));
const { controls, families } = data;
const byId = new Map(controls.map((c) => [c.id, c]));

const BASIC_5 = ['3.1.1','3.1.2','3.2.1','3.2.2','3.3.1','3.4.1','3.4.2','3.5.1','3.5.2','3.6.1','3.6.2','3.7.2','3.8.3','3.9.2','3.10.1','3.10.2','3.12.1','3.12.3','3.13.1','3.13.2','3.14.1','3.14.2','3.14.3'];
const DERIVED_5 = ['3.1.12','3.1.13','3.1.16','3.1.17','3.1.18','3.3.5','3.4.5','3.4.6','3.4.7','3.4.8','3.5.10','3.7.5','3.8.7','3.11.2','3.13.5','3.13.6','3.13.15','3.14.4','3.14.6'];
const SPECIAL_5 = ['3.5.3', '3.13.11'];
const BASIC_3 = ['3.3.2','3.7.1','3.8.1','3.8.2','3.9.1','3.11.1','3.12.2'];
const DERIVED_3 = ['3.1.5','3.1.19','3.7.4','3.8.8','3.13.8','3.14.5','3.14.7'];
const ALL_5 = new Set([...BASIC_5, ...DERIVED_5, ...SPECIAL_5]);
const ALL_3 = new Set([...BASIC_3, ...DERIVED_3]);

test('110 controls with unique ids', () => {
  assert.equal(controls.length, 110);
  assert.equal(byId.size, 110);
});

test('14 families in NIST order, all used', () => {
  assert.deepEqual(families.map((f) => f.code), ['AC','AT','AU','CM','IA','IR','MA','MP','PS','PE','RA','CA','SC','SI']);
  const used = new Set(controls.map((c) => c.family));
  assert.equal(used.size, 14);
  for (const f of families) assert.ok(used.has(f.code), f.code);
});

test('controls ordered by numeric id', () => {
  const key = (id) => id.split('.').map(Number);
  for (let i = 1; i < controls.length; i++) {
    const [a, b] = [key(controls[i - 1].id), key(controls[i].id)];
    assert.ok(a[1] < b[1] || (a[1] === b[1] && a[2] < b[2]), controls[i].id);
  }
});

test('weight tiers: 44 / 14 / 51 / 1, sum 313, worst SPRS -203', () => {
  const n = (w) => controls.filter((c) => c.weight === w).length;
  assert.equal(n(5), 44);
  assert.equal(n(3), 14);
  assert.equal(n(1), 51);
  assert.equal(n(0), 1);
  assert.equal(byId.get('3.12.4').weight, 0);
  const sum = controls.reduce((s, c) => s + c.weight, 0);
  assert.equal(sum, 313);
  assert.equal(110 - sum, -203);
});

test('weights match official DoD 5-point and 3-point lists', () => {
  assert.equal(ALL_5.size, 44);
  assert.equal(ALL_3.size, 14);
  for (const c of controls) {
    const expected = ALL_5.has(c.id) ? 5 : ALL_3.has(c.id) ? 3 : c.id === '3.12.4' ? 0 : 1;
    assert.equal(c.weight, expected, c.id);
  }
});

test('partial-credit controls 3.5.3 and 3.13.11', () => {
  assert.equal(byId.get('3.5.3').partialWeight, 3);
  assert.equal(byId.get('3.5.3').poamIfPartial, false);
  assert.equal(byId.get('3.13.11').partialWeight, 3);
  assert.equal(byId.get('3.13.11').poamIfPartial, true);
  for (const c of controls) {
    if (!['3.5.3', '3.13.11'].includes(c.id)) {
      assert.ok(!('partialWeight' in c) && !('poamIfPartial' in c), c.id);
    }
  }
});

test('plain-language strings are non-empty and at most 22 words', () => {
  for (const c of controls) {
    assert.equal(typeof c.plain, 'string', c.id);
    const words = c.plain.trim().split(/\s+/).filter(Boolean);
    assert.ok(words.length >= 1 && words.length <= 22, `${c.id}: ${words.length} words`);
  }
});
