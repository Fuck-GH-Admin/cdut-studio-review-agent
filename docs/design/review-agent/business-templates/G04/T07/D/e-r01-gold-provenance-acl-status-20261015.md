# G04-T07 | D Author E-r01 Gold provenance and ACL evidence (public-safe)

- Business: **G04-T07 校园临时动火作业安全许可（角色限定）**
- Scope: author-side supplemental evidence for **E-G04-GLOBAL-0003** only; not an E verdict, C edit, or A/B policy update.
- E baseline: `audit/g04-e-v1-r01@fc2ace5c874454ddbcfca731be7aa093416dab12`. **This is E audit HEAD, never the original D author commit.**
- Original D author Git commit/blob: **NOT_AVAILABLE** (as recorded in E0 and checked separately).
- Original D status: D0 PARTIAL / D1 PASS / D2 PASS / D3 PARTIAL / D4 PASS, `D_ASSETS_READY_WITH_GAPS`, `FROZEN_GOLD_v1`, 24 cases.
- Current remediation: **metadata-only; no change to any original D archive, case, fixture, or Gold**. Original D author asserts C was not read before Gold construction; third-party proof is unavailable.

## Exact original archive SHA-256 values, verified against frozen E0-input-manifest

| Original archive | SHA-256 |
|---|---|
| `G04-T07_INPUT_ONLY.zip` | `394bbacbcbd4d41d97b195702e032d4a71ad4b63d1479a5b858d5aaa18f11ace` |
| `G04-T07_EVALUATION_ONLY.zip` **PRIVATE — NEVER COMMIT** | `d1beee13af9040333dabdde4520b318e02872ac7e6c3849a4f344c39eb5b57b8` |
| `G04-T07_D_REPORTS.zip` | `e4e6a95115ccbc570fc9d52f8c9c3e5658da57d53a1a14e61047382e204db358` |

Gold ordered-single-file-hash digest: `657e320841a23a6f27280da403db8387a5c1bd27afdf04eb47032379e01489bc`. Recomputed from 24 unchanged Gold files. The original evaluation manifest passes **192/192 input checks** and **56/56 controlled evaluation-file checks**, with valid ZIP CRCs; 57 evaluation archive entries include the manifest itself.

## Creation and independence limits

- The original `frozen_manifest.json` self-reports `freeze_date=2026-10-13`; ZIP header timestamps of the Gold files include `2026-10-12 20:58:54` with **no trustworthy timezone or immutable timestamp authority**. Exact first construction time: **NOT EXTERNALLY PROVEN**. Files mounted on 2026-10-15 do not prove original creation time.
- Original D reports state `C_NOT_PROVIDED/C_NOT_READ` and that Gold was made before blind inputs. This is a **D author declaration**, not independent audit logs. This remediation reads E-r01 findings *after* the original freeze (including E's high-level observations of C), but does **not** read C's full rules/author answers or change Gold.
- `INDEPENDENCE_EXTERNALLY_ATTESTED=NO`; `PROVEN_GOLD_LEAK=NOT_ESTABLISHED`; `KNOWN_C_CONTAMINATED_CASES=NONE_IDENTIFIED` while all 24 cases remain subject to historical-access uncertainty.
- Original Gold was supplied as an unencrypted evaluation ZIP in the conversation / ChatGPT Library under `/G04-T07_EVALUATION_ONLY.zip`; no verifiable Library ACL, named-reader list, read/download audit logs, or private object store retention have been supplied. Library listing exposed editor role only, **not evidence of exclusive access**.
- At frozen E audit HEAD and default main, no original T07 Gold/fixture archive appears in Git; that is **not** proof that C had no other access route. Public CI does not gain Library access merely by cloning Git.
- `LIBRARY_ACL=UNVERIFIED`, `ACCESS_LOG=NOT_AVAILABLE`, `PRIVATE_GOLD_STORAGE=NOT_CONFIGURED_OR_NOT_EVIDENCED`. Do not mark isolation PASSED.

## Private storage administrator action required (not performed)

1. Retain the original SHA-matched ZIP; create an immutable, **restricted** object version outside public Git.
2. Supply server-side object version/time, real reader and writer principals, C author / public CI / anonymous denial policy, ACL history and access logs where available; clearly declare any unauditable historical interval.
3. Allow an independent E verifier to inspect the private records; publish only a redacted summary. Do not put Gold, `trusted_fixtures/`, private coverage matrices, or scoring artifacts in public Git.
4. If proven C access, public exposure, or semantic Gold contamination is discovered: fix scope based on evidence and commission **a new independent D author/session** for affected Gold; explicitly freeze a new version and preserve `FROZEN_GOLD_v1`. Missing ACL alone does **not** establish a leak.

## E r02 retest routing

| Phase | Required |
|---|---|
| E0 **mandatory** | Recompute all three old ZIP hashes; verify author/creation evidence; independently validate restricted-object ACL, reader grants and logs. Keep GLOBAL-0003 open without independently verifiable ACL. |
| E1 **source-dependent** | Recheck applicable CDUT active policy and authorized signatory only if new A/B first-party sources are delivered; missing real 2026 permits remain SOURCE_PENDING. E's established repeal of 2016 trial rule is not for D to re-legislate. |
| E2 **impact-dependent** | Sample independent Gold validity and affected evidence. Rebuild only if supported contamination, Gold mistake or a new effective source affects a case; no reverse-correction from C. |
| E3 **boundary-dependent** | Regress T07 temporary hot-work permit vs T03 personnel safety, T04 project risk, T05 experiment permit, plus N18 construction residency if A/B resolves that boundary. |

**Current state:** Original assets retained, `FROZEN_GOLD_v1` unchanged, `E-G04-GLOBAL-0003=OPEN/BLOCKED_INPUT`, `E_r02_NOT_RUN`, `C_NOT_MODIFIED`, `PRODUCT_RUN_NOT_PERFORMED`.

Full author-side report bundle (not in this PR) has SHA-256 `31a72a5357a04b7e3411f5ca72fb60b5adebb973ceb252bea16f03d588be12d3` and contains `gold_provenance_and_acl_status.md`, `e_r02_retest_handoff.md`, `archive_reproduction_and_diff.md`, `verify_g04_t07_archives.py`, and the public file hash table. It contains **no Gold/fixture data**.
