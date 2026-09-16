# AEO visibility tracker

Daily check of whether AI answer engines retrieve, cite, or mention eagleridge.io for buyer prompts. Results land in PostHog as `ai_search_visibility` events.

- **Runs on:** Cloudflare Worker `aeo-tracker` in the Eagle Ridge account, cron `0 13 * * *` (09:00 US Eastern). Private code, secrets in Worker bindings.
- **Deploy:** from this directory, `npx wrangler deploy` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment (same token as the site).
- **Secrets:** pipe from 1Password so the value never touches a command line or transcript:
  `op read 'op://Developer Vault/<item>/credential' | npx wrangler secret put ANTHROPIC_API_KEY`
- **Self-check:** `deno test --allow-env --allow-net tools/aeo-tracker/`
- **Run once by hand:** `npx wrangler dev --test-scheduled` then `curl 'http://localhost:8787/__scheduled?cron=0+13+*+*+*'`

## Secrets and vars on the Worker

| Key | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Claude Sonnet 5 with web search, the working engine |
| `OPENAI_API_KEY` | no | Adds a `chatgpt` engine via the Responses API web search tool |
| `POSTHOG_HOST` | no | Defaults to `https://us.i.posthog.com` |
| `POSTHOG_API_KEY` | no | Defaults to the site's public `phc_` project token |

## Event shape

One event per (engine, prompt) per run. Properties: `engine`, `query`, `circle` (battleground / differentiation / vulnerability / table_stakes), `run_id`, `retrieved`, `cited`, `mentioned`, `retrieved_domains`, `raw_response`, and `error` when a call failed (the three booleans are `null` in that case so gaps stay visible).

## Reading it

Build one PostHog trend on `ai_search_visibility`, broken down by `circle`, with the formula `count(cited = true) / count(error is not set)` over a 7-day rolling window. One day's sample is a coin flip per prompt; the rolling rate is the signal. Expect `retrieved` to move first (indexing and content), `cited` second, and `mentioned` last (training data and third-party coverage).

## Changing the prompts

Edit `QUERIES` in `main.ts`. Every prompt must be grounded in something real: a discovery-call question, a self-reported prompt from the contact form's "What did you ask it?" field, a Reddit thread, or Google's People Also Ask. Prompts chosen by whoever runs the tracker decide the score, so do not add prompts only because they flatter the number.
