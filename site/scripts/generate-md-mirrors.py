#!/usr/bin/env python3
"""Generate Markdown mirrors for the prerendered pages of the built site.

Adapted from the original repo-root scripts/generate-md-mirrors.py (the
parity oracle's generator — extraction logic is kept byte-compatible).
Changes from the original:
  - reads built pages from dist/client/ and writes outputs into dist/client/
    (the Workers static-asset directory; server output moved prerendered
    HTML from dist/ to dist/client/)
  - sitemap.xml / sitemap.md are no longer written here: CMS-served Insights
    articles only exist at request time, so src/pages/sitemap.{xml,md}.ts
    build them from the same PAGES list (src/data/sitemap-pages.json) plus
    EmDash. Likewise CMS articles get their .md mirror from
    src/pages/insights/[slug].md.ts, not from this script.
  - PAGES uses clean public URLs (the Workers asset layer serves
    dist/client/about.html at /about)
  - elements marked data-md-exclude are stripped (the market-map grid is
    pre-rendered at build time; the old page rendered it client-side, so it
    never appeared in mirrors)
  - missing pages are skipped with a warning so partial builds work; the CI
    parity job catches incompleteness

Runs as part of `npm run build`. Dependencies pinned in requirements.txt
(versions must match the ones that produced parity-baseline/).
"""

from __future__ import annotations

import json
import pathlib

from bs4 import BeautifulSoup
from markdownify import markdownify

DIST = pathlib.Path(__file__).resolve().parent.parent / "dist" / "client"
BASE_URL = "https://eagleridge.io"
# Fallback when a page has no <title>. For fixed PAGES this is harmless, but a
# discovered article should never legitimately be just the site name — see the
# hard check in discover_insights().
DEFAULT_TITLE = "Eagle Ridge Advisory"

# (dist html filename, public path, sitemap label) for every prerendered page.
# Shared with src/lib/sitemap.ts (the runtime sitemap routes) via one JSON file
# so the two can't drift.
_PAGES_JSON = pathlib.Path(__file__).resolve().parent.parent / "src" / "data" / "sitemap-pages.json"
PAGES = [
    (p["html"], p["path"], p["label"])
    for p in json.loads(_PAGES_JSON.read_text(encoding="utf-8"))
]


def md_name(public_path: str) -> str:
    """Markdown mirror filename for a public path."""
    return "index.md" if public_path == "/" else public_path.lstrip("/") + ".md"


def extract(html: str) -> tuple[str, str]:
    """Return (title, markdown) from a page's HTML, stripping chrome/scripts."""
    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else DEFAULT_TITLE

    for tag in soup.select("[data-md-exclude]"):
        tag.decompose()
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    for tag in soup.find_all(["header", "footer", "nav"]):
        tag.decompose()

    content = soup.find("main") or soup.body or soup
    markdown = markdownify(str(content), heading_style="ATX")

    # Collapse runs of blank lines.
    lines = [ln.rstrip() for ln in markdown.splitlines()]
    cleaned: list[str] = []
    blank = False
    for ln in lines:
        if ln == "":
            if not blank:
                cleaned.append("")
            blank = True
        else:
            cleaned.append(ln)
            blank = False
    return title, "\n".join(cleaned).strip()


def write_mirror(html_name: str, public_path: str) -> bool:
    src = DIST / html_name
    if not src.exists():
        # Fail-soft so partial builds work. The CI parity job is the hard
        # gate: it errors if any parity-baseline/*.md lacks a built mirror.
        # If you add a page to PAGES, add its baseline file too.
        print(f"  WARNING: {html_name} not built yet — skipping mirror")
        return False
    html = src.read_text(encoding="utf-8")
    title, body = extract(html)
    url = BASE_URL + public_path
    out = f"<!-- Markdown mirror of {url} -->\n\n# {title}\n\n{body}\n"
    dest = DIST / md_name(public_path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out, encoding="utf-8")
    print(f"  wrote {md_name(public_path)}")
    return True


def discover_insights() -> list[tuple[str, str, str]]:
    """Discover prerendered Insights essays under dist/insights/*.html.

    Only standalone .astro essays land here (CMS-served articles are not built
    files). Each gets a .md mirror automatically — no edits to PAGES per essay.
    Labelled by the page <title> (set by BaseLayout).
    """
    insights_dir = DIST / "insights"
    if not insights_dir.is_dir():
        print("  no dist/insights/ — 0 articles discovered")
        return []
    discovered = []
    for html_file in sorted(insights_dir.glob("*.html")):
        slug = html_file.stem
        title, _ = extract(html_file.read_text(encoding="utf-8"))
        # Discovered articles have no parity baseline backstopping them, so a
        # blank or fallback title would ship a garbage mirror + sitemap label
        # with a green CI. Fail loud instead.
        if not title.strip() or title == DEFAULT_TITLE:
            raise SystemExit(
                f"ERROR: dist/insights/{html_file.name} has no usable <title> "
                f"(got {title!r}) — cannot generate a mirror for it"
            )
        discovered.append((f"insights/{html_file.name}", f"/insights/{slug}", title))
    print(f"  discovered {len(discovered)} insights article(s)")
    return discovered


def main() -> None:
    print("Generating Markdown mirrors:")
    pages = PAGES + discover_insights()
    built = [page for page in pages if write_mirror(page[0], page[1])]
    print(f"Done: {len(built)} mirror(s). Sitemaps are served at request time (src/lib/sitemap.ts).")


if __name__ == "__main__":
    main()
