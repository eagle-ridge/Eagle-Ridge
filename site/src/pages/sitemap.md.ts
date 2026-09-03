import type { APIRoute } from 'astro';
import { sitemapEntries, sitemapMd } from '../lib/sitemap';

export const prerender = false;

export const GET: APIRoute = async () =>
	new Response(sitemapMd(await sitemapEntries()), {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'X-Content-Type-Options': 'nosniff',
		},
	});
