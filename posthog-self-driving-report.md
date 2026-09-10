# PostHog Self-driving setup report

**Inbox:** [PostHog Self-driving inbox](https://us.posthog.com/project/209232/inbox)  
**Date:** 2026-09-10

## Summary

PostHog Self-driving is configured for the project. Support was enabled; Session Replay and Error Tracking were already enabled. Health checks were added as a native signal source, while existing error-tracking, support, GitHub, Linear, and scout responders were preserved.

Fresh scout configurations and Replay Vision monitors will begin producing observations on their next coordinator/sweep cycles. Findings should begin appearing in the [Self-driving inbox](https://us.posthog.com/project/209232/inbox) within about 30 minutes.

## AI data processing

**Approved.** Organization-level AI data-processing approval was verified by the setup gate before this run.

## GitHub

**Already connected.** The pre-existing GitHub App connection was retained; no connection or repository change was needed.

## Products enabled

| Product | Status | Notes |
|---|---|---|
| Session Replay | Already enabled | Recent web recordings exist. Browser initialization has no session-recording disable override. |
| Error Tracking | Already enabled | Recent active web error issues exist. Browser initialization has no exception-capture disable override. |
| Support (Conversations) | Enabled | An inbound email, inbox-widget, or Slack channel is still required before tickets arrive. |

## Signal sources

| Source product | Source type | Action | Notes |
|---|---|---|---|
| `signals_scout` | `cross_source_issue` | Already enabled | Existing scout gate retained. |
| `health_checks` | `health_issue` | Enabled | Added so setup and instrumentation health issues reach the inbox. |
| `error_tracking` | `issue_created` | Already enabled | Existing responder retained. |
| `error_tracking` | `issue_reopened` | Already enabled | Existing responder retained. |
| `error_tracking` | `issue_spiking` | Already enabled | Existing responder retained. |
| `conversations` | `ticket` | Already enabled | Remains idle until an inbound Support channel is connected. |
| `github` | `issue` | Already enabled | Retained; no new external source was selected in this run. |
| `linear` | `issue` | Already enabled | Retained; no new external source was selected in this run. |
| `session_replay` | `session_analysis_cluster` | Skipped | Retired route; Replay Vision scanners own session-replay coverage. |
| `replay_vision` | scanner configuration | Enabled through scanners | No separate signal-source row is used. |

## Connected tools

No additional connected tools were selected. Existing GitHub and Linear responders were left on; no warehouse source was created or changed by this setup.

| Tool | This run |
|---|---|
| GitHub Issues | Not selected; existing responder retained |
| Linear | Not selected; existing responder retained |
| Jira | Not used |
| Sentry | Not used |
| Zendesk | Not used |

## Scout troop

The project has a verified limit of **100 runs/day**; **3** had been used and **97** remained at configuration time. The current platform banner states: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

### Active (9)

| Scout | Reason |
|---|---|
| `signals-scout-general` | Cross-product coverage and surfaces without a dedicated specialist. |
| `signals-scout-product-analytics` | Existing lead-generation flows and saved analytics deserve conversion monitoring. |
| `signals-scout-web-analytics` | Website traffic, attribution, landing-page, and 404 health are central surfaces. |
| `signals-scout-web-vitals` | Page-level LCP, INP, CLS, and FCP regressions. |
| `signals-scout-health-checks` | Prioritizes material PostHog health issues. |
| `signals-scout-observability-gaps` | Finds important tracked activity with insufficient insight or alert coverage. |
| `signals-scout-contact-form-health` | Pre-existing custom coverage for contact-form error-rate spikes. |
| `signals-scout-lead-volume` | New custom coverage for high-intent lead outcome volume drops with healthy traffic. |
| `signals-scout-discovery-handoff` | New custom coverage for the discovery handoff’s booking/inquiry conversion rate. |

### Disabled (21)

The remaining scouts are disabled to keep the troop selective and below the ten-scout ceiling. Surface-specific scouts can be enabled later if that product becomes actively used:

- `signals-scout-error-tracking` is covered by the native Error Tracking responder.
- `signals-scout-session-replay` is covered by the Replay Vision scanners below.
- AI observability, APM, CSP violations, customer analytics, data pipelines, data warehouse, experiments, feature flags, logs, revenue analytics, surveys, tasks, skills-store, and MCP-tool-calls scouts lack current evidence of active use.
- Anomaly detection, inbox validation, insight alerts, Replay Vision trend analysis, and conversations scouts are not selected because the focused active troop and direct source routes provide higher-value coverage today.

## Custom scouts

### Created: `signals-scout-lead-volume`

- **Watches:** Lead outcomes across high-intent pages.
- **Discriminator:** A material fall in completed lead actions against comparable complete-window baselines while high-intent page activity remains healthy.
- **Why it is distinct:** Web analytics detects traffic changes and product analytics detects derived-rate regression with steady entrants; this scout detects a critical outcome-volume cliff in the seam between them.

### Created: `signals-scout-discovery-handoff`

- **Watches:** The dedicated discovery-page journey through booking or fallback inquiry completion.
- **Discriminator:** Completion rate materially below comparable completed-window baselines while discovery-page visit volume remains steady and above its learned floor.
- **Why it is distinct:** It is a focused check on the business-critical discovery handoff, while explicitly deduplicating any report already owned by the broader product-analytics scout.

### Surfaces considered

| Surface | Decision |
|---|---|
| Contact-form failure rate | Already covered by the active `signals-scout-contact-form-health` custom scout. |
| Generic website traffic and conversion health | Covered by active web and product-analytics scouts. |
| Search/filter demand quality | Not ready for a custom scout: the available events do not show search results or an explicit failure state. |
| Error bursts and replay analysis | Covered by the native Error Tracking responder and Replay Vision scanner route. |

**Noise escape hatch:** Set `emit: false` on a custom scout’s configuration in PostHog to make it a dry-run scout that records reasoning but does not create inbox reports.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes high-confidence observations to the inbox. Replay Vision scanners are the only component in this setup that uses Replay Vision quota. Their findings arrive at half weight and therefore need corroboration before promotion into an inbox report.

| Brief | Scanner | Status | Query scope | Sampling rate | Estimate |
|---|---|---|---|---:|---|
| Breakage monitor | **Discovery booking experience** | Created | Recordings that include `/discovery`; this is the dedicated booking and fallback-inquiry completion flow. | 0.5 | 0 observations/month, 0 credits/month from the current seven-day sample. |
| Frustration monitor | **Lead journey frustration** | Created | Recordings containing `$rageclick` only; deliberately not URL-scoped so it remains separate from the breakage monitor. | 1.0 | 0 observations/month, 0 credits/month from the current seven-day sample. |

The organization had 2,500 Replay Vision credits remaining at configuration time and was not exhausted. A separate existing session-summary scanner was left untouched.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox widget, or Slack) in PostHog so enabled Conversations tickets can reach the inbox.
- [ ] Re-authenticate the MCP connection with the `property_definition:read` scope if you want future custom-scout validation to read the live event schema directly; this setup relied on the repo’s existing instrumentation report.
- [ ] Review the existing enabled GitHub and Linear warehouse connections if their issue data should be actively routed; neither was newly selected or modified during this run.

## What happens next

The scout coordinator picks up fresh configurations within about 30 minutes. Scout runs draw from the project’s daily budget, findings cluster into Self-driving inbox reports, and immediately actionable reports can initiate coding tasks.

## Files modified or created

- Updated `posthog-self-driving-report.md` with this configuration record.
- No application source, environment, or dependency files were changed.
