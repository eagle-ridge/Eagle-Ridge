// Seed Insights content into the LOCAL D1 that `wrangler dev` uses.
//
// EmDash's runtime auto-seed only creates the schema on a fresh database; the
// content in seed/seed.json (posts + tag terms) is applied by the CLI against
// the SQLite file behind wrangler's local D1 simulation. Run after `wrangler
// dev` has answered its first request (that's when the schema exists):
//
//   npm run seed:local
//
// Idempotent (on-conflict: skip). Never points at production — it only ever
// opens .wrangler/state/**.sqlite.
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const D1_DIR = join(SITE, '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');

let files;
try {
  files = readdirSync(D1_DIR).filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
} catch {
  files = [];
}
if (files.length !== 1) {
  console.error(
    `expected exactly one local D1 sqlite under ${D1_DIR}, found ${files.length}. ` +
      'Start `wrangler dev` and load a page first (or `rm -rf .wrangler/state` if stale).',
  );
  process.exit(1);
}
const db = join(D1_DIR, files[0]);
console.log(`seeding ${db} (${statSync(db).size} bytes)`);
const res = spawnSync('npx', ['emdash', 'seed', '-d', db, join(SITE, 'seed', 'seed.json')], {
  cwd: SITE,
  stdio: 'inherit',
});
process.exit(res.status ?? 1);
