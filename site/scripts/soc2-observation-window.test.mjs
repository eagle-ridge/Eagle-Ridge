// Content assertions for src/pages/soc2-observation-window.astro
// (plans/008-soc2-observation-window-revisions.md). Reads the page source so
// the check runs without a build. Run via `npm test`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'src', 'pages', 'soc2-observation-window.astro'), 'utf8');

// Plain-text view: drop SVG + tags, decode the entities the page uses, collapse whitespace.
const text = src
  .replace(/<svg[\s\S]*?<\/svg>/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&thinsp;/g, ' ')
  .replace(/&mdash;/g, '—')
  .replace(/&rsquo;/g, '’')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');

const required = {
  'C1 intro leads with the 3-vs-6-month range':
    'eight months out with the minimum three-month window, and closer to eleven if they want six',
  'C2 footnote qualifies the two-month remediation':
    'assumes a managed engagement with templates, automation, and dedicated support',
  'C3 body: entering clean is necessary but not sufficient':
    'Entering clean is necessary but not sufficient',
  'C3 footnote defines an exception and the four opinions':
    'An exception is a documented instance where a control didn’t operate as intended during the window',
  'C4 footnote separates criteria from controls':
    'Criteria are the Trust Services objectives; controls are what we implement',
  'C5 footnote cites the CBIZ benchmark':
    'roughly 75% and 64% of reports respectively (CBIZ 2024 SOC Benchmark Study)',
};

for (const [name, phrase] of Object.entries(required)) {
  test(name, () => assert.ok(text.includes(phrase), `missing: "${phrase}"`));
}

test('C1 no longer leads with the bare eight-month figure', () => {
  assert.ok(!text.includes('is about eight months out'));
});

test('C6 Fig. 03 section no longer restates the fixed window', () => {
  assert.ok(!text.includes('from day one of the window'));
});
