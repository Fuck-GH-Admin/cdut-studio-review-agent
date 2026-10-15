#!/usr/bin/env python3
"""Fail closed on common hidden-Gold fields and private URLs in public candidate files.
Use on explicit candidate paths; historical git/PR exposures require separate review.
"""
import argparse
import json
from pathlib import Path
import re
import sys

FORBIDDEN_JSON_KEY = re.compile(
    r"(^|_)(status_counts|gold_counts|label_distribution|case_distribution|case_result_distribution|expected_?(label|answer|decision|outcome)|gold_?(answer|label|outcome)|presigned_url|trusted_mock)(_|$)|(^|_)(status|label|expected|gold|case_result|outcome|decision)(_[a-z0-9]+)*_(count|counts|distribution|histogram|frequency|breakdown|answers|labels)(_|$)|(^|_)(private|restricted|gold)(_[a-z0-9]+)*_(url|uri|path|link|token|key|location|locator|bucket)(_|$)", re.I)
SENSITIVE_TEXT = [
    ("SIGNED_URL", re.compile(r"(?:X-Amz-(?:Signature|Credential)|X-Goog-Signature|sig=)[^\s\"'<>]*", re.I)),
    ("JWT_LIKE", re.compile(r"\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{12,}\b")),
    ("PRIVATE_STORE_URL", re.compile(r"\b(?:s3|gs|r2)://[^\s\"'<>]+", re.I)),
]

def walk_keys(value, breadcrumb="$"):
    if isinstance(value, dict):
        for key, item in value.items():
            if FORBIDDEN_JSON_KEY.search(key):
                yield f"forbidden JSON key at {breadcrumb}: {key}"
            yield from walk_keys(item, breadcrumb + ".<key>")
    elif isinstance(value, list):
        for item in value:
            yield from walk_keys(item, breadcrumb + "[]")

def scan(path):
    findings = []
    raw = path.read_text(encoding="utf-8")
    for kind, pattern in SENSITIVE_TEXT:
        if pattern.search(raw):
            findings.append(kind)
    if path.suffix.lower() == ".json":
        try:
            parsed = json.loads(raw)
        except ValueError:
            findings.append("INVALID_JSON")
        else:
            findings.extend(walk_keys(parsed))
    # Only codes / key names, never echo secret content or matched URLs.
    return findings

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+", type=Path, help="explicit public candidate paths, no secrets")
    args = parser.parse_args()
    found = 0
    for path in args.paths:
        if not path.is_file():
            print(f"ERROR not a regular file: {path.name}", file=sys.stderr)
            return 2
        items = scan(path)
        if items:
            found += len(items)
            print(f"FAIL {path.name}: " + "; ".join(items))
        else:
            print(f"PASS {path.name}")
    return 1 if found else 0

if __name__ == "__main__":
    sys.exit(main())
