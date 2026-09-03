// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import emdash from 'emdash/astro';
import { d1, r2 } from '@emdash-cms/cloudflare';

// EmDash CMS runs at request time (admin at /_emdash/admin, content API,
// live collections), so output is 'server' on Cloudflare Workers. Every
// pre-existing page sets `export const prerender = true`, keeping the static
// HTML in dist/ that the markdown-mirror parity pipeline reads.
//
// format:'file' emits dist/about.html, served at /about by the Workers
// static-asset layer. compressHTML stays off so the markdown-mirror parity
// oracle sees stable whitespace.
export default defineConfig({
  site: 'https://eagleridge.io',
  output: 'server',
  adapter: cloudflare(),
  trailingSlash: 'never',
  compressHTML: false,
  build: {
    format: 'file',
    // No render-blocking stylesheet request; font URLs discovered in HTML.
    inlineStylesheets: 'always',
  },
  markdown: {
    // Copy is parity-locked; the pipeline must not rewrite quotes/dashes.
    smartypants: false,
  },
  integrations: [
    react(), // required — the EmDash admin UI is a React app
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
    }),
  ],
});
