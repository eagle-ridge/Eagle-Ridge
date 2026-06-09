// @ts-check
import { defineConfig } from 'astro/config';

// format:'file' emits dist/about.html, which Cloudflare Pages serves at /about.
// compressHTML stays off so the markdown-mirror parity oracle sees stable whitespace.
export default defineConfig({
  site: 'https://eagleridge.io',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  build: {
    format: 'file',
  },
  markdown: {
    // Copy is parity-locked; the pipeline must not rewrite quotes/dashes.
    smartypants: false,
  },
});
