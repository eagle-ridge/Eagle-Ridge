/**
 * Insights (blog) view-model helpers.
 *
 * Articles live in EmDash's `posts` collection (D1) and render at request
 * time. Standalone essays with bespoke layouts stay as prerendered .astro
 * pages under src/pages/insights/ and are listed here so the hub, JSON-LD,
 * and sitemap stay complete.
 */
import { getEmDashCollection } from 'emdash';

export const SITE_URL = 'https://eagleridge.io';
export const AUTHOR = 'Eagle Ridge Advisory';

export interface InsightSummary {
	slug: string;
	title: string;
	description: string;
	pubDate: Date;
	updatedDate: Date;
	/** true when the page is a prerendered .astro essay (not from EmDash). */
	standalone: boolean;
}

// ponytail: hand-maintained entries — keep title/description/pubDate in sync
// with each page's jsonLd. Promote into EmDash only if these multiply.
export const STANDALONE: InsightSummary[] = [
	{
		slug: 'compliance-should-just-work',
		title: 'Compliance should just work',
		description:
			'A first-principles essay on trust, verification, and why the proof of trust is about to be rebuilt.',
		pubDate: new Date('2026-06-12'),
		updatedDate: new Date('2026-06-12'),
		standalone: true,
	},
];

/** Fields EmDash puts on a `posts` entry that this site reads. */
export interface PostData {
	slug: string | null;
	title: string;
	excerpt?: string | null;
	content?: unknown[];
	createdAt: Date;
	updatedAt: Date;
	publishedAt: Date | null;
}

export function toSummary(data: PostData): InsightSummary {
	const pubDate = data.publishedAt ?? data.createdAt;
	return {
		slug: data.slug ?? '',
		title: data.title,
		description: data.excerpt ?? '',
		pubDate,
		updatedDate: data.updatedAt > pubDate ? data.updatedAt : pubDate,
		standalone: false,
	};
}

/**
 * getEmDashEntry reports a missing slug as an error (Astro's
 * LiveEntryNotFoundError) rather than a null entry; only that case is a 404.
 */
export function isNotFound(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;
	const e = error as { name?: string; message?: string };
	return e.name === 'LiveEntryNotFoundError' || /was not found/i.test(e.message ?? '');
}

/** Published EmDash posts + standalone essays, newest first. */
export async function listInsights(): Promise<InsightSummary[]> {
	const { entries, error } = await getEmDashCollection('posts', {
		status: 'published',
		orderBy: { published_at: 'desc' },
	});
	if (error) throw error;
	const posts = entries
		.map((e) => toSummary(e.data as unknown as PostData))
		.filter((p) => p.slug);
	return [...posts, ...STANDALONE].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

// timeZone:'UTC' so a date-only publish date displays as the day the author
// typed, regardless of the server's timezone.
export const dateFmt = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	timeZone: 'UTC',
});
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** ~200 wpm reading estimate from markdown text. */
export function readingMinutes(markdown: string): number {
	const words = markdown.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

/**
 * The .md twin of an article, in the same shape scripts/generate-md-mirrors.py
 * emits for prerendered pages (header comment + H1 = page <title>).
 */
export function articleMirror(summary: InsightSummary, bodyMarkdown: string): string {
	const url = `${SITE_URL}/insights/${summary.slug}`;
	return (
		`<!-- Markdown mirror of ${url} -->\n\n` +
		`# ${summary.title} — ${AUTHOR}\n\n` +
		`By ${AUTHOR} · ${dateFmt.format(summary.pubDate)}\n\n` +
		bodyMarkdown.trim() +
		'\n'
	);
}
