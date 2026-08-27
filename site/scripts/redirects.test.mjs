// Unit tests for src/lib/redirects.js (legacy-URL 301s served from the
// Worker, parsed from public/_redirects). Run via `npm test`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

import { parseRedirects, matchRedirect } from '../src/lib/redirects.js';

const here = dirname(fileURLToPath(import.meta.url));
const redirectsFile = readFileSync(join(here, '..', 'public', '_redirects'), 'utf8');

test('parses the real _redirects file into exact-path 301 rules', () => {
  const rules = parseRedirects(redirectsFile);
  assert.ok(rules.size >= 9, `expected >= 9 rules, got ${rules.size}`);
  assert.deepEqual(rules.get('/about.html'), { to: '/about', status: 301 });
  assert.deepEqual(rules.get('/index.html'), { to: '/', status: 301 });
  assert.deepEqual(rules.get('/nobody-built-the-first-mile'), {
    to: '/insights/nobody-built-the-first-mile',
    status: 301,
  });
});

test('parser skips comments, blanks, and splat/placeholder rules', () => {
  const rules = parseRedirects('# comment\n\n/a /b 301\n/old/* /new/:splat 301\n');
  assert.equal(rules.size, 1);
  assert.deepEqual(rules.get('/a'), { to: '/b', status: 301 });
});

test('status defaults to 302 when omitted or malformed', () => {
  const rules = parseRedirects('/a /b\n/c /d oops\n');
  assert.equal(rules.get('/a').status, 302);
  assert.equal(rules.get('/c').status, 302);
});

test('matchRedirect issues the redirect and preserves the query string', () => {
  const rules = parseRedirects(redirectsFile);
  const res = matchRedirect(rules, new URL('https://eagleridge.io/about.html?utm_source=x'));
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('Location'), 'https://eagleridge.io/about?utm_source=x');
});

test('matchRedirect returns null for unmapped paths', () => {
  const rules = parseRedirects(redirectsFile);
  assert.equal(matchRedirect(rules, new URL('https://eagleridge.io/about')), null);
  assert.equal(matchRedirect(rules, new URL('https://eagleridge.io/contact.html')), null);
});
