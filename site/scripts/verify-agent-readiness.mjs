// Post-build agent-readiness invariants. Run after `npm run build`
// (needs dist/ + mirrors, and SITE_URL for the runtime sitemap check). Guards the behaviors behind the Is Agentic
// checks: real 404 page, homepage metadata + Organization schema, contact
// trust page, llms.txt when-to-use guidance, sitemap coverage, and the
// presence of the content-negotiation middleware.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = join(__dirname, '..');
const DIST = join(SITE, 'dist', 'client');

let errors = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); errors++; };
const ok = (msg) => console.log(`  ok: ${msg}`);

const read = (p) => readFileSync(p, 'utf8');
const textOfMain = (html) => {
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? html;
  return main
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// ---- 1. Real 404 page ----------------------------------------------------
const notFound = join(DIST, '404.html');
if (!existsSync(notFound)) {
  fail('dist/client/404.html missing — unknown paths will soft-404');
} else {
  const html = read(notFound);
  for (const needle of ['/llms.txt', '/sitemap.md', '/sitemap.xml']) {
    if (!html.includes(needle)) fail(`404.html lacks pointer to ${needle}`);
  }
  if (!/noindex/.test(html)) fail('404.html should carry robots noindex');
  ok('404.html present with agent pointers + noindex');
}

// ---- 2. Homepage metadata + heading hierarchy ---------------------------
const index = read(join(DIST, 'index.html'));
for (const [label, re] of [
  ['<html lang>', /<html lang="en"/],
  ['canonical', /<link rel="canonical" href="https:\/\/eagleridge\.io\/"/],
  ['og:type', /property="og:type"/],
  ['og:image (absolute)', /property="og:image" content="https:\/\/eagleridge\.io\//],
  ['h1', /<h1[\s>]/],
  ['h2', /<h2[\s>]/],
  ['h3 (non-flat heading structure)', /<h3[\s>]/],
]) {
  if (!re.test(index)) fail(`homepage missing ${label}`);
}
const mainText = textOfMain(index);
if (mainText.length < 500) fail(`homepage <main> text is ${mainText.length} chars (< 500)`);
ok(`homepage metadata + headings + ${mainText.length} chars of no-JS text`);

// ---- 3. Organization schema completeness --------------------------------
const ldBlocks = [...index.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((m) => JSON.parse(m[1]));
const org = ldBlocks.find((b) => b['@type'] === 'Organization');
if (!org) fail('homepage has no Organization JSON-LD');
else {
  if (org.contactPoint?.['@type'] !== 'ContactPoint' || !org.contactPoint.email || !org.contactPoint.contactType) {
    fail('Organization JSON-LD contactPoint incomplete (needs @type/email/contactType)');
  }
  if (org.address?.['@type'] !== 'PostalAddress') {
    fail('Organization JSON-LD missing PostalAddress address');
  }
  ok('Organization JSON-LD has contactPoint + address');
}

// ---- 4. Contact trust page ----------------------------------------------
const contactPath = join(DIST, 'contact.html');
if (!existsSync(contactPath)) fail('dist/contact.html missing');
else {
  const contactText = textOfMain(read(contactPath));
  if (contactText.length < 500) fail(`contact page text is ${contactText.length} chars (< 500)`);
  if (!existsSync(join(DIST, 'contact.md'))) fail('dist/contact.md mirror missing');
  ok(`contact page present (${contactText.length} chars) with .md mirror`);
}

// ---- 5. llms.txt when-to-use guidance -----------------------------------
const llms = read(join(SITE, 'public', 'llms.txt'));
if (!/^## When to Use/mi.test(llms)) fail('llms.txt lacks a "When to Use" section');
if (!llms.includes('contact@eagleridge.io')) fail('llms.txt lacks contact email');
if (!llms.includes('/contact')) fail('llms.txt does not reference the contact page');
ok('llms.txt carries when-to-use guidance');

// ---- 6. Sitemap coverage -------------------------------------------------
// Sitemaps are served at request time (they merge static pages with EmDash
// articles), so this check reads them over HTTP. SITE_URL points at a running
// worker: `wrangler dev` in CI, the deployed Worker post-deploy.
const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
if (!siteUrl) {
  fail('SITE_URL not set — sitemap coverage needs a running site (e.g. SITE_URL=http://localhost:8787)');
} else {
  const fetchText = async (path) => {
    const res = await fetch(siteUrl + path);
    if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
    return res.text();
  };
  try {
    const sitemapXml = await fetchText('/sitemap.xml');
    const sitemapMd = await fetchText('/sitemap.md');
    if (!sitemapXml.includes('https://eagleridge.io/contact</loc>')) fail('sitemap.xml missing /contact');
    if (!sitemapMd.includes('/contact.md')) fail('sitemap.md missing contact mirror');
    if (!sitemapXml.includes('https://eagleridge.io/insights/')) fail('sitemap.xml lists no Insights articles');
    if (/404/.test(sitemapXml)) fail('sitemap.xml must not list the 404 page');
    ok(`sitemaps (${siteUrl}) cover /contact + Insights and exclude 404`);
  } catch (e) {
    fail(`could not fetch sitemaps from ${siteUrl}: ${e.message}`);
  }
}

// ---- 7. Negotiation middleware ships ------------------------------------
const middleware = join(SITE, 'src', 'lib', 'negotiation.js');
if (!existsSync(middleware)) fail('site/src/lib/negotiation.js missing — no markdown negotiation');
else {
  const src = read(middleware);
  if (!src.includes('text/markdown')) fail('middleware does not negotiate text/markdown');
  if (!src.includes("'Vary', 'Accept'") && !src.includes("'Vary': 'Accept'")) {
    fail('middleware does not set Vary: Accept');
  }
  ok('content-negotiation middleware present');
}

if (errors) {
  console.error(`\n${errors} agent-readiness check(s) failed.`);
  process.exit(1);
}
console.log('\n✓ All agent-readiness invariants hold');
