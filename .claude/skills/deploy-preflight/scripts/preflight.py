#!/usr/bin/env python3
"""preflight.py — the mechanical half of deploy-preflight. Run from repo root:

    python3 .claude/skills/deploy-preflight/scripts/preflight.py [--outbound]

Does: clean --minify build, don't-ship staging check, internal link existence
scan over public/, and (with --outbound) HEAD checks on data/links.yaml URLs.
Does NOT: deploy, rsync, commit, push. Judgment steps (canon gate, asset
ratios) stay manual — see references/checklist.md.
"""

import argparse
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

DONT_SHIP = ["public/", "resources/_gen/", ".hugo_build.lock", ".env"]
failures = []


def section(name, ok, detail=""):
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" — {detail}" if detail else ""))
    if not ok:
        failures.append(name)


def clean_build():
    shutil.rmtree("public", ignore_errors=True)
    r = subprocess.run(["hugo", "--minify", "--cleanDestinationDir"],
                       capture_output=True, text=True)
    errors = [l for l in (r.stdout + r.stderr).splitlines() if "ERROR" in l]
    section("clean build", r.returncode == 0 and not errors,
            errors[0] if errors else f"exit {r.returncode}")


def staged_dont_ship():
    r = subprocess.run(["git", "diff", "--cached", "--name-only"],
                       capture_output=True, text=True)
    bad = [f for f in r.stdout.splitlines()
           if any(f == d.rstrip("/") or f.startswith(d) for d in DONT_SHIP)]
    section("don't-ship list unstaged", not bad, ", ".join(bad))


def internal_links():
    pub = Path("public")
    if not pub.is_dir():
        section("internal links", False, "no public/ (build failed?)")
        return
    hrefs = set()
    for html in pub.rglob("*.html"):
        # --minify strips attribute quotes: match href=/x, href="/x", href='/x'
        for m in re.finditer(r'''(?:href|src)=["']?(/[^"'\s>#?]+)''',
                             html.read_text(errors="ignore")):
            hrefs.add(m.group(1))
    missing = []
    for h in sorted(hrefs):
        p = pub / h.lstrip("/")
        if not (p.exists() or (p / "index.html").exists()
                or p.with_suffix(p.suffix or ".html").exists()):
            missing.append(h)
    section("internal links resolve", not missing,
            f"{len(missing)} missing: " + ", ".join(missing[:8]) if missing
            else f"{len(hrefs)} checked")


def outbound_links():
    import yaml
    urls = [e["url"] for e in yaml.safe_load(open("data/links.yaml"))
            if e.get("url", "").startswith("http")]
    dead = []
    for u in urls:
        try:
            req = urllib.request.Request(u, method="HEAD",
                                         headers={"User-Agent": "Mozilla/5.0 (preflight)"})
            urllib.request.urlopen(req, timeout=10)
        except Exception as e:
            dead.append(f"{u} ({getattr(e, 'code', e)})")
    section("outbound links answer", not dead, "; ".join(dead))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outbound", action="store_true",
                    help="also HEAD-check data/links.yaml URLs")
    args = ap.parse_args()

    if not Path("hugo.toml").exists():
        sys.exit("run from the repo root (hugo.toml not found)")

    clean_build()
    staged_dont_ship()
    internal_links()
    if args.outbound:
        outbound_links()

    print()
    if failures:
        print(f"PREFLIGHT: FAIL ({', '.join(failures)}) — fix before Eric deploys")
        sys.exit(1)
    print("PREFLIGHT: PASS (mechanical checks) — canon gate + asset ratios are manual; then hand to Eric")


if __name__ == "__main__":
    main()
