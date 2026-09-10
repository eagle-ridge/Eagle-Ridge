/**
 * Cloudflare Worker entry.
 *
 * Wraps the EmDash/Astro handler with the markdown content-negotiation layer
 * that used to run as a Pages Function (see src/lib/negotiation.js), and adds
 * the EmDash `scheduled()` handler so Cron Triggers drive scheduled
 * publishing and Media Usage maintenance (see wrangler.jsonc `triggers`).
 *
 * Bundled by `astro build` via the @astrojs/cloudflare adapter (wrangler.jsonc
 * `main` points here). Asset requests reach this fetch handler before the
 * static layer, so negotiation sees extensionless page routes; everything it
 * declines to handle falls through to the EmDash/Astro handler, which serves
 * prerendered HTML and static assets via the ASSETS binding.
 */

import handler, { createScheduledHandler, PluginBridge } from '@emdash-cms/cloudflare/worker';
// @ts-expect-error plain-JS module shared with the node:test suite
import { onRequest } from './lib/negotiation.js';
// @ts-expect-error plain-JS module shared with the node:test suite
import { parseRedirects, matchRedirect } from './lib/redirects.js';
// @ts-expect-error Vite raw import — public/_redirects stays the source of truth
import redirectsText from '../public/_redirects?raw';

export { PluginBridge };

const emdashFetch = handler.fetch;
if (!emdashFetch) throw new Error('EmDash worker handler has no fetch()');

const REDIRECTS = parseRedirects(redirectsText);

export default {
	...handler,
	async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		// Legacy-URL 301s first (see src/lib/redirects.js for why the asset
		// layer can't be left to answer these under run_worker_first).
		const redirect = matchRedirect(REDIRECTS, url);
		if (redirect) return redirect;
		const response: Response = await onRequest({
			request,
			env,
			next: () => emdashFetch(request, env, ctx),
		});
		// The workers.dev preview host is a duplicate of eagleridge.io (GH #110).
		// Keep it reachable (EmDash admin lives here until DNS cutover) but out
		// of search and AI indexes; <link rel=canonical> already points at eagleridge.io.
		if (url.hostname.endsWith('.workers.dev')) {
			const noindexed = new Response(response.body, response);
			noindexed.headers.set('X-Robots-Tag', 'noindex, nofollow');
			return noindexed;
		}
		return response;
	},
	scheduled: createScheduledHandler(),
};
