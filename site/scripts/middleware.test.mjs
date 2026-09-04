// Unit tests for src/lib/negotiation.js (markdown content negotiation +
// agent-friendly 404s, invoked from src/worker.ts). Run via `npm test`
// (node --test scripts/).
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseAccept,
  negotiate,
  markdownMirrorPath,
  negotiateAllowsHtml,
  onRequest,
} from '../src/lib/negotiation.js';

// ---- negotiate / parseAccept -------------------------------------------

test('no Accept header defaults to html', () => {
  assert.equal(negotiate(null), 'html');
  assert.equal(negotiate(''), 'html');
});

test('Accept: */* serves html', () => {
  assert.equal(negotiate('*/*'), 'html');
});

test('browser-style Accept serves html', () => {
  assert.equal(
    negotiate('text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8'),
    'html',
  );
});

test('Accept: text/markdown serves markdown', () => {
  assert.equal(negotiate('text/markdown'), 'markdown');
});

test('markdown preferred by q-value wins', () => {
  assert.equal(negotiate('text/html;q=0.4, text/markdown;q=0.9'), 'markdown');
  assert.equal(negotiate('text/markdown;q=0.9, text/html'), 'html');
  assert.equal(negotiate('text/markdown, */*;q=0.1'), 'markdown');
});

test('equal q ties go to html (server default)', () => {
  assert.equal(negotiate('text/markdown, text/html'), 'html');
});

test('exact type beats wildcard at same q', () => {
  // text/* q=1 covers markdown; html only via */*;q=0.8 -> markdown wins
  assert.equal(negotiate('text/markdown;q=0.9, */*;q=0.5'), 'markdown');
});

test('unsupported-only Accept yields 406 (null)', () => {
  assert.equal(negotiate('application/json'), null);
  assert.equal(negotiate('image/webp, application/xml;q=0.9'), null);
});

test('q=0 disables a type', () => {
  assert.equal(negotiate('text/html;q=0, text/markdown'), 'markdown');
  assert.equal(negotiate('text/html;q=0, text/markdown;q=0'), null);
  assert.equal(negotiateAllowsHtml('text/html;q=0, text/markdown'), false);
});

test('parseAccept handles malformed input gracefully', () => {
  assert.equal(negotiate(';;;,'), 'html'); // degenerate -> wildcard default
  assert.deepEqual(parseAccept('text/html;q=oops')[0].q, 1);
});

// ---- markdownMirrorPath -------------------------------------------------

test('mirror path mapping', () => {
  assert.equal(markdownMirrorPath('/'), '/index.md');
  assert.equal(markdownMirrorPath('/about'), '/about.md');
  assert.equal(markdownMirrorPath('/insights/nobody-built-the-first-mile'), '/insights/nobody-built-the-first-mile.md');
  assert.equal(markdownMirrorPath('/about.md'), null);
  assert.equal(markdownMirrorPath('/logo.png'), null);
  assert.equal(markdownMirrorPath('/sitemap.xml'), null);
  assert.equal(markdownMirrorPath('/llms.txt'), null);
  // Runtime namespaces are extensionless but never negotiable — the EmDash
  // admin/API and Astro's image endpoint must not get 406s or .md mirrors.
  assert.equal(markdownMirrorPath('/_emdash/admin'), null);
  assert.equal(markdownMirrorPath('/_emdash/api/content'), null);
  assert.equal(markdownMirrorPath('/_image'), null);
});

// ---- onRequest integration (mocked Pages context) -----------------------

function makeContext({ path = '/', accept, method = 'GET', assets = {}, nextResponse } = {}) {
  const headers = new Headers();
  if (accept !== undefined) headers.set('Accept', accept);
  const calls = { next: 0, assetPaths: [] };
  return {
    calls,
    context: {
      request: new Request(`https://eagleridge.io${path}`, { method, headers }),
      next: async () => {
        calls.next += 1;
        return (
          nextResponse ??
          new Response('<!DOCTYPE html><html><body>page</body></html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        );
      },
      env: {
        ASSETS: {
          fetch: async (req) => {
            const p = new URL(req.url).pathname;
            calls.assetPaths.push(p);
            if (p in assets) {
              return new Response(assets[p], {
                status: 200,
                headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
              });
            }
            return new Response('Not Found', { status: 404 });
          },
        },
      },
    },
  };
}

test('markdown Accept on a mirrored page serves the mirror', async () => {
  const { context } = makeContext({
    path: '/about',
    accept: 'text/markdown',
    assets: { '/about.md': '# About\n\nbody' },
  });
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(res.headers.get('Vary'), 'Accept');
  assert.match(await res.text(), /^# About/);
});

test('homepage maps to /index.md', async () => {
  const { context, calls } = makeContext({
    path: '/',
    accept: 'text/markdown',
    assets: { '/index.md': '# Home' },
  });
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assert.deepEqual(calls.assetPaths, ['/index.md']);
});

test('html Accept passes through with Vary: Accept appended', async () => {
  const { context, calls } = makeContext({ path: '/about', accept: 'text/html' });
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assert.equal(calls.next, 1);
  assert.equal(res.headers.get('Vary'), 'Accept');
  assert.match(res.headers.get('Content-Type'), /text\/html/);
});

test('existing Vary header is extended, not clobbered', async () => {
  const { context } = makeContext({
    path: '/about',
    accept: 'text/html',
    nextResponse: new Response('x', { status: 200, headers: { Vary: 'Accept-Encoding' } }),
  });
  const res = await onRequest(context);
  assert.equal(res.headers.get('Vary'), 'Accept-Encoding, Accept');
});

test('unsupported Accept gets 406 with Vary: Accept', async () => {
  const { context, calls } = makeContext({ path: '/about', accept: 'application/json' });
  const res = await onRequest(context);
  assert.equal(res.status, 406);
  assert.equal(res.headers.get('Vary'), 'Accept');
  assert.equal(calls.next, 0);
  assert.match(await res.text(), /text\/html, text\/markdown/);
});

test('unknown path + markdown Accept returns markdown 404 with pointers', async () => {
  const { context } = makeContext({
    path: '/no-such-page',
    accept: 'text/markdown',
    nextResponse: new Response('not found html', { status: 404 }),
  });
  const res = await onRequest(context);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(res.headers.get('Vary'), 'Accept');
  const body = await res.text();
  assert.match(body, /llms\.txt/);
  assert.match(body, /sitemap\.md/);
});

test('unknown path + html Accept passes the static 404 through', async () => {
  const { context } = makeContext({
    path: '/no-such-page',
    accept: 'text/html',
    nextResponse: new Response('404 page', { status: 404 }),
  });
  const res = await onRequest(context);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('Vary'), 'Accept');
});

test('mirror-less page falls back to html when acceptable', async () => {
  // /discovery is deliberately unmirrored; markdown-preferring agents that
  // still accept html get the page rather than a dead end.
  const { context } = makeContext({
    path: '/discovery',
    accept: 'text/markdown, text/html;q=0.5',
  });
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Vary'), 'Accept');
  assert.match(res.headers.get('Content-Type'), /text\/html/);
});

test('asset requests are untouched (no negotiation, no Vary)', async () => {
  const { context, calls } = makeContext({ path: '/logo.png', accept: 'text/markdown' });
  const res = await onRequest(context);
  assert.equal(calls.next, 1);
  assert.equal(calls.assetPaths.length, 0);
  assert.equal(res.headers.get('Vary'), null);
});

test('direct .md request serves the static mirror when one was built', async () => {
  const { context, calls } = makeContext({
    path: '/insights/compliance-should-just-work.md',
    accept: 'text/html',
    assets: { '/insights/compliance-should-just-work.md': '# Manifesto' },
  });
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(calls.next, 0);
  assert.deepEqual(calls.assetPaths, ['/insights/compliance-should-just-work.md']);
  assert.match(await res.text(), /^# Manifesto/);
});

test('direct .md request keeps the asset layer headers (ETag/Cache-Control)', async () => {
  const { context } = makeContext({ path: '/about.md', accept: 'text/html' });
  context.env.ASSETS.fetch = async () =>
    new Response('# About', {
      status: 200,
      headers: { 'Content-Type': 'text/markdown', ETag: '"abc"', 'Cache-Control': 'public, max-age=0, must-revalidate' },
    });
  const res = await onRequest(context);
  assert.equal(res.headers.get('ETag'), '"abc"');
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate');
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
});

test('direct .md request with no static mirror falls through to the app', async () => {
  const { context, calls } = makeContext({ path: '/insights/cms-article.md', accept: 'text/html' });
  await onRequest(context);
  assert.equal(calls.next, 1);
  assert.deepEqual(calls.assetPaths, ['/insights/cms-article.md']);
});

test('non-GET methods pass through', async () => {
  const { context, calls } = makeContext({ path: '/contact', accept: 'text/markdown', method: 'POST' });
  await onRequest(context);
  assert.equal(calls.next, 1);
  assert.equal(calls.assetPaths.length, 0);
});

test('HEAD negotiates like GET but returns no body', async () => {
  const { context } = makeContext({
    path: '/about',
    accept: 'text/markdown',
    method: 'HEAD',
    assets: { '/about.md': '# About' },
  });
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(await res.text(), '');
});

// ---- runtime mirrors (CMS-served pages) ---------------------------------

test('mirror miss falls back to renderMirror for CMS-served pages', async () => {
  const { context, calls } = makeContext({
    path: '/insights/some-cms-article',
    accept: 'text/markdown',
  });
  const rendered = [];
  context.renderMirror = async (req) => {
    rendered.push(new URL(req.url).pathname);
    return new Response('# Some CMS article', {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  };
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(res.headers.get('Vary'), 'Accept');
  assert.deepEqual(calls.assetPaths, ['/insights/some-cms-article.md']);
  assert.deepEqual(rendered, ['/insights/some-cms-article.md']);
  assert.match(await res.text(), /^# Some CMS article/);
});

test('renderMirror miss still yields the markdown 404', async () => {
  const { context } = makeContext({
    path: '/insights/nope',
    accept: 'text/markdown',
    nextResponse: new Response('not found html', { status: 404 }),
  });
  context.renderMirror = async () => new Response('Not found', { status: 404 });
  const res = await onRequest(context);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
});
