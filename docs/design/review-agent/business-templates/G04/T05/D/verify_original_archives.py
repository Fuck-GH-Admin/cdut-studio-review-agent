#!/usr/bin/env python3
"""Public-safe SHA-256 and ZIP structure verifier for the original G04-T05 D assets.
Does NOT print/read per-case Gold content, trusted fixture values or expected states.
Usage: python verify_original_archives.py /path/to/original/files
"""
from pathlib import Path
import hashlib,sys,zipfile
p=Path(sys.argv[1] if len(sys.argv)>1 else ".")
expected={
"G04-T05_INPUT_ONLY.zip":("cb778721698bee8106bcced4a59b163f5afcf8564999eadb7c3468e11085033b",144),
"G04-T05_EVALUATION_ONLY.zip":("3439b51dde96863cfe854432d62ded6db1c41fb6d4e5b622b5b1099f6f11de0e",59),
"G04-T05_D_REPORTS.zip":("121737bce03946cada21067d8432ddc8907b0b5e099763e07994c0f485b58a80",5),
}
for name,(digest,count) in expected.items():
    f=p/name
    assert f.exists(),f"MISSING {name}"
    assert hashlib.sha256(f.read_bytes()).hexdigest()==digest,f"SHA_MISMATCH {name}"
    with zipfile.ZipFile(f) as z:
        assert z.testzip() is None,f"CRC_FAIL {name}"
        assert len(z.namelist())==count,f"MEMBER_COUNT_FAIL {name}"
print("PASS: original bytes and ZIP structure; NOT a Gold independence or ACL verification")
