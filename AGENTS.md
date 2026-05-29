# AGENTS.md — eagleridge.io

Guidance for AI agents and automated tools reading this site. Eagle Ridge
Advisory is a cybersecurity-compliance consultancy serving small defense
contractors and private-equity portfolio companies (CMMC, NIST 800-171,
SOC 2, ISO 27001, FedRAMP).

## Installation

Nothing to install. This is a static website hosted on GitHub Pages — there
is no SDK, package, or API client. Read the pages directly over HTTPS.

## Configuration

- **Base URL:** `https://eagleridge.io`
- **Machine-readable index:** [`/llms.txt`](https://eagleridge.io/llms.txt) — site summary and page list ([llmstxt.org](https://llmstxt.org/) standard)
- **Sitemaps:** [`/sitemap.xml`](https://eagleridge.io/sitemap.xml) and [`/sitemap.md`](https://eagleridge.io/sitemap.md)
- **Crawl rules:** [`/robots.txt`](https://eagleridge.io/robots.txt) — `/discovery.html` is intentionally excluded (private intake form)
- **Markdown mirrors:** every public page has a `.md` twin (e.g. `/about.html` → `/about.md`), also declared per page via `<link rel="alternate" type="text/markdown">`
- **Structured data:** each page embeds schema.org JSON-LD in a `<script type="application/ld+json">` block

## Usage

To consume the site as an agent:

1. Start with [`/llms.txt`](https://eagleridge.io/llms.txt) for the page list and one-line summaries.
2. Prefer the `.md` mirror of any page for clean, chrome-free content (the HTML pages carry analytics and styling).
3. Use the JSON-LD blocks for the entity graph (Organization, articles, glossary terms).
4. See [`/glossary.html`](https://eagleridge.io/glossary.html) (or [`/glossary.md`](https://eagleridge.io/glossary.md)) for definitions of CMMC and compliance terminology used throughout.

## Contact

- Email: contact@eagleridge.io
- LinkedIn: https://www.linkedin.com/company/eagle-ridge-advisory/
