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

export const collections = { pages };
