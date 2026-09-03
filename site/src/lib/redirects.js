// Legacy-URL redirects for the Worker layer.
//
// public/_redirects remains the single source of truth (same syntax Cloudflare
// Pages used). With `run_worker_first` enabled the static-asset layer no
// longer answers requests directly, and the Astro handler's internal
// `ASSETS.fetch` *follows* asset-layer redirects instead of surfacing them —
// old URLs would serve 200s at the wrong path. src/worker.ts imports the
// _redirects file as raw text (Vite `?raw`), parses it here, and issues the
// 301s itself before content negotiation runs.

/**
 * Parse Cloudflare Pages `_redirects` syntax ("/from /to [status]" lines,
 * '#' comments) into a Map of exact-path rules. Splat/placeholder rules are
 * ignored (none are used; add handling before introducing one).
 * @param {string} text
 * @returns {Map<string, { to: string, status: number }>}
 */
export function parseRedirects(text) {
  const rules = new Map();
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [from, to, statusRaw] = trimmed.split(/\s+/);
    if (!from || !to || from.includes('*') || from.includes(':')) continue;
    const status = parseInt(statusRaw ?? '302', 10);
    rules.set(from, { to, status: Number.isNaN(status) ? 302 : status });
  }
  return rules;
}

/**
 * Redirect response for a request pathname, or null when no rule matches.
 * @param {Map<string, { to: string, status: number }>} rules
 * @param {URL} url
 * @returns {Response | null}
 */
export function matchRedirect(rules, url) {
  const rule = rules.get(url.pathname);
  if (!rule) return null;
  const location = new URL(rule.to + url.search, url.origin);
  return new Response(null, {
    status: rule.status,
    headers: { Location: location.href },
  });
}
