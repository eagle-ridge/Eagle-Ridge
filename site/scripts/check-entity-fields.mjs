import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let data;
try {
  data = JSON.parse(readFileSync(join(__dirname, '../src/data/market-map-entities.json'), 'utf8'));
} catch (err) {
  console.error(`check-entity-fields: failed to read/parse market-map-entities.json: ${err.message}`);
  process.exit(1);
}

// Trusted HTML subset: text, HTML entities, <sup>, <a href="#sN"> footnote links
const HTML_SAFE = /^([^<]|<\/?sup>|<a href="#s\d+">|<\/a>|&[a-z]+;|&#\d+;)*$/;
const VALID_CONF = new Set(['high', 'medium', 'low']);
const VALID_CATS = new Set(Object.keys(data.cats));
let errors = 0;

for (const e of data.entities) {
  for (const field of ['notes', 'price', 'cmmc', 'target']) {
    if (!HTML_SAFE.test(e[field] ?? '')) {
      console.error(`Entity ${e.n} (${e.s}): field "${field}" contains disallowed characters or markup`);
      errors++;
    }
  }
  if (e.url && !/^https:\/\//.test(e.url)) {
    console.error(`Entity ${e.n} (${e.s}): url "${e.url}" is not https://`);
    errors++;
  }
  if (!VALID_CONF.has(e.conf)) {
    console.error(`Entity ${e.n} (${e.s}): conf "${e.conf}" is not high/medium/low`);
    errors++;
  }
  if (!VALID_CATS.has(e.cat)) {
    console.error(`Entity ${e.n} (${e.s}): cat "${e.cat}" is not a known category`);
    errors++;
  }
}

if (errors) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
}
console.log(`✓ All ${data.entities.length} entity fields pass allowlist check`);
