#!/usr/bin/env python3
"""Restricted-admin Gold lineage comparator. No Gold contents or case names in output.

Usage: python replay_gold_lineage.py restricted_input.json > restricted_result.json
The JSON input itself contains local private paths; do not commit it.
"""
import hashlib
import json
import sys
import zipfile
from pathlib import Path

MAX_UNCOMPRESSED = 512 * 1024 * 1024


def digest_file(path):
    h = hashlib.sha256()
    with path.open('rb') as src:
        for chunk in iter(lambda: src.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def inspect(row):
    src = Path(row['zip_path'])
    if not src.is_file():
        raise ValueError('snapshot file missing or inaccessible')
    total = 0
    gold_members = {}
    all_count = 0
    with zipfile.ZipFile(src) as archive:
        entries = archive.infolist()
        if any(e.flag_bits & 0x1 for e in entries):
            raise ValueError('encrypted archive unsupported')
        if sum(e.file_size for e in entries) > MAX_UNCOMPRESSED:
            raise ValueError('archive uncompressed size exceeds safe cap')
        if len({e.filename for e in entries}) != len(entries):
            raise ValueError('duplicate ZIP member names')
        for entry in entries:
            if entry.is_dir():
                continue
            all_count += 1
            path = entry.filename.replace('\\', '/')
            if not (path.startswith('gold/') or '/gold/' in path):
                continue
            h = hashlib.sha256()
            with archive.open(entry) as f:
                while True:
                    chunk = f.read(1024 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > MAX_UNCOMPRESSED:
                        raise ValueError('Gold bytes exceed safe cap')
                    h.update(chunk)
            gold_members[path] = h.hexdigest()
    label = row['label']  # supplied by admin; must separately confirm against private manifest
    return {
        'snapshot': row['snapshot'], 'label': label,
        'archive_sha256': digest_file(src),
        'zip_member_count': all_count,
        'gold_member_count': len(gold_members),
        '_gold_hashes': gold_members,
    }


def compare(before, after):
    aa, bb = before['_gold_hashes'], after['_gold_hashes']
    union = set(aa) | set(bb)
    changed = sum(aa.get(k) != bb.get(k) for k in union)
    return {
        'from': before['snapshot'], 'to': after['snapshot'],
        'same_label': before['label'] == after['label'],
        'zip_bytes_changed': before['archive_sha256'] != after['archive_sha256'],
        'gold_member_count_delta': len(bb) - len(aa),
        'gold_members_changed': changed,
        'same_label_gold_drift': before['label'] == after['label'] and changed > 0,
        'affected_case_count': 'UNDETERMINED_REQUIRES_PRIVATE_SEMANTIC_MAPPING',
    }


def main():
    if len(sys.argv) != 2:
        print('Usage: replay_gold_lineage.py restricted_input.json', file=sys.stderr)
        return 2
    spec = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    items = spec.get('snapshots', [])
    if not items or any(not all(k in row for k in ('template', 'snapshot', 'label', 'zip_path')) for row in items):
        raise ValueError('invalid restricted snapshot manifest')
    grouped = {}
    for row in items:
        grouped.setdefault(row['template'], []).append(inspect(row))
    output = {'schema': 'G04-gold-lineage-restricted-v1',
              'e2_gold_semantic_validity': 'NOT_EVALUATED', 'templates': {}}
    for template, versions in grouped.items():
        output['templates'][template] = {
            'snapshots': [{k: v for k, v in x.items() if not k.startswith('_')} for x in versions],
            'comparisons': [compare(a, b) for a, b in zip(versions, versions[1:])]
        }
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError, zipfile.BadZipFile, json.JSONDecodeError) as exc:
        # Never echo arbitrary paths, internal exception text, or Gold data.
        print(f'RESTRICTED_CHECK_FAILED: {type(exc).__name__}', file=sys.stderr)
        sys.exit(1)
