// Push seed/import/*.json (built by scripts/build-seed.mjs) into a REAL EmDash
// instance — the one-time content migration from markdown into the CMS.
//
//   npx emdash login --url https://eagleridge.mcconnell-chris.workers.dev   # once, OAuth device flow
//   EMDASH_URL=https://eagleridge.mcconnell-chris.workers.dev npm run seed:import
//
// Auth: EMDASH_TOKEN, else the token `emdash login` stored in
// ~/.config/emdash/auth.json for that origin. Idempotent: a post whose slug
// already exists is skipped. Keeps the original publish dates and tags.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { EmDashClient } from 'emdash/client';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMPORT_DIR = join(SITE, 'seed', 'import');
const baseUrl = process.env.EMDASH_URL;
if (!baseUrl) {
  console.error('EMDASH_URL is required (the instance to import into).');
  process.exit(1);
}
const origin = new URL(baseUrl).origin;

function storedToken() {
  const xdg = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
  try {
    const all = JSON.parse(readFileSync(join(xdg, 'emdash', 'auth.json'), 'utf8'));
    const cred = all[origin] ?? all.credentials?.[origin];
    return cred?.accessToken;
  } catch {
    return undefined;
  }
}
const token = process.env.EMDASH_TOKEN || storedToken();
if (!token) {
  console.error(`No token for ${origin}. Run: npx emdash login --url ${origin}`);
  process.exit(1);
}

const client = new EmDashClient({ baseUrl: origin, token });

const existing = new Map();
for (const item of (await client.list('posts', { limit: 200 })).items ?? []) existing.set(item.slug, item);

const wanted = readdirSync(IMPORT_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(IMPORT_DIR, f), 'utf8')));

// Tag terms first (idempotent by slug).
const termSlug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const have = new Set((await client.terms('tag')).map((t) => t.slug));
for (const label of new Set(wanted.flatMap((p) => p.tags))) {
  const slug = termSlug(label);
  if (have.has(slug)) continue;
  await client.createTerm('tag', { slug, label });
  console.log(`tag: created ${slug}`);
}

for (const p of wanted) {
  if (existing.has(p.slug)) {
    console.log(`post: ${p.slug} exists — skipped`);
    continue;
  }
  // client.create converts the markdown `content` string to Portable Text
  // from the collection's field schema. publishedAt/taxonomies are extra
  // request-body fields the API accepts (content:publish_any = admin).
  const item = await client.create('posts', {
    data: p.data,
    slug: p.slug,
    status: 'published',
    publishedAt: p.publishedAt,
    taxonomies: { tag: p.tags.map(termSlug) },
  });
  console.log(`post: created ${p.slug} (${item.id}) published ${item.publishedAt}`);
}
console.log('done');
