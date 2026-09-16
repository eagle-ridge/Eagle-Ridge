/**
 * Sitemap entries, served at request time by src/pages/sitemap.xml.ts and
 * sitemap.md.ts. Static pages come from src/data/sitemap-pages.json (shared
 * with scripts/generate-md-mirrors.py, which builds their .md mirrors);
 * Insights articles come from EmDash + the standalone essay list.
 */
import pages from '../data/sitemap-pages.json';
import { SITE_URL, isoDate, listInsights } from './insights';

export interface SitemapEntry {
	path: string;
	label: string;
	lastmod: string; // YYYY-MM-DD
}

/** Markdown mirror filename for a public path (matches the generator). */
export function mdName(path: string): string {
	return path === '/' ? 'index.md' : path.replace(/^\//, '') + '.md';
}

export async function sitemapEntries(): Promise<SitemapEntry[]> {
	const today = isoDate(new Date());
	const fixed = pages.map((p) => ({ path: p.path, label: p.label, lastmod: today }));
	let articles: Awaited<ReturnType<typeof listInsights>> = [];
	try {
		articles = await listInsights();
	} catch (error) {
		// A sitemap with only the static pages beats a 500 for crawlers; the
		// pages themselves still surface the outage.
		console.error('[sitemap] listing Insights failed; serving static pages only', error);
	}
	const insights = articles.map((a) => ({
		path: `/insights/${a.slug}`,
		label: a.title,
		lastmod: isoDate(a.updatedDate),
	}));
	return [...fixed, ...insights];
}

export function sitemapXml(entries: SitemapEntry[]): string {
	const rows = entries.map(
		(e) =>
			'  <url>\n' +
			`    <loc>${SITE_URL}${e.path}</loc>\n` +
			`    <lastmod>${e.lastmod}</lastmod>\n` +
			`    <priority>${e.path === '/' ? '1.0' : '0.7'}</priority>\n` +
			'  </url>',
	);
	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		rows.join('\n') +
		'\n</urlset>\n'
	);
}

export function sitemapMd(entries: SitemapEntry[]): string {
	const lines = [
		'# Eagle Ridge Advisory — Sitemap',
		'',
		'Markdown sitemap for agents and readers. Each page also has a `.md` mirror.',
		'',
		...entries.map(
			(e) =>
				`- [${e.label}](${SITE_URL}${e.path}) — Markdown: [${mdName(e.path)}](${SITE_URL}/${mdName(e.path)})`,
		),
	];
	return lines.join('\n') + '\n';
}
