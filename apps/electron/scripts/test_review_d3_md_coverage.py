#!/usr/bin/env python3
"""Independent tests for D3 source-to-compiled duty coverage gate, stdlib only."""
import copy
import hashlib
import importlib.util
import json
import pathlib
import tempfile
import unittest

TOOL = pathlib.Path(__file__).with_name("review-d3-md-coverage.py")
spec = importlib.util.spec_from_file_location("review_d3_md_coverage", TOOL)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

MD = b"| Rule | Chinese duty |\n| --- | --- |\n| R08 | verify proxy identity |\n| R23 | copy authorization separate from read |\n| R29 | electronic alternative pending tooling |\n"

def sample():
    digest = hashlib.sha256(MD).hexdigest()
    catalog = {
        "schemaVersion": 1, "scope": "pilot", "sourceMd": "synthetic-duty-slice.md",
        "sourceSha256": digest, "selectionReason": "independent three-duty pilot, not full business coverage",
        "requirements": [
            {"id": "R08", "locator": "sample line 3", "purpose": "identity and proxy scope"},
            {"id": "R23", "locator": "sample line 4", "purpose": "read does not imply copy"},
            {"id": "R29", "locator": "sample line 5", "purpose": "electronic alternatives cannot be silently simplified"},
        ],
    }
    ledger = {
        "schemaVersion": 1, "sourceMd": catalog["sourceMd"], "sourceSha256": digest,
        "workspaceId": "synthetic-archive", "templateId": "archive-access", "templateVersion": 1,
        "planFingerprint": "fingerprint-demo",
        "requirements": [
            {"id": "R08", "status": "policy-awaiting-confirmation", "checkIds": ["module/read/auth"]},
            {"id": "R23", "status": "policy-awaiting-confirmation", "checkIds": ["module/copy/auth"]},
            {"id": "R29", "status": "tooling-blocked", "checkIds": [], "gapId": "G-ADV"},
        ],
    }
    plan = {
        "workspaceId": "synthetic-archive", "templateId": "archive-access",
        "templateVersion": 1, "fingerprint": "fingerprint-demo", "publicationAllowed": False,
        "mapping": [
            {"checkId": "module/read/auth", "subjectId": "d2-read", "authority": "unverified-policy"},
            {"checkId": "module/copy/auth", "subjectId": "d2-copy", "authority": "unverified-policy"},
        ],
    }
    gold = {
        "schemaVersion": 1, "sourceSha256": digest,
        "requirements": [
            {"id": "R08", "allowedStatuses": ["policy-awaiting-confirmation"],
             "requiredCheckIds": ["module/read/auth"],
             "checkSubjects": {"module/read/auth": ["d2-read"]}},
            {"id": "R23", "allowedStatuses": ["policy-awaiting-confirmation"],
             "requiredCheckIds": ["module/copy/auth"],
             "checkSubjects": {"module/copy/auth": ["d2-copy"]}},
            {"id": "R29", "allowedStatuses": ["tooling-blocked"]},
        ],
    }
    gaps = [{"id": "G-ADV", "sourceRequirementIds": ["R29"],
             "reproduce": "D2_UNMAPPED_ADVANCED with an explicitly authored relationship",
             "verifiedAgainstRun": False}]
    return catalog, ledger, plan, gold, gaps

class QualityGateTests(unittest.TestCase):
    def check(self, state):
        c,l,p,g,gaps = state
        with tempfile.TemporaryDirectory() as td:
            md=pathlib.Path(td)/"synthetic-duty-slice.md"
            md.write_bytes(MD)
            return module.validate(c,l,p,g,source=str(md),gaps=gaps)
    def test_pilot_succeeds_without_certifying_business_quality(self):
        report=self.check(sample())
        self.assertEqual(report["gate"],"PASS",report["errors"])
        self.assertTrue(report["sourceHashVerified"])
        self.assertEqual(report["catalogRuleCount"],3)
        self.assertEqual(report["attributedPlanCheckCount"],2)
        self.assertFalse(report["completeBusinessTemplateCertified"])
        self.assertFalse(report["semanticEquivalenceVerified"])
    def test_missing_source_duty_refuses(self):
        s=list(sample())
        s[1]["requirements"].pop(1)
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("coverage mismatch" in v for v in r["errors"]))
    def test_wrong_copy_subject_refuses(self):
        s=list(sample())
        s[2]["mapping"][1]["subjectId"]="d2-read"
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("R23" in v and "scope" not in v for v in r["errors"]),r["errors"])
    def test_wrong_policy_authority_refuses(self):
        s=list(sample())
        s[2]["mapping"][1]["authority"]="request-scope"
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("stronger D2 authority" in v for v in r["errors"]))
    def test_silent_out_of_scope_requires_independent_gold_and_reason(self):
        s=list(sample())
        s[1]["requirements"][1]={"id":"R23","status":"out-of-scope-with-reason","checkIds":[]}
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("R23" in v for v in r["errors"]))
    def test_fake_gap_evidence_refuses(self):
        s=list(sample())
        s[4][0]["sourceRequirementIds"]=[]
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("gap missing source rule" in v for v in r["errors"]))
    def test_bad_md_digest_refuses(self):
        s=list(sample())
        s[0]["sourceSha256"]="0"*64
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("sha256 differs" in v for v in r["errors"]))
    def test_full_scope_requires_actual_original_md(self):
        c,l,p,g,gaps=sample()
        c["scope"]="full"
        report=module.validate(c,l,p,g,gaps=gaps)
        self.assertEqual(report["gate"],"FAIL")
        self.assertTrue(any("requires the exact original MD" in v for v in report["errors"]))
    def test_full_scope_detects_unindexed_original_row(self):
        s=list(sample())
        s[0]["scope"]="full"
        with tempfile.TemporaryDirectory() as td:
            new_md=MD+b"| R33 | stage decision must not count as missing applicant document |\n"
            md=pathlib.Path(td)/"original.md"
            md.write_bytes(new_md)
            digest=hashlib.sha256(new_md).hexdigest()
            for k in [0,1,3]:s[k]["sourceSha256"]=digest
            report=module.validate(s[0],s[1],s[2],s[3],source=str(md),gaps=s[4])
        self.assertEqual(report["gate"],"FAIL")
        self.assertTrue(any("R33" in v and "rule-index incomplete" in v for v in report["errors"]),report["errors"])
    def test_compiled_only_hides_other_source_rule(self):
        s=list(sample())
        s[1]["requirements"][2]={"id":"R29","status":"implemented-not-tested","checkIds":["module/read/auth"]}
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("R29" in v for v in r["errors"]))
    def test_unattributed_plan_check_fails_full_only(self):
        s=list(sample())
        s[2]["mapping"].append({"checkId":"unindexed-rule","subjectId":"d2-read","authority":"request-scope"})
        self.assertEqual(self.check(s)["gate"],"PASS")
        s[0]["scope"]="full"
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("unattributed compiled Checks" in v for v in r["errors"]))
    def test_false_tested_status_without_run_id_fails(self):
        s=list(sample())
        s[1]["requirements"][0]["status"]="implemented-and-tested"
        s[3]["requirements"][0]["allowedStatuses"]=["implemented-and-tested"]
        r=self.check(s)
        self.assertEqual(r["gate"],"FAIL")
        self.assertTrue(any("Run evidence" in v for v in r["errors"]))

    def test_original_archive_md_pilot_catches_real_b_fragment_omissions(self):
        # Real D2 plan from independently authored PR #12, not a reconstructed plan.
        root=pathlib.Path(__file__).resolve().parents[3] / "docs/design/review-agent/fixtures"
        prefix="d3-md-archive-"
        get=lambda filename: json.loads((root/(prefix+filename)).read_text(encoding="utf-8"))
        catalog=get("7-pilot-catalog.json")
        ledger=get("7-pilot-ledger-agent-b.json")
        gold=get("7-pilot-independent-gold.json")
        gaps=get("7-pilot-gaps.json")
        plan=get("b-actual-plan-snapshot.json")
        result=module.validate(catalog,ledger,plan,gold,gaps=gaps)
        self.assertEqual(result["gate"],"FAIL")
        self.assertEqual(result["catalogRuleCount"],7)
        self.assertEqual(result["compiledPlanCheckCount"],6)
        self.assertTrue(any("R08" in e and "required Checks" in e for e in result["errors"]), result["errors"])
        self.assertTrue(any("R33" in e for e in result["errors"]), result["errors"])
        self.assertFalse(result["completeBusinessTemplateCertified"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
