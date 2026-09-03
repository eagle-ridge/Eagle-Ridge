// Runtime .md mirror of the Insights hub (/insights.md). The hub renders on
// demand from EmDash, so scripts/generate-md-mirrors.py has no built HTML to
// mirror; this endpoint emits the same shape (header comment + H1 = <title>)
// with the live article list.
import type { APIRoute } from 'astro';
import { AUTHOR, SITE_URL, dateFmt, listInsights } from '../lib/insights';

export const prerender = false;

export const GET: APIRoute = async () => {
	const articles = await listInsights();
	const lines = [
		`<!-- Markdown mirror of ${SITE_URL}/insights -->`,
		'',
		`# Insights — ${AUTHOR}`,
		'',
		'Insights',
		'',
		'# New thinking, plainly put.',
		'',
		'Readiness, assessments, and the work that wins contracts — written for the founder who has to make the call.',
		'',
		...articles.map(
			(a) =>
				`- ${dateFmt.format(a.pubDate)} — [${a.title}](${SITE_URL}/insights/${a.slug}) — ${a.description} (Markdown: ${SITE_URL}/insights/${a.slug}.md)`,
		),
		'',
	];
	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'X-Content-Type-Options': 'nosniff',
		},
	});
};
