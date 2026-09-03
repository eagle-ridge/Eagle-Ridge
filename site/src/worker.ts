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
	fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
		// Legacy-URL 301s first (see src/lib/redirects.js for why the asset
		// layer can't be left to answer these under run_worker_first).
		const redirect = matchRedirect(REDIRECTS, new URL(request.url));
		if (redirect) return Promise.resolve(redirect);
		return onRequest({
			request,
			env,
			next: () => emdashFetch(request, env, ctx),
		});
	},
	scheduled: createScheduledHandler(),
};
