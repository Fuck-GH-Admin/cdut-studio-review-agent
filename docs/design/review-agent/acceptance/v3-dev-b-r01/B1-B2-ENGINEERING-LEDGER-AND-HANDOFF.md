# Review V3 Dev-B R01 | engineering ledger & handoff
**Status**: PARTIAL_IMPLEMENTED / NOT_INTEGRATED / NOT_RELEASED. As of 2026-10-19.

## Frozen inputs
- C0 gate: [#141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141) `C0_FROZEN_GO` offline scope; `5682057c7232c914e72fdae525ce95fd33f32b53`.
- Contract `review-c0/1`; schema Git blob `b7e5074a71cba3441aa76dd279c45f7021087bbc`; C0 manifest and ownership file are read-only.
- Architecture source: #140 `7f954661b3dbca7f0707832c2d097d9c68a965b4`; historical D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`, #97 `b68443b23293b4714e61a3b81383d3d3a56434fc`.
- Branch `feat/v3-dev-b-template-intake-r01`; Draft [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142), base C0 branch (not main).
- No historical main/C0/Gold/G01–G08 mutable files touched.

## Implemented owner-scoped code
| Concern | Function / type | Evidence and limits |
|---|---|---|
| B1 author schema | `B1AuthorDocument`, `B1Field`, `B1Source`, `B1Module`, `B1Condition` | Typed fields/material evidence type and multi-object scenario, source/version mandatory. Candidate only, not final author UI. |
| B1 compiler | `compileReviewB1Plan` | Exact C0 `CanonicalPlan`; immutable sidecar with source ledger, conditions, stages, outputs; SHA256 over all author/module/target data; `publicationAllowed=false`. |
| Condition | `evaluateB1Condition` | applicable / not-applicable / unknown; missing field -> unknown, never false or PASS. |
| Upgrade | `diffReviewB1Plans`, `requireReviewB1UpgradeAck` | Check×target deletion requires explicit ACK before proposal; Dev-C still decides and persists authorized CAS install. |
| Plan integrity | `verifyReviewB1Descriptor`, `moduleOrder` | Detect dependent module loops, missing sources, unknown targets, duplicate Check and tampering. |
| P06 old scenario | `adaptLegacyP06Plan` | Always `UNSUPPORTED_PLAN_MAPPING` until exact lossless test exists. Retains source digest in error, caller MUST preserve raw bytes separately. |
| B2 staging (memory only) | `ReviewB2StagingService` | Main-scoped token, byte hashing, physical identity, owner/frame/sender/generation, retry collision, import preview; no CurrentCase writes. Not a complete trusted picker/ZIP/ImportBatch transaction. |

## Mandatory outstanding integration requests
`B-CR-001` (pending Dev-C review; no approval implied):
- Frozen owner file(s): `apps/electron/src/main/lib/review/review-ipc.ts`, `apps/electron/src/preload/index.ts`, shared `packages/shared/src/types/review-v3-c0.ts` only if unavoidable.
- Reason: Renderer must NOT send a pre-authorized owner/Actor, native picker token or physical file locator as a purported trusted source; Main must mint `B2MainContext` from validated `senderFrame`, bind token and exact bytes/picker identity and call the Dev-B adapter. Requires a typed `InstallPlan` / `ApplyMaterial` command and explicit CAS/permission/audit by Dev-C.
- DTO before: `CanonicalPlan` with `bindings`; `SourceIdentity` for verified parsed block; `ImportBatch` status only.
- Proposed supplemental DTO: `ImmutablePlanDescriptorB1 { canonicalPlan, authorDigest, sourceLedger, bindingDetails, fieldDefinitions, stages, outputs }` (Dev-B-only sidecar). Dev-C validates `authorDigest`+binding map+fingerprint, policy authority and current revision before install. Do NOT add unchecked fields to trusted C0 types as a shortcut.
- Security: never expose Main grant issuance as generic renderer method; no arbitrary renderer `physicalSourceKey`; reject after-await revoked owner, preserve old Plan/Run/Source, emit Receipt via Dev-C.
- Tests requested on integration SHA: real Main/window IPC spoof, C10 double-click and revoke, R08/R33 deletion ACK, 2 targets/6 Check unknown, old documentVersion and cross-case bogus SourceRef.
- Rollback: disable adapter activation, revert integration only; original C0, frozen Plan and old CurrentCase stay unchanged.

## Batch gates, factual status
| Gate | Status |
|---|---|
| B-TPL-01/02/03/04 code and synthetic tests | IMPLEMENTED, CI outcome must be attached at final HEAD |
| B-IN-02 sender/frame/owner/revoke / replay synthetic | IMPLEMENTED UNIT SCOPE, not live Electron |
| B-DOC-02 same-stem physical identity | IMPLEMENTED IDENTITY UNIT SCOPE, real Office71 not run |
| B-IN-03 `ImportBatch` vs `ReviewBatchAttempt` | IMPLEMENTED in-memory manifest only |
| B-IN-01 ZIP safety, B-DOC-01 real DOCX/XLSX/PDF/image/OCR | NOT_IMPLEMENTED |
| B-FLOW-01 51st no-code form + signed permission, test by five people | NOT_IMPLEMENTED |
| B-ASSET-01 G01–G08 complete 50-source obligation ledger | NOT_IMPLEMENTED (candidate-held; policy/Gold blocked) |
| B-INT-01 Dev-C case commands, GUI and installation | BLOCKED_INTEGRATION |
| Real Windows/Electron/Office/Gold/LIVE/120+30 evaluation | NOT_RUN / AUTH_BLOCKED |

No synthetic five tests or C0 result may be reported as product release.

## Focused commands to execute on exact Dev-B SHA
```bash
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.test.ts apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.test.ts
bun test --isolate --timeout 30000
```
Store first failure, exit code, toolchain version and matched SHA. If target-machine-only: mark NOT_RUN until executed; do not infer PASS from unrelated C0 SHA or earlier head.

## Next concentrated engineering batch
1. Finish B1 author-draft persistence, policy-binding validation and independent rule/field/subject schema. Add no-code author UI as Dev-B dedicated component, ask C for mounting and secure Main command. Prove blank 51st synthetic business roundtrip without typing TS/JSON.
2. B2 implement actual Native picker/drop buffer and ZIP validation at the Main bridge, durable receipt/checkpoint. Bind real parser outputs to C0 SourceIdentity: paragraph, Excel sheet/cell, PDF page/rect, and image partial/OCR. Office71 and token cross-window tests must run.
3. B3 conservative intent classification, 20s only when unique, interrupt/undo; user confirms Subject/role before business writes; never equate ImportBatch with ReviewBatchAttempt.
4. B4 independently reconcile all 50 candidate-held manifests and each original source/obligation, G03 GENERATED_NOT_RUN, G04/G07 gaps and G05 #91→#97 fourteen differences. No publisher or school policy inferred; report exact missing owner/Gold.
5. Integrate through approved Dev-C adapter only, verify C0/Plan/source/sourceVersion and CurrentValidity fail closed, then combined Electron campaign.

**Exit**: This Draft PR is reviewable partial code only. Do not merge or call B1–B4 complete.
