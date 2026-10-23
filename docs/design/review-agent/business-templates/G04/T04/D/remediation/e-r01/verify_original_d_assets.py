#!/usr/bin/env python3
"""G04-T04 D r01: audit original ZIP integrity without disclosing Gold decisions.

Usage:
  python verify_original_d_assets.py --asset-dir /mnt/data \
    --manifest d_r01_public_manifest.json

REFERENCE_ARCHIVE_INTEGRITY_ONLY, not product accuracy or C/D acceptance.
"""
from __future__ import annotations
import argparse, hashlib, json, sys, zipfile
from pathlib import Path


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--asset-dir', type=Path, required=True)
    parser.add_argument('--manifest', type=Path, default=Path(__file__).with_name('d_r01_public_manifest.json'))
    a = parser.parse_args()
    m = json.loads(a.manifest.read_text(encoding='utf-8'))
    expected = m['original_assets']
    for name, spec in sorted(expected.items()):
        p = a.asset_dir/name
        if not p.is_file():
            print(f'BLOCKED_MISSING_ARCHIVE {name}')
            return 2
        digest = sha256_bytes(p.read_bytes())
        if digest != spec['sha256']:
            print(f'FAIL_ARCHIVE_SHA {name}')
            return 1
        with zipfile.ZipFile(p) as z:
            if z.testzip() is not None:
                print(f'FAIL_ZIP_CRC {name}')
                return 1
        print(f'PASS_ORIGINAL_ARCHIVE_SHA_AND_CRC {name}')

    with zipfile.ZipFile(a.asset_dir/'G04-T04_INPUT_ONLY.zip') as inputs, \
         zipfile.ZipFile(a.asset_dir/'G04-T04_EVALUATION_ONLY.zip') as evaluation:
        f = json.loads(evaluation.read('frozen_manifest.json'))
        checks = [
            ('INPUT', inputs, f['input_sha256'], lambda name: name),
            ('GOLD', evaluation, f['gold_sha256'], lambda name: 'gold/'+name),
            ('TRUSTED', evaluation, f['trusted_fixture_sha256'], lambda name: 'trusted_fixtures/'+name),
        ]
        for kind, archive, mapping, arcname in checks:
            ok = 0
            for label, sha in mapping.items():
                if sha256_bytes(archive.read(arcname(label))) != sha:
                    print(f'FAIL_INTERNAL_SHA_{kind}')  # No case ID or Gold content revealed.
                    return 1
                ok += 1
            print(f'PASS_INTERNAL_SHA_{kind} count={ok}')
        if len(set(inputs.namelist()) & set(evaluation.namelist())) != 0:
            print('FAIL_MEMBER_PATH_OVERLAP')
            return 1
        print(f'PASS_INPUT_EVALUATION_MEMBER_PATH_ISOLATION input_count={len(inputs.namelist())} evaluation_count={len(evaluation.namelist())}')
        if f['input_zip_sha256'] != expected['G04-T04_INPUT_ONLY.zip']['sha256']:
            print('FAIL_FROZEN_MANIFEST_INPUT_ZIP_SHA')
            return 1
    print('REFERENCE_ARCHIVE_INTEGRITY_ONLY_PASS; ACL_AND_AUTHOR_INDEPENDENCE_NOT_TESTED')
    return 0


if __name__ == '__main__':
    sys.exit(main())