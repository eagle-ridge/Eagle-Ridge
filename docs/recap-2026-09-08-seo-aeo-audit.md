# Session Recap: SEO/AEO audit — eagleridge.io has no search traffic

**Date:** 2026-09-08
**Project:** Eagle-Ridge (eagleridge.io)
**PRs Merged:** none (this recap only)

## What Was Built

- `~/scripts/gsc-queries.py` — uv script that reads Google Search Console for `sc-domain:eagleridge.io` (top queries, sitemap status, URL inspection). Reuses the caldris-workspace-mcp OAuth client; token cached with the `webmasters` scope. Search Console API enabled in GCP project 650001175816.
- Sitemap resubmitted via API (previous Google fetch: 2026-07-05).
- Origami list **APEX CMMC Advisors** (10 rows, 5 usable, 318 more in pool) as the seed for backlink outreach. Publishers/podcast search failed silently (see PAPERCUTS).
- GH issues #110–#113 for the follow-ups.

## Findings

| Signal | Value |
|---|---|
| Search Console clicks, Oct 2025–Sep 2026 | 0 |
| Impressions, same window | 1 ("eagleridge psc", position 44) |
| Sitemap URLs submitted / indexed | 15 / 0 |
| Pages known to Google | homepage only |
| PostHog "Organic Search", 28d, all sites pooled | 52 visitors |

The PostHog organic-search number is `google.com/url` and Outlook safelink redirects, not search. The two tools disagree because one is referrer-based and the other click-based; Search Console is the truth here.

## Key Decisions

| Decision | Rationale |
|---|---|
| Open the site to AI crawlers (disable Cloudflare managed robots.txt) | Network-level AI bot blocking was already off; only the Content-Signals robots block remained. AEO citation traffic is a target channel. Human toggle — API writes blocked by the permission classifier (#112). |
| Backlink outreach via Origami, segments: CMMC publishers/podcasts + APEX Accelerators | Chris chose these over the GRC-vendor "you're listed" angle. Outreach spends credits and goes out under Chris's name, so each fetch-more and every campaign gets explicit approval. |
| Weekly Search Console monitor as a local launchd job, not a cloud routine | OAuth token lives on the Mac (#111). |

## Corrections Applied

- Chrome MCP tab session errors → fell back to `open` for Search Console and the Cloudflare dashboard; human clicks for "Request indexing" (no API exists for ordinary pages).
- First API enable landed in the wrong GCP project; corrected to the project that owns the OAuth client.

## What's Next

1. Chris: click **Request indexing** on the six open Search Console tabs; switch off **Managed robots.txt** in Cloudflare (#112).
2. Origami: fetch-more 40 on the APEX search with the "PTAC" alias removed; rerun publishers person-first at fast quality (bead chrismcconnell-1us2).
3. Draft the two outreach emails in operator voice for review before any campaign enrolls people.
4. #110 noindex on the workers.dev preview host; #111 weekly monitor; #113 PostHog host filter.
5. GH #76 (spoke pages) stays gated until hub pages index.
