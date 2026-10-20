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


## B1–B4 additional code and inventory completed after initial ledger

**B1 author persistence**: `review-template-author-store-v3-b1.ts` adds an append-only draft revision chain (incomplete drafts allowed) and immutable candidate Plan vault. Sources are not signed, candidate never becomes published. `review-template-author-store-v3-b1.test.ts` adds revision CAS, tamper rejection and pre-freeze validation. **Dev-B standalone UI**: `src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx` lets a user configure arbitrary business purpose, fields/material-evidence type, source/version, targets, checks, applicability conditions, stages and outputs without writing code. It provides callbacks for save/preview/freeze, **not mounted and not yet Main IPC integrated**; cannot be counted as completed no-code UAT or actual user release.

**B2 real parser adapter**: `review-source-version-adapter-v3-b2.ts` reuses existing production `parseFileIntoSourceDocument` on original staged bytes in a randomly named private temporary file; namespaces blocks by real physical document version and parseRevision, stores owner-scoped verified block registry and creates C0 SourceIdentity **only** through `sourceForBlock`. PDF `pdf-rect` only if real bounds exist, spreadsheet `sheet-cell`, text/DOCX paragraph where possible, image/scan partial. No read receipt or confirmed/active material side-effect. `review-source-version-adapter-v3-b2.test.ts` includes real-text PDF, scan PDF, TXT and PNG synthetic-source integration and old-block/source isolation. **Not yet full multi-format DOCX/XLSX/ZIP/OCR acceptance**, and parser registry is in memory.

**B3 routing**: `review-intake-routing-adapter-v3-b3.ts` selects a technical route only after 20 seconds and only for exactly one evidenced, high-confidence, available template and fully known file roles/Subjects, unless user interrupts; no CurrentCase writes. `review-intake-routing-adapter-v3-b3.test.ts` covers timer, evidence mismatch, ambiguity, candidate-held policy and manual correction. Runtime/renderer wiring and actual ML classification still NOT_IMPLEMENTED.

**B4**: `B4-50-CANDIDATE-SOURCE-LEDGER.csv` contains 50 **source-anchored historical template** records read directly from #97 catalogs (G01 5 / G02 3 / G03 10 / G04 8 / G05 6 / G06 9 / G07 7 / G08 2), all `candidate-held`/`NOT_RUN`. `review-v3-b4-inventory.test.ts` asserts catalog completeness/status. This ledger does **NOT** pretend to be all 50 per-original-obligation `source→field→Check→test` mapping. G03 ten `GENERATED_NOT_RUN` and G04/G07 structural gaps remain explicit.

**Original quality trace**: `B-LINE-ORIGINAL-ACCEPTANCE-MATRIX.csv` transcribes 19 Dev-B-owned F/A/C/S/D/K acceptance rows from #140 16, with independent Gate O/E/L statuses and original source SHA. Includes K14/K15 legacy gate; no synthetic fixture converted to Gold.

**Cross-line formal request**: `B-CR-001-MAIN-OWNER-TRUST-AND-ADAPTER.md` is pending Dev-C decision. No Main/Preload/V2/current case changes were made.

## CI first failure and corrective code

Earlier D2 Scoped Pi CI (SHA `e77b55438cdb2f6a86f29bb984f4bb8821813b1b`, run `39227311788`) exposed strict TS failures: B1 possibly-undefined target and never function reachability; corrected in `c7fc23765620851e19cb0f9d49ccb051cfcee65e`. An intermediate run `39227541492` (SHA `87f3b1eec01cec3cb6e2a32feb85bc7b6fcb841a`) exposed B2 grant/material possibly undefined; corrected in `49c92c503606048c7aafbbf29335382f946dee50`. **These fixes must be verified again on the final HEAD; previous failure is not a final test success.** Earlier PR CI auto-cancelled on rapid commits; no inference from an older passing Review Baseline CI.

### Current status / required next work
- **B1 PARTIAL**: author UI component unmounted, no scoped author signature/policy approval/real plan installation, no full dynamic scoring DSL, no independent UAT.
- **B2 PARTIAL**: trusted staging+real parser functions but no Native picker bridge, hardened ZIP archive, durable import receipt/recovery/backpressure, full OCR or Electron tests.
- **B3 PARTIAL**: pure route planner and synthetic negatives; not wired to UI, no model classification, no formal Case command.
- **B4 PARTIAL_INVENTORY**: 50 fixed catalogs anchored; individual policy source obligations, G03/G04/G07 and G05 complete semantic reconciliation not done, Gold authorization blocked.
- **Integration BLOCKED**: Dev-C must provide authorized Main caller/context, whitelist physical source, versioned InstallPlan/ApplyMaterial and UI mount. Never claim current business released.
- **CI status**: see exact final PR HEAD Actions, do not attribute C0 `3996 PASS` to Dev-B. Commands to run: `bun run typecheck`, `bun run check:boundaries`, `bun test apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.test.ts apps/electron/src/main/lib/review/review-template-author-store-v3-b1.test.ts apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.test.ts apps/electron/src/main/lib/review/review-source-version-adapter-v3-b2.test.ts apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts apps/electron/src/main/lib/review/review-v3-b4-inventory.test.ts`. Save logs with actual SHA and first failure.


## Dev-B R03 增量｜B1 自建业务试跑 / 主进程可信作者态；B2 ZIP 重试身份（2026-10-19）

**新代码范围**（旧已验收的 #142 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` 仍是 I 初始来源，不以移动 HEAD 自动覆盖）：

1. `review-intake-adapter-v3-b2.ts`：`claimArchiveRequest(ctx,requestId,physicalArchiveKey,archiveSha256)` 在逐文件暂存之前绑定整包物理来源和 raw hash。旧版若两次 ZIP 的子文件名完全不重合，单文件幂等无法阻止同 requestId 混包；新增源级 guard 和 `review-zip-staging-v3-b2.test.ts` 的完全不重名变更 ZIP 反例。重启后仍由 `ReviewB2ArchiveVault` 的持久原件 checkpoint 提供强度不同的校验；此内存 map **不等于**跨重启正式 ImportBatch transaction。
2. `review-template-plan-adapter-v3-b1.ts`：目标 `fieldValues` 在编译前逐类型校验（文本/精确日期/有限数值/枚举/布尔/真实 evidence），`field-equals` 的 comparator 必须与声明字段类型对应；evidence 条件不能用假字符串声明为已满足，必须保留未知交由 C/B2 当前 Source 解析机制判断。保存/编译旧 Plan 不原地变更。
3. `renderer/components/review-v3-dev-b/review-v3-author-trial.ts` + `*.test.ts`：第 51 套自建业务合成试跑采用额外的 trial `targetKey→fieldKey→value` 快照；调用 onPreview 时给**临时副本**，保存作者草稿及冻结候选仍使用原始 source。可预览 `applicable/not-applicable/unknown`，枚举/布尔/数字/日期均做类型解析，伪证据拒绝，候选导出为带 `publicationAllowed=false` 与 `unverified-user-authoring` 的 JSON 文件。此“导出”是作者配置备份，不是正式政策签署。
4. `ReviewV3AuthorWizard.tsx`：有可点击的样例输入表、带类型的等值条件编辑器、预览说明和导出候选配置；仍**未由 Dev-C 挂接正式工作台 IPC**，用户可以在专属组件内编辑，但不能声称完整 5 人无代码 UAT 或正式发布流程已完成。
5. `review-template-author-main-port-v3-b1.ts` + test：`ReviewB1AuthorMainPort` 的 saveDraft/preview/freezeCandidate，要求由 Main 注入 `B1TrustedAuthorContext` 与授权 callback；`recordedBy` 改写为可信 principalId，阻断 Renderer 自称教师/已发布、失效 generation/过期 revision。该 Main-only 新文件 **不是**正式 IPC、Preload 或学校 Principal 发行器，不写 CurrentCase/ReviewRun。接线需要 Dev-C 独占文件与 I glue 遵守 `B-CR-001`。

### 集成切片和本地验收责任

| slice_id | source paths | contract | gate / integration |
|---|---|---|---|
| `B1-trial-author` | `review-template-author-main-port-v3-b1.ts`、`review-v3-author-trial.ts`、`ReviewV3AuthorWizard.tsx`、独立测试 | `review-c0/1` + C verified Main author | `SOURCE_ONLY`，新 HEAD Gate O 未核实；I 可离线读/试跑，不能挂共享 IPC |
| `B2-zip-request-scope` | `review-intake-adapter-v3-b2.ts`、`review-zip-staging-v3-b2.ts` + tests | `review-c0/1`，C Main physicalArchiveKey | `SOURCE_ONLY`，新 HEAD Gate O 未核实；新 CI+整包变更 negative 才有 I 下一快照准入 |
| `B1-plan` / `B2-source` / `B3-router` | 固定旧 SHA `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` | `review-c0/1` | 旧单线 CI scope 成功；I 可按 C-ANCHOR-001 和 B-CR-001 的 B-0 批准继续集成 |

### 真实 Gate

`Gate O`：最新 SHA 必须单独完成 `bun run typecheck`、`bun run check:boundaries`、B1/B2 新回归和 PR CI；开始本增量时仅见 CI queued，未获得全绿证据。旧 ZIP `TS2366` 历史失败已记录，不能从修复提交推断 CI 绿灯。\
`Gate E`：真实 Electron/Native picker/Office71、跨窗撤权/断电恢复仍 `NOT_RUN`。\
`Gate L`：学校身份/政策/独立 Gold `BLOCKED_NO_AUTH`。\
`Gate P`：50 套完整逐原义务与第 51 套 5 人 30 分钟 UAT、100 案/500 文件压力 `PARTIAL/NOT_RUN`。

**后续顺序**：先拿精确 HEAD 的 O gate 真实结果并修复首败；再 B2 逐文件 ImportBatch source 状态机（不是 C 当前案卷），然后 B4 50 原义务追溯与第 51 套真实 Main+Renderer/UAT。I 不等待 B 全线完成，但不把未核实新 HEAD 当绿灯。
