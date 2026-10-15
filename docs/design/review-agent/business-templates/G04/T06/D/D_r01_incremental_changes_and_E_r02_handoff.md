# G04-T06 | D r01 incremental evidence and E r02 retest handoff

**Responsibility:** Original D author for G04-T06, targeted follow-up to `E-G04-GLOBAL-0003 / BLOCKED_INPUT`. No rebuild of A, B, C or D; no C-rule modifications; no E r01 verdict modifications.

## Baseline preservation

The original three D archives remain byte-identical to those in `E0-input-manifest.json` frozen at E r01 commit `fc2ace5c874454ddbcfca731be7aa093416dab12`:
- INPUT_ONLY `d94354c38d2ed37114dd6b68b288530367061eb08b2d1f298f31e2cad7928252`
- EVALUATION_ONLY `cd818cd0672104ad407a99b71506192b9922174d3d6284f36fe11eec33b47050` (**never publish content**)
- D_REPORTS `564deb46c0db15129b426449a503abe25411518289a15a212d3f731ea63826dd`

D author Git commit: `NOT_AVAILABLE`. The E audit commit is **not** the D author commit. The old original Gold remains `FROZEN_GOLD_v1` per its own manifest; the same freeze label was reused across multiple changing intermediate snapshots, which is now openly disclosed. The exact original first-build/immutable freeze time is `NOT_EXTERNALLY_ATTESTED`; platform upload records only provide latest-known existence times.

## Evidence obtained and remaining gap

**Obtained:** Original archive byte hashes verified locally; A00/A02/B02 source-file hashes matched the original Gold manifest; 5 historical evaluation upload snapshots were recovered and compared without publishing expected answers. Historical change scope: 24 case files changed when expanding 28 to 148 assertions; 8 case files had later source-reference changes. C正文/author self-test content was not read in the D author process as declared by the original D report, but no independent complete C-access/audit trail exists. Post-freeze this remediation read **E audit text only**.

**Still missing:** verified private ACL, upload/download/read access logs, E/C/CI group membership, denied-access test from C and public CI identities, WORM/immutable retention evidence, complete authorial process attestation and full B00–06 original archive. Missing ACL alone is **not** proof of disclosure; if independence cannot be adequately established, a new independent D author must rebuild the affected Gold instead of this author retroactively certifying it.

## Required E r02 checks

| Check | Evidence for E r02 | Current status |
|---|---|---|
| E0 provenance | Recompute 3 original ZIP SHA, compare to E0 r01 manifest, inspect new public provenance note and five-build lineage | `READY_FOR_RECHECK` |
| E0 ACL/isolation | Storage admin provides object ID/version, actual allowlist, policy enforcement logs, E allow/C+CI deny access tests | `BLOCKED_ACL_EVIDENCE` |
| E1 source validity | Confirm T06 CDUT 2025 meeting rule is not a generic event safety threshold; retain POLICY_PENDING for unknown 2026 safety forms | `SOURCE_PENDING` |
| E2 independent Gold | Review author process trail, five-build freeze-label reuse, historical source-reference corrections; rerun affected case validation in restricted E workspace | `REVIEW_REQUIRED` |
| E3 cross-domain | Only when Gold rebuild or new source changes alter boundaries, re-check G03 venue, G04-T02 visitor, G04-T06 event, statutory police permission | `CONDITIONAL` |
| E4 verdict | Independently judge whether GLOBAL-0003 can be closed based on actual evidence, and record remaining limitations | `NOT_RETESTED` |

## Role separation

- **D author** provides truthful provenance/hashes/known-unknown statement; does not declare successful ACL.
- **Storage administrator** must establish nonpublic immutable Gold location, ACL enforcement, audit logs, and signed access tests. Historical gaps cannot be retroactively fabricated.
- **Independent E r02** must perform actual evidence-based check, not treat this patch or D-offline checks as acceptance.
- **C author** owns E-G04-T06-0004 broken C source references.
- **A/source owner** owns E-G04-A-0005 2016 replacement history, plus current CDUT source uncertainties.

No Gold, trusted fixtures, per-case expected results, restricted source-delta case index, or scoring file was committed in this branch.

**Current result:** `GLOBAL-0003 OPEN / ACL_UNVERIFIED / E_r02 NOT_RUN`.
