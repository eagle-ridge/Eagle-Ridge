<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of eagleridge.io. PostHog was already initialized in `BaseLayout.astro` with the JS snippet; the integration updates the token and host to reference environment variables rather than hardcoded values, and adds targeted event captures across six files covering the full lead-generation funnel — from first arrival at a high-intent page through CTA clicks, contact form submissions, and discovery call bookings.

| Event name | Description | File |
|---|---|---|
| `contact_form_submitted` | Visitor submits the main contact form on the homepage. | `src/components/ContactForm.astro` |
| `contact_form_error` | Contact form submission fails (api_error or network_error). | `src/components/ContactForm.astro` |
| `discovery_intake_submitted` | Visitor submits the fallback intake form on /discovery without booking a call. | `src/pages/discovery.astro` |
| `grc_tools_searched` | Visitor types a query into the search box on the GRC tools index. | `src/pages/grc-tools.astro` |
| `grc_tools_filtered` | Visitor filters the GRC tools index by category using the legend. | `src/pages/grc-tools.astro` |
| `checklist_page_viewed` | Visitor views the CMMC readiness checklist — top of compliance intent funnel. | `src/pages/cmmc-readiness-checklist.astro` |
| `services_page_viewed` | Visitor views the CMMC compliance consultant services page. | `src/pages/cmmc-compliance-consultant.astro` |
| `insight_article_clicked` | Visitor clicks to read a specific article from the Insights hub. | `src/pages/insights.astro` |

Previously instrumented (left in place):
- `cta_click` (with `cta`, `location`, `path` properties) — BaseLayout global listener
- `discovery_page_viewed` — discovery.astro
- `discovery_call_booked` — Cal.com booking callback in discovery.astro

## Next steps

We've built a dashboard and five insights to track user behavior:

- **Dashboard:** [Analytics basics (wizard)](https://us.posthog.com/project/209232/dashboard/1825741)
- [Lead generation funnel (wizard)](https://us.posthog.com/project/209232/insights/CuBZ3w9B) — services page → CTA click → contact form submitted
- [CTA clicks by location (wizard)](https://us.posthog.com/project/209232/insights/OblBNkuN) — breakdown of all `data-cta` elements by CTA name
- [Discovery calls booked (wizard)](https://us.posthog.com/project/209232/insights/rQalW9qd) — weekly trend of booked calls, form submissions, and intake leads
- [High-intent page views (wizard)](https://us.posthog.com/project/209232/insights/QCamzm9M) — daily unique visitors to services, checklist, and discovery pages
- [Insights content engagement (wizard)](https://us.posthog.com/project/209232/insights/95DkZdSp) — article clicks broken down by article ID

## Verify before merging

- [ ] Run a full production build (`npm run build --prefix site`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `PUBLIC_POSTHOG_PROJECT_TOKEN` and `PUBLIC_POSTHOG_HOST` to `.env.example` (if one exists) and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify — Astro's build produces minified JS bundles.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-astro-static/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
