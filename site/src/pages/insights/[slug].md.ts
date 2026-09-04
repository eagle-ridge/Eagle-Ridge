// Runtime .md mirror for CMS-served Insights articles (/insights/<slug>.md).
// Prerendered essays get their mirrors from scripts/generate-md-mirrors.py at
// build time and are served as static assets before this route is reached.
import type { APIRoute } from 'astro';
import { getEmDashEntry } from 'emdash';
import { portableTextToMarkdown } from 'emdash/client';
import { articleMirror, isNotFound, toSummary, type PostData } from '../../lib/insights';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const { entry, error } = await getEmDashEntry('posts', params.slug ?? '');
	if (!entry && isNotFound(error)) return new Response('Not found', { status: 404 });
	if (error) {
		console.error('[insights] mirror lookup failed for', params.slug, error);
		return new Response('Server error', { status: 500 });
	}
	if (!entry) return new Response('Not found', { status: 404 });
	const data = entry.data as unknown as PostData;
	const body = portableTextToMarkdown((data.content ?? []) as never);
	return new Response(articleMirror(toSummary(data), body), {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'X-Content-Type-Options': 'nosniff',
		},
	});
};
