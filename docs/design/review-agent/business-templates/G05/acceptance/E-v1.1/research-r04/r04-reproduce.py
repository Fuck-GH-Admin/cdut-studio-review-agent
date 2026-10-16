#!/usr/bin/env python3
"""Independent public rule-semantics probe; NOT a CDUT/OA/C runtime or D Gold test."""
import hashlib, json, pathlib

ROOT = pathlib.Path(__file__).parent
BYTES = (ROOT / "r04-fixtures.json").read_bytes()
FIXTURES = json.loads(BYTES)
CASES = {case["id"]:case for case in FIXTURES["cases"]}

def canon_sha(v):
    return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def country_old_static(case):
    # The frozen C v0.1 has no documented per-person CDUT appointment exclusion.
    return {"decision":"UNSPECIFIED_OLD_RULE", "reason":"R04/R17/R46 omit appointment-status filter"}

def country_source_oracle(case):
    eligible = {country for country, employed in case["participants"] if employed is False and country not in {"HK","MO","TW"}}
    unknown = any(employed is None for _,employed in case["participants"])
    if len(eligible)>=3:return {"decision":"IN_2017_ART2_SCOPE", "eligible_countries":sorted(eligible), "count":len(eligible)}
    if unknown:return {"decision":"SCOPE_UNVERIFIED", "eligible_countries":sorted(eligible), "count":len(eligible)}
    return {"decision":"OUT_OF_2017_ART2_SCOPE_ONLY", "eligible_countries":sorted(eligible), "count":len(eligible)}

def meeting_old_static(case):
    # Actual old C v0.1 trace R-05 explicitly marks approval at >=1000 only.
    if case["participants_count"] >=1000:return {"decision":"FUNCTIONAL_APPROVAL_TRIGGERED_BY_THRESHOLD"}
    return {"decision":"UNSPECIFIED_OLD_R05_BELOW_1000"}

def meeting_source_oracle(case):
    if not case["academic"]:return {"decision":"NONACADEMIC_NOT_ASSESSED"}
    if case["nominal_organizer"]=="secondary_unit":
        route = "FUNCTIONAL_APPROVAL" if case["participants_count"]>=1000 else "FUNCTIONAL_FILING"
    elif case["nominal_organizer"]=="university" and case["meeting_reach"] in ("regional","national"):
        route = "FUNCTIONAL_APPROVAL"
    else:route="FUNCTIONAL_ROUTE_UNVERIFIED"
    return {"decision":route,"office":"science" if case["discipline"]=="natural_science" else "social_science", "foreign_affairs_additional":bool(case["international"])}

def difference(a,b):
    ka=(set(a)|set(b))-{"id"}
    changes={k:[a.get(k),b.get(k)] for k in ka if a.get(k)!=b.get(k)}
    if "participants" in changes:
        ap,bp=a["participants"],b["participants"]
        delta=[i for i,(x,y) in enumerate(zip(ap,bp)) if x!=y]
        assert len(ap)==len(bp) and delta==[2] and ap[2][0]==bp[2][0], changes
        return "participants[2].CDUT_employment"
    assert list(changes)==["nominal_organizer"],changes
    return "nominal_organizer"

assert difference(CASES["R04-01A"],CASES["R04-01B"])=="participants[2].CDUT_employment"
assert difference(CASES["R04-02A"],CASES["R04-02B"])=="nominal_organizer"
rows=[]
for case in FIXTURES["cases"]:
    prior = country_old_static(case) if case["rule"]=="L01-Art2" else meeting_old_static(case)
    oracle = country_source_oracle(case) if case["rule"]=="L01-Art2" else meeting_source_oracle(case)
    rows.append({"case_id":case["id"], "input_canonical_sha256":canon_sha(case), "old_C_v0p1_static_spec":prior, "official_text_semantics_and_author_v0p2_claim":oracle, "actual_C_v0p2_executed":False})
assert [row["official_text_semantics_and_author_v0p2_claim"]["decision"] for row in rows]==[
    "OUT_OF_2017_ART2_SCOPE_ONLY", "IN_2017_ART2_SCOPE", "SCOPE_UNVERIFIED", "FUNCTIONAL_FILING", "FUNCTIONAL_APPROVAL", "FUNCTIONAL_ROUTE_UNVERIFIED", "FUNCTIONAL_APPROVAL", "FUNCTIONAL_APPROVAL"]
output={"status":"SPEC_SEMANTICS_REPRODUCED_NOT_REAL_C_RUNTIME", "fixture_file_sha256":hashlib.sha256(BYTES).hexdigest(), "rows":rows, "limits":["old C v0.1 is a static Markdown specification, not an executable engine", "new C v0.2 full source and author checker not present in the audited GitHub branch", "official policy text is not verified 2026 operational permission", "no private Gold, OA or applicant data"]}
p=(ROOT/"r04-results.json");p.write_text(json.dumps(output,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":"PASS_SPEC_ORACLE", "fixtures_sha256":output["fixture_file_sha256"], "cases":len(rows), "pairs":["R04-01A/B","R04-02A/B"],"output_sha256":hashlib.sha256(p.read_bytes()).hexdigest()},ensure_ascii=False,indent=2))
