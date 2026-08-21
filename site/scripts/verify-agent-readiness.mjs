// Post-build agent-readiness invariants. Run after `npm run build`
// (needs dist/ + mirrors). Guards the behaviors behind the Is Agentic
// checks: real 404 page, homepage metadata + Organization schema, contact
// trust page, llms.txt when-to-use guidance, sitemap coverage, and the
// presence of the content-negotiation middleware.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = join(__dirname, '..');
const DIST = join(SITE, 'dist');

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
  fail('dist/404.html missing — Cloudflare Pages will soft-404 unknown paths');
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
const sitemapXml = read(join(DIST, 'sitemap.xml'));
const sitemapMd = read(join(DIST, 'sitemap.md'));
if (!sitemapXml.includes('https://eagleridge.io/contact</loc>')) fail('sitemap.xml missing /contact');
if (!sitemapMd.includes('/contact.md')) fail('sitemap.md missing contact mirror');
if (/404/.test(sitemapXml)) fail('sitemap.xml must not list the 404 page');
ok('sitemaps cover /contact and exclude 404');

// ---- 7. Negotiation middleware ships ------------------------------------
const middleware = join(SITE, 'functions', '_middleware.js');
if (!existsSync(middleware)) fail('site/functions/_middleware.js missing — no markdown negotiation');
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
