# G03-T11 | D author evidence intake for E r02 (2026-10-15)

**Scope:** G03-T11 校园电子屏内容与播放版位申请; only E-G03-DEP-001 / DEP-003. This is an incremental provenance and storage-control handoff, **not a revision to the D Gold or an E acceptance result**.

## Original D assets, verified unchanged

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| G03-T11_INPUT_ONLY.zip | 4451522 | `f571495b4a9759166d2f66d52e7a1285cf1e5169319a763a77d613e3251d108d` |
| G03-T11_EVALUATION_ONLY.zip | 98747 | `1d9f4475772bd5c321ba8fd8d30ff33c50d89dd2c12aed8b92c6697547c58271` |
| G03-T11_D_REPORTS.zip | 8098 | `df4a756c8f0ce01eeca4e493a0eb2b958d1a38b7d10f73afe78442aa10ef6ffe` |

All three bytes and hashes match the E r01 `E0-input-manifest.json` at audit freeze `1be43d8bacc015e1fd21949796defcdd3ecb96fc`. That freeze is **E auditor's commit**, never D author provenance.

Original Gold declaration remains `FROZEN_GOLD_v1`, `frozen_at=2026-10-13` as stated by its existing embedded manifest. No new Gold freeze or timestamp backdating.

## Direct non-sensitive checks

- Three original ZIPs passed CRC. Internal frozen manifest verified 149/149 INPUT, 21/21 Gold, 21/21 trusted fixture individual SHA-256; 11/11 restored A/B/D reference snapshots match.
- INPUT has 21 case manifests with neutral keys; all member names start `cases/`, never `gold/`, `trusted_fixtures/`, `coverage/`, or `scoring/`.
- 84 parseable input text/JSON/email files scanned for answer-structure sentinel strings: no hits. All 44 PDFs opened as image-based pages with no direct extracted text layer. This is **not** a proof of full visual semantic review or OCR accuracy.
- Original D status remains `D0 PARTIAL, D1 PASS, D2 PASS, D3 PARTIAL, D4 PASS`. No runtime or product accuracy testing done.

## A/B provenance and independence limits

- A v0.1 package: SHA-256 `4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3` (recorded in E r01). B T11 v0.2 package: SHA-256 `75967699c3cbcb8e3b14d3ac8e908b5c77295f8632b3eefe67ed00b6a243fd34` (recorded in E r01). Current verification matched D embedded A/B source snapshots, but did not rehash the two original aggregate ZIP files.
- D's historical self-declaration says C body was not read before freeze; this evidence pass did not access C. Independent all-session access logs are not established.
- `D_T11_ORIGINAL_AUTHOR_COMMIT=NOT_AVAILABLE`; GitHub `main` baseline `dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e` and the E r01 audit commit are NOT original D commits. **This new archival commit can prove only this incremental public metadata version.**
- Current Chengdu University of Technology (CDUT) 2026 screen-specific application form, equipment specification, role permissions and approver chain remain `SOURCE_PENDING`. Gold relies only on explicitly fictional `QL-PUB-2026-09` rules.

## Access control not verified: stop gate

`ACL_UNVERIFIED` / `STORAGE_TARGET_NOT_CONFIGURED`. The original Gold exists separately as `EVALUATION_ONLY` but was stored alongside G03 artifacts in ordinary Library. Separate ZIPs **do not prove restricted access**; audit E0 did not establish a leak.

An authorized storage administrator must:
1. Supply a non-public controlled object ID/version with default-deny ACL and E/D role-appropriate whitelist; demonstrate actual permitted and denied access in audit logs.
2. Record migration/revocation status of the ordinary Library copy and object-side SHA-256 equality to the above original Gold ZIP.
3. Provide controlled E r02 access without posting credentials, links, Gold, fixtures, per-case mappings or scoring code in Git/PR.

Until then `E2_CONTROLLED_GOLD_ACCESS=BLOCKED_PENDING_STORAGE_ADMIN`. This commit does not claim any ACL change.

## Required E r02 follow-up

- **E0:** re-check asset SHA provenance, internal manifest, original D author Git provenance and actual ACL evidence.
- **E1:** verify source/role boundary, historical C-access isolation, keep `SOURCE_PENDING` for unresolved CDUT rules.
- **E2:** after C candidate and Gold permissions are independently resolved, conduct authorized C/D comparison; never tune Gold to C.
- **E3:** ensure blinded INPUT versus controlled trusted mock injection and private evaluation assets; review E-stage records. Not run here.

Public Git contains **only this non-sensitive summary**. No INPUT ZIP (even though eligible), no EVALUATION ZIP, no trusted fixtures, no per-case expected outcomes, no scoring or private indexing data. Original audit verdict unchanged.

**For repository intake owner:** please preserve this as D-T11 provenance evidence, do not mark `DEP-001` / `DEP-003` resolved until authenticated ACL and author submission chain have actually been checked.
