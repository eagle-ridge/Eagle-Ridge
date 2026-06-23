#!/usr/bin/env python3
"""Deterministic on-page SEO/AEO eval for the built Eagle Ridge site.

Scores the factors WITHIN OUR CONTROL (titles, meta, one-H1, canonical,
indexability, JSON-LD / FAQPage schema, content depth, internal links,
llms.txt + .md-mirror coverage). It does NOT measure rankings or AI
citations — those are lagging indicators that need the pages crawled.

Usage:
  collect:  python seo_aeo_eval.py collect <dist_dir> <llms.txt> <out.json>
  compare:  python seo_aeo_eval.py compare <before.json> <after.json>
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from bs4 import BeautifulSoup

TARGET_KW = "cmmc compliance consultant"


def page_metrics(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    title = (soup.find("title").get_text(strip=True) if soup.find("title") else "")
    desc_tag = soup.find("meta", attrs={"name": "description"})
    desc = desc_tag.get("content", "") if desc_tag else ""
    robots = soup.find("meta", attrs={"name": "robots"})
    noindex = bool(robots and "noindex" in robots.get("content", "").lower())
    h1s = soup.find_all("h1")
    h1 = h1s[0].get_text(strip=True) if h1s else ""

    ld_types: list[str] = []
    for s in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(s.string or "")
        except Exception:
            ld_types.append("INVALID")
            continue
        t = data.get("@type")
        ld_types.append(t if isinstance(t, str) else str(t))

    main = soup.find("main") or soup.body or soup
    for tag in main(["script", "style"]):
        tag.decompose()
    words = len(main.get_text(" ", strip=True).split())
    internal_links = len(
        [a for a in main.find_all("a", href=True) if a["href"].startswith("/")]
    )

    return {
        "title": title,
        "title_len": len(title),
        "desc_len": len(desc),
        "h1_count": len(h1s),
        "h1": h1,
        "canonical": bool(soup.find("link", rel="canonical")),
        "noindex": noindex,
        "ld_types": ld_types,
        "has_faq_schema": "FAQPage" in ld_types,
        "words": words,
        "internal_links": internal_links,
        "targets_kw": TARGET_KW in (title + " " + h1).lower(),
    }


def collect(dist: pathlib.Path, llms: pathlib.Path) -> dict:
    pages = {}
    for f in sorted(dist.glob("*.html")):
        pages[f.stem] = page_metrics(f.read_text(encoding="utf-8"))
    llms_txt = llms.read_text(encoding="utf-8") if llms.exists() else ""
    # llms.txt references a page if its stem appears as a .md/.html/clean URL.
    llms_pages = sorted(
        stem
        for stem in pages
        if re.search(rf"/{re.escape(stem)}(\.md|\.html|[)\s])", llms_txt)
        or stem == "index"
        and "/index.md" in llms_txt
    )
    md_mirrors = sorted(p.stem for p in dist.glob("*.md"))
    indexable = [s for s, m in pages.items() if not m["noindex"]]
    return {
        "pages": pages,
        "site": {
            "total_pages": len(pages),
            "indexable_pages": len(indexable),
            "pages_with_faq_schema": sorted(
                s for s, m in pages.items() if m["has_faq_schema"]
            ),
            "pages_targeting_kw": sorted(
                s for s, m in pages.items() if m["targets_kw"]
            ),
            "total_ld_blocks": sum(len(m["ld_types"]) for m in pages.values()),
            "llms_referenced": llms_pages,
            "md_mirrors": md_mirrors,
        },
    }


def _fmt(v) -> str:
    return ", ".join(v) if isinstance(v, list) else str(v)


def compare(before: dict, after: dict) -> None:
    bs, as_ = before["site"], after["site"]
    print("\n=== SITE-LEVEL SEO/AEO ===\n")
    rows = [
        ("Indexable pages", bs["indexable_pages"], as_["indexable_pages"]),
        ("Pages targeting 'cmmc compliance consultant'",
         len(bs["pages_targeting_kw"]), len(as_["pages_targeting_kw"])),
        ("Pages with FAQPage schema",
         len(bs["pages_with_faq_schema"]), len(as_["pages_with_faq_schema"])),
        ("Total JSON-LD blocks", bs["total_ld_blocks"], as_["total_ld_blocks"]),
        ("Pages in llms.txt", len(bs["llms_referenced"]), len(as_["llms_referenced"])),
        (".md mirrors", len(bs["md_mirrors"]), len(as_["md_mirrors"])),
    ]
    print(f"{'metric':<48}{'before':>8}{'after':>8}{'Δ':>6}")
    for name, b, a in rows:
        d = a - b
        print(f"{name:<48}{b:>8}{a:>8}{('+'+str(d)) if d>0 else str(d):>6}")

    new = sorted(set(after['pages']) - set(before['pages']))
    print(f"\nNew pages: {', '.join(new) or '(none)'}")

    print("\n=== KEY PAGES (after) ===\n")
    print(f"{'page':<34}{'title_len':>9}{'desc':>6}{'h1':>4}{'words':>7}{'links':>7}  schema")
    for stem in ["index", "cmmc-compliance-consultant", "cmmc-readiness-checklist"]:
        m = after["pages"].get(stem)
        if not m:
            continue
        print(f"{stem:<34}{m['title_len']:>9}{m['desc_len']:>6}"
              f"{m['h1_count']:>4}{m['words']:>7}{m['internal_links']:>7}  "
              f"{','.join(m['ld_types']) or '-'}")

    # On-page best-practice flags for the money pages.
    print("\n=== ON-PAGE CHECKS (after) ===\n")
    for stem in ["cmmc-compliance-consultant", "cmmc-readiness-checklist", "index"]:
        m = after["pages"].get(stem)
        if not m:
            continue
        flags = []
        flags.append(("title ≤60", m["title_len"] <= 60))
        flags.append(("desc 120-160", 120 <= m["desc_len"] <= 160))
        flags.append(("exactly 1 H1", m["h1_count"] == 1))
        flags.append(("canonical", m["canonical"]))
        flags.append(("indexable", not m["noindex"]))
        flags.append(("depth ≥300w", m["words"] >= 300))
        print(stem)
        print("  " + "  ".join(f"{'✓' if ok else '✗'} {n}" for n, ok in flags))


def main() -> None:
    mode = sys.argv[1]
    if mode == "collect":
        dist, llms, out = (pathlib.Path(p) for p in sys.argv[2:5])
        data = collect(dist, llms)
        out.write_text(json.dumps(data, indent=2), encoding="utf-8")
        print(f"wrote {out} ({data['site']['total_pages']} pages)")
    elif mode == "compare":
        before = json.loads(pathlib.Path(sys.argv[2]).read_text())
        after = json.loads(pathlib.Path(sys.argv[3]).read_text())
        compare(before, after)


if __name__ == "__main__":
    main()
