#!/usr/bin/env python3
"""Generate Markdown mirrors, sitemap.xml, and sitemap.md from the built site.

Adapted from the original repo-root scripts/generate-md-mirrors.py (the
parity oracle's generator — extraction logic is kept byte-compatible).
Changes from the original:
  - reads built pages from dist/ and writes outputs into dist/
  - PAGES uses clean public URLs (Cloudflare Pages serves dist/about.html
    at /about)
  - elements marked data-md-exclude are stripped (the market-map grid is
    pre-rendered at build time; the old page rendered it client-side, so it
    never appeared in mirrors)
  - missing pages are skipped with a warning so partial builds work; the CI
    parity job catches incompleteness

Runs as part of `npm run build`. Dependencies pinned in requirements.txt
(versions must match the ones that produced parity-baseline/).
"""

from __future__ import annotations

import datetime as dt
import pathlib

from bs4 import BeautifulSoup
from markdownify import markdownify

DIST = pathlib.Path(__file__).resolve().parent.parent / "dist"
BASE_URL = "https://eagleridge.io"
# Fallback when a page has no <title>. For fixed PAGES this is harmless, but a
# discovered article should never legitimately be just the site name — see the
# hard check in discover_insights().
DEFAULT_TITLE = "Eagle Ridge Advisory"

# (dist html filename, public path, sitemap label). Order = sitemap order.
PAGES = [
    ("index.html", "/", "Homepage"),
    ("about.html", "/about", "About"),
    ("insights.html", "/insights", "Insights"),
    ("market-map.html", "/market-map", "Market Map"),
    (
        "nobody-built-the-first-mile.html",
        "/nobody-built-the-first-mile",
        "Nobody Built the First Mile",
    ),
    (
        "compliance-should-just-work.html",
        "/compliance-should-just-work",
        "Compliance should just work",
    ),
    ("glossary.html", "/glossary", "Glossary"),
    ("privacy.html", "/privacy", "Privacy Policy"),
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


def write_sitemap_xml(built: list[tuple[str, str, str]], lastmod: str) -> None:
    rows = []
    for _, public_path, _ in built:
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
    (DIST / "sitemap.xml").write_text(xml, encoding="utf-8")
    print("  wrote sitemap.xml")


def write_sitemap_md(built: list[tuple[str, str, str]]) -> None:
    lines = [
        "# Eagle Ridge Advisory — Sitemap",
        "",
        "Markdown sitemap for agents and readers. Each page also has a `.md` mirror.",
        "",
    ]
    for _, public_path, label in built:
        url = BASE_URL + public_path
        mirror = BASE_URL + "/" + md_name(public_path)
        lines.append(f"- [{label}]({url}) — Markdown: [{md_name(public_path)}]({mirror})")
    (DIST / "sitemap.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("  wrote sitemap.md")


def discover_insights() -> list[tuple[str, str, str]]:
    """Discover built Insights article pages under dist/insights/*.html.

    Each article gets a .md mirror + sitemap row automatically — no edits to
    PAGES per post. Labelled by the page <title> (set by BaseLayout). The
    /insights index itself is a fixed entry in PAGES.
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
    lastmod = dt.date.today().isoformat()
    print("Generating Markdown mirrors:")
    pages = PAGES + discover_insights()
    built = [page for page in pages if write_mirror(page[0], page[1])]
    print("Generating sitemaps:")
    write_sitemap_xml(built, lastmod)
    write_sitemap_md(built)
    print("Done.")


if __name__ == "__main__":
    main()
