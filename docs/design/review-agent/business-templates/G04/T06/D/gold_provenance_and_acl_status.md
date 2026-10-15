# G04-T06 | D r01 Gold provenance and ACL status
Date: 2026-10-15. Business: 校内群体活动安全审批与备案. Responsible scope: original D-author evidence remediation for E-G04-GLOBAL-0003 only.

## Result
- `BLOCKED_INPUT / OPEN`. The original input and evaluation archives are structurally separated, but production-stage independence, private-storage ACL, and historical access logs have **not** been independently verified.
- `AUTHORIAL_INDEPENDENCE_SELF_ATTESTED_ONLY`: the original D0 and E handoff report no C rule/body/self-test content read; only a C filename surfaced during file discovery. The current remediation read E r01 **audit findings after final Gold delivery**, not C substantive contents, and changed neither inputs nor Gold.
- **No proof of an actual Gold leak**. Missing ACL evidence must not be transformed into an accusation of confirmed disclosure.
- The E auditor commit `fc2ace5c874454ddbcfca731be7aa093416dab12` is **NOT** the author commit. D-author Git commit: `NOT_AVAILABLE`.

## Original delivered archive checks (full-byte SHA-256)
| Asset | SHA-256 |
|---|---|
| G04-T06_INPUT_ONLY.zip | `d94354c38d2ed37114dd6b68b288530367061eb08b2d1f298f31e2cad7928252` |
| G04-T06_EVALUATION_ONLY.zip (do **not** publish) | `cd818cd0672104ad407a99b71506192b9922174d3d6284f36fe11eec33b47050` |
| G04-T06_D_REPORTS.zip | `564deb46c0db15129b426449a503abe25411518289a15a212d3f731ea63826dd` |

All three locally recomputed SHA-256 values match the E r01 E0 manifest. Original evaluation manifest declares `FROZEN_GOLD_v1` and the Gold set hash `6c12c5f06b241f0699208cfb856990a13437f30edca78ddb9a103838c162ba94`. The full evaluation ZIP SHA is independently recomputable; the Gold set aggregate is reported as the original manifest's asserted value.

## Construction timeline (author-original conversation artifacts)
The platform upload records show five evaluation ZIPs:
| First observed upload UTC | Gold assertions | Evaluation ZIP SHA-256 |
|---|---:|---|
| 2026-10-12T20:59:21.871511Z | 28 | `d405b0cfb37268b841283e1b61e2d05a307df8a253b95c04e9c185df233b9564` |
| 2026-10-12T21:00:56.752038Z | 28 | `a1a860b314aa60e1cadef4b6ed6167535b3dcad16d3e94bd9cdde807fe97aa4d` |
| 2026-10-12T21:02:19.172036Z | 28 | `771076e45889328c795c3cb263a1f83cd8e24c887feca73b1076b1b6b7916e2` |
| 2026-10-12T21:02:52.376895Z | 148 | `122635f6ac12072b57c219d55799b182d9cb52ca0c67705928ec05af19f8172c` |
| 2026-10-12T21:03:34.869577Z | 148 | `cd818cd0672104ad407a99b71506192b9922174d3d6284f36fe11eec33b47050` |

Every archive *claimed* `FROZEN_GOLD_v1`, but content changed. The first three Gold content snapshots agree; the third-to-fourth changes affect all 24 Gold case files and expand 28 to 148 assertions; the last step affects 8 of 24 case files' source-reference metadata. `FREEZE_LABEL_REUSE_CONFIRMED`, so neither the time of original construction nor the first truly immutable freeze is independently attested. The first timestamp proves only that an early file existed no later than its platform upload. The final ZIP is anchored both by its last upload and E r01 later manifest.

## Access control, privacy, and immutable archive
Current active copy: original conversation-generated `G04-T06_EVALUATION_ONLY.zip` and ephemeral container path. A private, immutable storage object and ACL/access log have not been produced. The restored local file's `0644` permission is **not** a valid inference about separate C-author or public CI access. Public Git contains only this sanitized status note, never the evaluation archive, trusted fixtures, per-case expected outcomes, or changed-case-ID index.

Status: `GOLD_ACL_UNVERIFIED`, `C_AUTHOR_ACCESS_UNVERIFIED`, `PUBLIC_CI_ACCESS_UNVERIFIED`, `HISTORICAL_ACCESS_UNKNOWN`.

## Author responsibility boundaries
- D existing assets remain unchanged (no D0–D4 restart); archive status: `D_ASSETS_READY_WITH_GAPS`.
- Recovered A00, A02, and B02 source file hashes match the original D frozen manifest. Full B00–06 were not restored in original D0; do not claim otherwise.
- The 2016 experimental-safety repeal is an A/source responsibility, not an occasion for this D author to write 2026 CDUT rules.
- E-G04-T06-0004 broken C links are C-author responsibility. This remediation did not read or patch C.
- Need: actual immutable restricted storage ID, E-only allowlist, explicit C/CI deny tests, read audit logs, independent review of five historical builds. If independence cannot be demonstrated to required standard, route new independent D creation of impacted Gold; do not reissue a self-certified independent freeze.
- E r01 verdict remains unchanged. No E r02 acceptance or product run was performed.

For the reproducible full public differential evidence, see the separately delivered `G04-T06_D_r01_PUBLIC_PROVENANCE_PATCH.zip`; do not upload any of the restricted evaluation assets.
