import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, '../src/data/market-map-entities.json'), 'utf8'));

// Trusted HTML subset: text, HTML entities, <sup>, <a href="#sN"> footnote links
const HTML_SAFE = /^([^<]|<\/?sup>|<a href="#s\d+">|<\/a>|&[a-z]+;|&#\d+;)*$/;
let errors = 0;

for (const e of data.entities) {
  for (const field of ['notes', 'price', 'cmmc', 'target']) {
    if (!HTML_SAFE.test(e[field] ?? '')) {
      console.error(`Entity ${e.n} (${e.s}): field "${field}" contains unsafe HTML`);
      errors++;
    }
  }
  if (e.url && !/^https:\/\//.test(e.url)) {
    console.error(`Entity ${e.n} (${e.s}): url "${e.url}" is not https://`);
    errors++;
  }
}

if (errors) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
}
console.log(`✓ All ${data.entities.length} entity fields pass allowlist check`);
