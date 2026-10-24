---
path: apps/electron/src/main/lib/review/review-v3-b-bulk-remediation-cycle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 53e946327f7354e5a16fa5017779049bdcf682e3
sha256: d2b699ca0a22ae6a3a329ec0504de6a980f8bd2695e2f0ea335d55df3edf9b3f
lines: 193
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b-bulk-remediation-cycle.ts

## 1. 结论与边界

Dev-B R28：**可续跑的技术证据工作清单 + 非破坏、校验和绑定的批量修复包**。三个纯函数（`prepareB28RemediationPacket` / `reconcileB28CandidateObservations` / `describeB28CandidateHandoff`）把冻结的 B26 工作台问题导出为人工补证清单、把两次快照间的候选观察差异对账、把 B27 就绪面转成渲染层预览交接（`apps/electron/src/main/lib/review/review-v3-b-bulk-remediation-cycle.ts:1-2`）。**不是**权威、不写 Case（`:2`）；所有产物字面携带 `candidateOnly:true`、`publicationAllowed:false`。

边界：只标注「候选观察」不销项（`:83,111,121-124` 注释：新观察只能标注恰好一个既有 issue，不能删缺口/加职责/升格为批准）；真正 Case/Run 事务只允许 C Main 授权（`:176-177`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B28RemediationKind` | type | 30-32 | 5 值：`REACQUIRE_FROZEN_RAW\|QUARANTINE_DIFFERENT_VERSION\|REQUEST_SOURCE_DOCUMENT\|CONFIRM_OBJECT_SUBJECT_SCOPE\|REQUEST_INDEPENDENT_SCHOOL_GOLD` | |
| `B28Remediation` | interface | 34-41 | `{issueId;kind;domain;templateId;checkId;sourceId;ruleId;requiredEvidence[]; proposedStatus:'NEEDS_HUMAN_EVIDENCE'; schoolAuthorization:false; businessWriteAllowed:false}` | |
| `B28ReviewPacket` | interface | 42-50 | `{schemaVersion:'review-v3-b28-remediation-packet/1'; parentSnapshotSha256; selectedIssueIds[]; actions[]; createdFrom:'B26_FROZEN_CANDIDATE_QUEUE'; candidateOnly:true; publicationAllowed:false; canApplyToCurrentCase:false; packetSha256}` | |
| `prepareB28RemediationPacket` | function | 84-107 | `(work:B26Workbench, selected:readonly string[], expectedSha256:string) => B28ReviewPacket` | |
| `B28QueueChange` | interface | 108-113 | `{issueId;domain;templateId;kind;from;to; status:'TECHNICAL_CANDIDATE_OBSERVATION_ONLY'}` | |
| `B28QueueReconcile` | interface | 114-120 | `{schemaVersion:'review-v3-b28-queue-reconcile/1'; previous/currentSnapshotSha256; changed[]; stillUnresolved:number; policyGapsCleared:0; publicationAllowed:false; canAutoApply:false; reconciliationSha256}` | |
| `reconcileB28CandidateObservations` | function | 126-166 | `(previous,next:B26Workbench, expectedPreviousSha256:string) => B28QueueReconcile` | |
| `B28CandidateHandoff` | interface | 167-173 | `{schemaVersion:'review-v3-b28-candidate-handoff/1'; caseCandidateId; authorFingerprint; routeRequiresHuman:boolean; safeNextActions:B27Action[]; candidateOnly:true; autoCreateCase:false; autoRunPi:false; canPublish:false; canWritePolicy:false}` | |
| `describeB28CandidateHandoff` | function | 178-193 | `(readiness:B27Readiness) => B28CandidateHandoff` | |

内部：`sha`（`:10`，64hex）、`reject`（`:11`，`Error('B_R28_'+why)`）、`verified`（`:12-29`，B26 工作台完整性+防篡改校验）、`remediation`（`:51-82`，5 类 issue→kind+requiredEvidence 映射）。

## 3. 内部逻辑与关键流程

- `verified`（`:12-29`）：schemaVersion/candidateOnly/publicationAllowed/schoolAuthorityVerified 四字面量 + **固定冻结计数**（domains:8、templates:50、checks:3875、unknownSourceRefs:4163、unscoped:34）+ templates 长度 50 + `snapshotSha256===sha256(JSON{templates,issues,counts})` + issueId 唯一 + 每 issue `canAutoClear:false/schoolAuthorityVerified:false/publicationAllowed:false`，否则 `WORKLIST_INVALID`/`WORKLIST_TAMPERED`。
- `remediation`（`:51-82`）：switch 5 个 `B26IssueKind` 各配 3 条 `requiredEvidence`；未知 kind → `UNKNOWN_ISSUE`。
- `prepareB28RemediationPacket`（`:84-107`）：verified → `expectedSha256===snapshotSha256`、selected 1..500 无重复无空串 → 排序去重后逐 id 映射（不在快照 → `B_R28_ISSUE_NOT_IN_SNAPSHOT`）→ `packetSha256=sha256(JSON(packet))`。
- `reconcileB28CandidateObservations`（`:126-166`）：双方 verified + 前快照哈希匹配（`STALE_PREVIOUS_SNAPSHOT`）→ 冻结 issue 集不变校验（frozenD4SHA/unscoped/unknownSourceRefs/长度，`FROZEN_ISSUE_SET_CHANGED`）→ 逐 issue 身份七元（domain/templateId/checkId/sourceId/ruleId/kind/priority）不变（`FROZEN_ISSUE_IDENTITY_CHANGED`）→ 仅 state 变化记 changed 且新 state 须在 4 值白名单（`missing/candidate-observed-unverified/quarantined/awaiting-school-gold`，`UNSUPPORTED_EVIDENCE_STATE`）→ `stillUnresolved=next.issues.length`（恒等于全量）、`policyGapsCleared:0`。
- `describeB28CandidateHandoff`（`:178-193`）：readiness 五字面量 false + 两哈希 64hex + actions 数组校验（`READINESS_INVALID`）→ `routeRequiresHuman=!readiness.technicalRoutingReady`、actions 浅拷贝。

## 4. 调用者与调用链

出向：`node:crypto`；类型 `./review-v3-b4-bulk-evidence-workbench`（B26Workbench/B26Issue/B26IssueKind，`:6-8`）、`./review-v3-b-candidate-readiness-workbench`（B27Readiness/B27Action，`:9`）。

入向（否定结论）：全部 9 个导出在冻结树**零引用**（检索式=9 符号名 + 模块名 `review-v3-b-bulk-remediation`，含 import/类型/调用；仅命中本文件自身定义行）——包括零测试。即本模块当前是死代码/预留接口面，无产品入口。

## 5. 数据 I/O、读写与副作用

无。纯函数 + sha256 计算；不写盘、不发事件。错误抛普通 `Error('B_R28_…')`（非 C0ContractError）。

## 6. 分支、失败、取消与恢复

失败全为 throw（`B_R28_`/`B4_…` 前缀 + `B_R28_ISSUE_NOT_IN_SNAPSHOT` 等）；无返回错误码。无异步/取消。语义恢复点：`reconcile` 要求前快照哈希锚定（防跨版本对账）；packet 绑 `parentSnapshotSha256`（防过期选择）。

## 7. 权限与权威状态

无权限分支（全文无 actor/sender）。权威否定以字面量固化：`schoolAuthorization:false`、`businessWriteAllowed:false`、`canApplyToCurrentCase:false`、`policyGapsCleared:0`、`canAutoApply:false`、`canPublish:false`、`canWritePolicy:false`、`proposedStatus:'NEEDS_HUMAN_EVIDENCE'`（`:39-40,48,112,118,171-172`）——候选观察永不升格（`:123-124` 注释）。

## 8. 修改影响面

当前零调用方（§4），改动无静态可见影响；但类型被 B26/B27 引用方向相反（本文件 import 它们），改接口需动 `review-v3-b4-bulk-evidence-workbench.ts`/`review-v3-b-candidate-readiness-workbench.ts`。若未来接 UI，`packetSha256/reconciliationSha256` 口径将成为对账契约。

## 9. 测试证据

无直接测试、无间接测试（全树零引用）。**NOT_RUN**：本轮未执行测试/typecheck。缺口：三个函数的全部分支（含 `WORKLIST_TAMPERED`、`STALE_PREVIOUS_SNAPSHOT`、`FROZEN_ISSUE_IDENTITY_CHANGED`）无任何断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 冻结计数 8/50/3875/4163/34 与 B26 类型字面量一致 | 已证实 | `:16-19` vs `review-v3-b4-bulk-evidence-workbench.ts:65-67` |
| reconcile 不可删缺口/不可升格（state 白名单 + stillUnresolved=全量） | 已证实 | `:150-162` |
| 全部导出零调用零测试 | 已证实（否定结论，检索式见 §4，范围=全冻结树） | grep |
| 抛错用普通 Error 而非 C0ContractError（与 A 链不同口径） | 已证实 | `:11` |
| 未来接入方式 | 未知 | 无调用点可考 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 导出 | §2 | 30-193 | covered |
| `verified` | §3 | 12-29 | covered（无测试） |
| `remediation` 5 分支 | §3 | 51-82 | covered（无测试） |
| 三函数主流程 | §3 | 84-193 | covered（无测试） |
| 实际接入 | §10 | — | unknown |
