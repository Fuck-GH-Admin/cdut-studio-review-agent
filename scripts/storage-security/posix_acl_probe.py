#!/usr/bin/env python3
"""Test-only Linux DAC isolation probe. NEVER accepts or opens real Gold objects.
Requires Linux, root, setpriv, Python 3. Leaves no sandbox files behind.
This is NOT a cloud/provider ACL acceptance test.
"""
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile

ROLES = {
    "E_REVIEWER": (24101, 24101),
    "C_AUTHOR": (24102, 24102),
    "D_AUTHOR": (24103, 24103),
    "PUBLIC_CI": (24104, 24104),
    "REPO_READER": (24105, 24105),
}
READ_SCRIPT = (
    "import hashlib,sys; "
    "data=open(sys.argv[1], 'rb').read(); "
    "print(hashlib.sha256(data).hexdigest())"
)

def test_read(actor, path, expected_allow, expected_digest=None):
    uid, gid = ROLES[actor]
    cp = subprocess.run(
        ["setpriv", f"--reuid={uid}", f"--regid={gid}", "--clear-groups",
         "python3", "-c", READ_SCRIPT, str(path)],
        capture_output=True, text=True, check=False,
    )
    success = cp.returncode == 0
    digest_ok = success and cp.stdout.strip() == expected_digest
    observed = "ALLOW" if success else ("DENY_PERMISSION" if "PermissionError" in cp.stderr else "ERROR")
    result = {
        "identity": actor, "uid": uid, "gid": gid, "action": "read_version_by_path",
        "expected": "ALLOW" if expected_allow else "DENY_PERMISSION",
        "observed": observed,
        "integrity_matched": digest_ok if expected_allow else None,
        "pass": (success and digest_ok) if expected_allow else observed == "DENY_PERMISSION",
    }
    return result


def main():
    if os.geteuid() != 0 or shutil.which("setpriv") is None:
        raise SystemExit("Need Linux root + setpriv to run real cross-UID tests")
    with tempfile.TemporaryDirectory(prefix="acl-synthetic-only-") as tmp:
        root = Path(tmp)
        os.chmod(root, 0o755)
        private = root / "private"
        private.mkdir(mode=0o750)
        os.chown(private, 0, ROLES["E_REVIEWER"][1])
        os.chmod(private, 0o750)
        public = root / "public"
        public.mkdir(mode=0o755)
        versions = {}
        for version, data in [("v0001", b"acl-synthetic-v1-only\n"), ("v0002", b"acl-synthetic-v2-only\n")]:
            obj = private / f"{version}.bin"
            obj.write_bytes(data)
            os.chown(obj, 0, ROLES["E_REVIEWER"][1])
            os.chmod(obj, 0o440)
            versions[version] = {"path": obj, "sha256": hashlib.sha256(data).hexdigest()}
        public_obj = public / "public_input.bin"
        public_data = b"synthetic-public-input-only\n"
        public_obj.write_bytes(public_data)
        os.chmod(public_obj, 0o444)
        public_hash = hashlib.sha256(public_data).hexdigest()
        events = []
        for version, item in versions.items():
            for actor in ROLES:
                ev = test_read(actor, item["path"], actor == "E_REVIEWER", item["sha256"])
                ev["object_version"] = version
                ev["phase"] = "before_revocation"
                events.append(ev)
        for actor in ["PUBLIC_CI", "REPO_READER"]:
            ev = test_read(actor, public_obj, True, public_hash)
            ev["object_version"] = "public-input-v1"
            ev["phase"] = "before_revocation"
            events.append(ev)
        # Root-owned parent prevents a revoked E actor from self-granting access.
        os.chown(private, 0, 0)
        os.chmod(private, 0o700)
        for version, item in versions.items():
            ev = test_read("E_REVIEWER", item["path"], False)
            ev["object_version"] = version
            ev["phase"] = "after_revocation"
            events.append(ev)
        for version, item in versions.items():
            ev = test_read("C_AUTHOR", item["path"], False)
            ev["object_version"] = version
            ev["phase"] = "after_revocation"
            events.append(ev)
        public_ev = test_read("PUBLIC_CI", public_obj, True, public_hash)
        public_ev["object_version"] = "public-input-v1"
        public_ev["phase"] = "after_revocation"
        events.append(public_ev)
        snapshot = {
            "private_dir_mode_before": "0750", "private_dir_owner_before": "root:E_REVIEWER_test_gid",
            "private_file_mode": "0440", "private_file_owner": "root:E_REVIEWER_test_gid",
            "private_dir_mode_after": format(stat.S_IMODE(private.stat().st_mode), "04o"),
            "private_dir_owner_after": "root:root",
            "public_dir_mode": format(stat.S_IMODE(public.stat().st_mode), "04o"),
            "public_file_mode": format(stat.S_IMODE(public_obj.stat().st_mode), "04o"),
            "public_sharing_links": "NOT_APPLICABLE_LOCAL_POSIX; cloud/provider links NOT_CHECKED",
            "storage_backend": "ephemeral_local_POSIX_DAC_only",
        }
        report = {
            "schema": "cdut-storage-acl-posix-synthetic-probe-v1",
            "executed_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
            "scope": "SYNTHETIC_ONLY; NO_GOLD; NOT_PRODUCTION_ACL",
            "status": "ACL_PARTIAL" if all(e["pass"] for e in events) else "NOT_CONFIGURED",
            "provider_gold_acl_status": "NOT_CONFIGURED",
            "identity_kind": "actual_separate_Linux_UID_processes; not cloud IAM principals",
            "versions": {v: {"sha256": i["sha256"]} for v, i in versions.items()},
            "old_zip_sha256": "NOT_APPLICABLE_NO_REAL_D_ARCHIVE",
            "historical_creation_independence": "NOT_ASSESSED",
            "snapshot": snapshot, "events": events,
            "pass_count": sum(e["pass"] for e in events), "total_count": len(events),
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        if not all(e["pass"] for e in events):
            raise SystemExit(1)

if __name__ == "__main__":
    main()
