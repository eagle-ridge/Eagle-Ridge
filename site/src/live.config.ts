/**
 * EmDash Live Content Collections.
 *
 * Registers the _emdash live collection so Astro's content layer can resolve
 * CMS content at request time via getEmDashCollection() / getEmDashEntry().
 * The file-based collections in src/content.config.ts (pages, articles,
 * grcTools) keep working alongside it.
 */

import { defineLiveCollection } from 'astro:content';
import { emdashLoader } from 'emdash/runtime';

export const collections = {
	_emdash: defineLiveCollection({ loader: emdashLoader() }),
};
