// Markdown content negotiation (acceptmarkdown.com) + agent-friendly 404s.
// Formerly the Cloudflare Pages Functions middleware (site/functions/); now
// runs inside the Worker entry (src/worker.ts), which wraps the EmDash/Astro
// handler and passes a Pages-shaped context ({ request, next, env.ASSETS })
// so the behavior and unit tests carry over unchanged.
//
// Behavior on extensionless page routes (GET/HEAD only):
//   - Accept prefers text/markdown  -> serve the page's .md mirror with
//     `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept`
//   - Accept prefers text/html      -> static HTML via the asset pipeline,
//     with `Vary: Accept` appended
//   - Accept allows neither type    -> 406 listing the supported types
//   - unknown path                  -> 404 (markdown body for markdown
//     clients; dist/404.html for everyone else)
// Q-values are honored per RFC 9110 (specificity: exact > text/* > */*).
// Requests for files with an extension (assets, .md mirrors, sitemaps, ...)
// pass through untouched, as do non-GET/HEAD methods.

const OFFERED = ['text/html', 'text/markdown'];

/** Parse an Accept header into [{ type, subtype, q }]. */
export function parseAccept(header) {
  if (!header || !header.trim()) return [{ type: '*', subtype: '*', q: 1 }];
  const entries = [];
  for (const part of header.split(',')) {
    const bits = part.trim().split(';');
    const media = bits[0].trim().toLowerCase();
    if (!media) continue;
    const slash = media.indexOf('/');
    const type = slash === -1 ? media : media.slice(0, slash);
    const subtype = slash === -1 ? '*' : media.slice(slash + 1);
    let q = 1;
    for (const param of bits.slice(1)) {
      const [k, v] = param.trim().split('=');
      if (k && k.trim().toLowerCase() === 'q') {
        const parsed = parseFloat(v);
        if (!Number.isNaN(parsed)) q = Math.min(Math.max(parsed, 0), 1);
      }
    }
    entries.push({ type, subtype, q });
  }
  return entries.length ? entries : [{ type: '*', subtype: '*', q: 1 }];
}

/** Effective (q, specificity) for one offered media type. */
function qualityFor(offered, entries) {
  const [oType, oSubtype] = offered.split('/');
  let best = null; // { q, specificity }
  for (const e of entries) {
    let specificity;
    if (e.type === oType && e.subtype === oSubtype) specificity = 3;
    else if (e.type === oType && e.subtype === '*') specificity = 2;
    else if (e.type === '*' && e.subtype === '*') specificity = 1;
    else continue;
    if (!best || specificity > best.specificity) best = { q: e.q, specificity };
  }
  return best ? best.q : 0;
}

/**
 * Choose the representation for an Accept header.
 * Returns 'html', 'markdown', or null (406). Ties go to HTML (server default).
 */
export function negotiate(acceptHeader) {
  const entries = parseAccept(acceptHeader);
  const qHtml = qualityFor('text/html', entries);
  const qMd = qualityFor('text/markdown', entries);
  if (qHtml === 0 && qMd === 0) return null;
  return qMd > qHtml ? 'markdown' : 'html';
}

/**
 * Map a negotiable page path to its markdown-mirror asset path.
 * Returns null for paths that are not negotiable (file extension present).
 */
export function markdownMirrorPath(pathname) {
  // Runtime namespaces (/_emdash admin+API, /_image, /_server-islands, ...)
  // are extensionless but never negotiable — their clients send JSON/binary
  // Accept headers that must not be answered with 406 or a .md mirror.
  if (pathname.startsWith('/_')) return null;
  const last = pathname.split('/').pop();
  if (last.includes('.')) return null; // asset / mirror / sitemap etc.
  if (pathname === '/' || pathname === '') return '/index.md';
  return pathname.replace(/\/+$/, '') + '.md';
}

const NOT_FOUND_MD = `# 404 — Page not found

Nothing exists at this path on eagleridge.io.

Useful entry points for agents:

- Site guide (llms.txt): https://eagleridge.io/llms.txt
- Sitemap (markdown): https://eagleridge.io/sitemap.md
- Sitemap (XML): https://eagleridge.io/sitemap.xml
- Agent instructions: https://eagleridge.io/AGENTS.md
- Homepage: https://eagleridge.io/ (markdown mirror: https://eagleridge.io/index.md)

Every public page has a markdown mirror at the same path plus \`.md\`
(for example \`/about\` -> \`/about.md\`).
`;

function withVaryAccept(response) {
  const res = new Response(response.body, response);
  const vary = res.headers.get('Vary');
  if (!vary) res.headers.set('Vary', 'Accept');
  else if (!/\baccept\b(?!-)/i.test(vary)) res.headers.set('Vary', `${vary}, Accept`);
  return res;
}

function markdownHeaders() {
  return {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Vary': 'Accept',
    'X-Content-Type-Options': 'nosniff',
  };
}

export async function onRequest(context) {
  const { request } = context;
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return context.next();

  const url = new URL(request.url);
  const mirrorPath = markdownMirrorPath(url.pathname);
  if (mirrorPath === null) return context.next(); // non-negotiable: pass through

  const choice = negotiate(request.headers.get('Accept'));

  if (choice === null) {
    return new Response(
      `406 Not Acceptable\n\nSupported representations: ${OFFERED.join(', ')}\n`,
      {
        status: 406,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Vary': 'Accept' },
      },
    );
  }

  if (choice === 'markdown') {
    const mirrorUrl = new URL(mirrorPath, url.origin);
    const mirror = await context.env.ASSETS.fetch(new Request(mirrorUrl, { method }));
    if (mirror.ok) {
      return new Response(method === 'HEAD' ? null : mirror.body, {
        status: 200,
        headers: markdownHeaders(),
      });
    }
    // No mirror. If the HTML page exists (e.g. unlisted pages), fall back to
    // it when text/html is acceptable at all; otherwise a markdown 404.
    const html = await context.next();
    if (html.status < 400 && negotiateAllowsHtml(request.headers.get('Accept'))) {
      return withVaryAccept(html);
    }
    return new Response(method === 'HEAD' ? null : NOT_FOUND_MD, {
      status: 404,
      headers: { ...markdownHeaders(), 'X-Robots-Tag': 'noindex' },
    });
  }

  // HTML (default): serve statically — dist/404.html gives unknown paths a
  // real 404 status — and mark the response as negotiated.
  return withVaryAccept(await context.next());
}

export function negotiateAllowsHtml(acceptHeader) {
  return qualityFor('text/html', parseAccept(acceptHeader)) > 0;
}
