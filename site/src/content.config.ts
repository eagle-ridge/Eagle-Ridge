import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Long-form prose pages (essay, glossary, privacy). Each has a thin .astro
// wrapper in src/pages/ that sets the exact <title> and JSON-LD.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

// Dated long-form articles, auto-listed by the Insights hub. Each .md lives in
// src/content/articles/ and renders via src/pages/insights/[...slug].astro.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z
    .object({
      // .min(1): title/description feed <title>, <h1>, meta, OG, and JSON-LD —
      // an empty string passes z.string() but ships a broken page. Fail loud.
      title: z.string().min(1),
      description: z.string().min(1),
      pubDate: z.date(),
      updatedDate: z.date().optional(),
      author: z.string().default('Eagle Ridge Advisory'),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
    })
    .refine((d) => !d.updatedDate || d.updatedDate >= d.pubDate, {
      message: 'updatedDate must be on or after pubDate',
      path: ['updatedDate'],
    }),
});

export const collections = { pages, articles };
