import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Long-form prose pages (essay, glossary, privacy). Each has a thin .astro
// wrapper in src/pages/ that sets the exact <title> and JSON-LD.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

// Insights articles live in EmDash (D1) — see src/lib/insights.ts. The
// markdown under seed/posts/ only seeds fresh local/CI databases.

// The GRC tools index. One JSON file (src/data/grc-tools.json) is the build's
// source of truth; this Zod schema IS the validation gate — bad/missing data or
// an out-of-vocabulary enum fails `astro build`, so there is no separate
// validator script. The file is regenerated from the Notion master DB by the
// weekly /grc-tools-update loop; never hand-edit it expecting it to stick.
const grcTools = defineCollection({
  loader: file('./src/data/grc-tools.json'),
  schema: z.object({
    // id is supplied by the loader (the per-row "id" key = url slug); not redeclared.
    name: z.string().min(1),
    type: z.enum([
      'Compliance automation',
      'Enterprise GRC',
      'CMMC-native',
      'Data protection',
      'Third-party risk',
      'Privacy management',
      'Open-source GRC',
    ]),
    priceTag: z.enum(['FREE', '$', '$$', '$$$', 'N/A']),
    blurb: z.string().min(1),
    frameworks: z
      .array(
        z.enum([
          'SOC 2',
          'ISO 27001',
          'HIPAA',
          'PCI DSS',
          'CMMC',
          'NIST 800-171',
          'FedRAMP',
          'GDPR',
          'Privacy',
          'Vendor risk',
          'CUI/ITAR',
        ]),
      )
      .default([]),
    market: z.enum(['SMB', 'Mid-market', 'Enterprise']),
    website: z.string().url(),
    lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'lastReviewed must be YYYY-MM-DD'),
    published: z.boolean().default(false),
  }),
});

export const collections = { pages, grcTools };
