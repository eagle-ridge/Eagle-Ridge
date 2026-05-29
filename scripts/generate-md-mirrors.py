#!/usr/bin/env python3
"""Generate Markdown mirrors, sitemap.xml, and sitemap.md from the site's HTML.

These outputs are derived from the HTML pages, so they are generated rather
than hand-maintained (avoids drift). Re-run after editing any page:

    uv run --with markdownify --with beautifulsoup4 python scripts/generate-md-mirrors.py

Outputs (committed, served by GitHub Pages):
  - <stem>.md         one Markdown mirror per public page
  - sitemap.xml       XML sitemap for crawlers
  - sitemap.md        human/agent-readable sitemap
"""
from __future__ import annotations

import datetime as dt
import pathlib

from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE_URL = "https://eagleridge.io"

# (html filename, public path, sitemap label). Order = sitemap order.
# discovery.html is intentionally excluded (unlisted / noindex).
PAGES = [
    ("index.html", "/", "Homepage"),
    ("about.html", "/about.html", "About"),
    ("market-map.html", "/market-map.html", "Market Map"),
    ("nobody-built-the-first-mile.html", "/nobody-built-the-first-mile.html", "Nobody Built the First Mile"),
    ("glossary.html", "/glossary.html", "Glossary"),
    ("privacy.html", "/privacy.html", "Privacy Policy"),
]


def md_path(html_name: str) -> str:
    """Markdown mirror filename for an HTML page."""
    return html_name[:-len(".html")] + ".md"


def extract(html: str) -> tuple[str, str]:
    """Return (title, markdown) from a page's HTML, stripping chrome/scripts."""
    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else "Eagle Ridge Advisory"

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


def write_mirror(html_name: str, public_path: str) -> None:
    html = (ROOT / html_name).read_text(encoding="utf-8")
    title, body = extract(html)
    url = BASE_URL + public_path
    out = f"<!-- Markdown mirror of {url} -->\n\n# {title}\n\n{body}\n"
    (ROOT / md_path(html_name)).write_text(out, encoding="utf-8")
    print(f"  wrote {md_path(html_name)}")


def write_sitemap_xml(lastmod: str) -> None:
    rows = []
    for html_name, public_path, _ in PAGES:
        priority = "1.0" if public_path == "/" else "0.7"
        rows.append(
            "  <url>\n"
            f"    <loc>{BASE_URL}{public_path}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            f"    <priority>{priority}</priority>\n"
            "  </url>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(rows)
        + "\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")
    print("  wrote sitemap.xml")


def write_sitemap_md() -> None:
    lines = [
        "# Eagle Ridge Advisory — Sitemap",
        "",
        "Markdown sitemap for agents and readers. Each page also has a `.md` mirror.",
        "",
    ]
    for html_name, public_path, label in PAGES:
        url = BASE_URL + public_path
        mirror = BASE_URL + "/" + md_path(html_name)
        lines.append(f"- [{label}]({url}) — Markdown: [{md_path(html_name)}]({mirror})")
    (ROOT / "sitemap.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("  wrote sitemap.md")


def main() -> None:
    lastmod = dt.date.today().isoformat()
    print("Generating Markdown mirrors:")
    for html_name, public_path, _ in PAGES:
        write_mirror(html_name, public_path)
    print("Generating sitemaps:")
    write_sitemap_xml(lastmod)
    write_sitemap_md()
    print("Done.")


if __name__ == "__main__":
    main()
