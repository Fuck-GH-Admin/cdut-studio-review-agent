---
path: apps/electron/src/main/lib/review/review-v3-t05-main-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 98e3332f52785dd8ed7b4ba855ff8b175e4814f6
sha256: 7244be5c366a78d0b913f6736fd9a2375a5adb70438fbc0f1c17b8ae258ffb5f
lines: 517
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t05-main-service.ts

## 1. 结论与边界

T05 的 Main 可信桥接层：只读能力投影 `readT05StageCapability`（渲染层只展示、不构成授权）与写入 `recordT05StageDecision`（重核身份/角色/模板/expectedRevision/任务/当前 Run/动作适格 + T03 严门禁后，在**唯一 CaseAggregate 事务**里落地 T05 纯领域提案）。同时提供可信业务模式解析（D2：local-business vs technical-pre-review）、Run 权威判定与按动作适格判定。运行时模块，含聚合事务、Run 存储读取与**进程内**业务确认登记。

不做的事：不自造 `run@rev` 伪 Run ID；不接受渲染层自称的 role/runId/businessMode；不把 Run 完成当业务通过；不冒充学校审批（`local-teacher` 只是本机模拟，`:36-45`）；不实现领域规则（`review-v3-t05-local-stage-plan`）与 T03 门禁（`review-v3-core-t03-run-gate`）。

## 2. 导出与关键符号

导出 24 项（function 15、type/interface 8，另有尾部 1 个 re-export type 含 2 名）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T05LocalRole` | type | `:34` | `'reviewer'\|'teacher'` | 本机两个具名角色 |
| `T05RoleClaim` | interface | `:48` | `{role?: string}` | 渲染层只能声明角色 |
| `deriveT05LocalActor` | function | `:51-54` | `(claim?) => Actor` | 非法角色降级 reviewer，不提权 |
| `T05BusinessMode` | type | `:59` | `'local-business'\|'technical-pre-review'` | 业务模式 |
| `T05LocalBusinessConfirmation` | interface | `:68-77` | `{caseId; planFingerprint; templateId; templateVersion; confirmedBy; confirmedAt; reason}` | 本地业务发布确认 |
| `registerT05LocalBusinessConfirmation` | function | `:83-91` | `(record) => void` | 登记确认（拒绝 `school-authorized`、缺指纹） |
| `readT05LocalBusinessConfirmation` | function | `:94-96` | `(caseId) => record \| undefined` | 读确认 |
| `clearT05LocalBusinessConfirmations` | function | `:99-101` | `() => void` | 测试清理（生产不应调用） |
| `resolveT05BusinessMode` | function | `:112-134` | `(aggregate) => {mode; reason}` | D2 模式解析（fail closed） |
| `isLocalBusinessCase` | function | `:137-139` | `(aggregate) => boolean` | 兼容旧调用点 |
| `currentT05Run` | function | `:151-153` | `(aggregate) => ReviewRunV2 \| undefined` | 当前有效 Run |
| `readT05RunAuthority` | function | `:163-169` | `(aggregate) => RunAuthorityDecision` | Run 权威判定 |
| `isT05DiagnosticRun` | function | `:172-174` | `(run) => boolean` | 模板/诊断 Run 隔离 |
| `isT05RunStale` | function | `:177-179` | `(aggregate, runId) => boolean` | 新鲜度透传 |
| `t05ActionEligibility` | function | `:215-326` | `(aggregate, run) => T05ActionEligibility` | 按动作适格判定 |
| `t05DecisionReadiness` | function | `:329-334` | 同上取 readiness/blockers | 兼容旧名 |
| `readT05StageCapability` | function | `:353-386` | `(caseId, claim?) => T05StageCapability` | 只读能力投影 |
| `recordT05StageDecision` | function | `:404-506` | `(input) => Promise<{ok:true; revision; proposal; …}>` | 唯一写入口 |
| `readT05TaskSummary` | function | `:509-515` | `(caseId) => Array<{id;stageId;role;status}>` | 任务摘要 |

接口：`T05ActionEligibility`（`:185-197`）、`T05StageCapability`（`:338-351`）、`T05StageCommandInput`（`:390-402`）；`T05StageAction = T05LocalStageAction`（`:183`）；尾部 re-export `T05LocalStageAction/T05StageProposal`（`:517`）。

内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `LOCAL_ACTORS` | `:42-45` | `local-reviewer` / `local-teacher`（local 来源） |
| `localBusinessConfirmations` | `:80` | `Map<caseId, T05LocalBusinessConfirmation>`（进程内） |
| `T05_RESOLVING_DISPOSITIONS` | `:199-201` | `{human-confirmed-compliant,false-positive,waived,confirmed-issue}` |

## 3. 内部逻辑与关键流程

### 3.1 身份派生 `deriveT05LocalActor`（`:51-54`）

`claim.role==='teacher'` 才给 `local-teacher`；**其余一律 `local-reviewer`**（含 `superadmin` 等自称，测试 `review-v3-t05-main-service.test.ts:28`）。`local-teacher` 明示“非学校授权，无校方审批效力”（`:36-41`）。

### 3.2 业务模式 `resolveT05BusinessMode`（`:112-134`）

1. `d2RuntimePlan` → `technical-pre-review`（“D2 技术预审案卷不具备正式业务决定权”）。
2. `canonicalPlan` → 需 `localBusinessConfirmations` 有本案记录，且 `planFingerprint===canonicalPlan.fingerprint`、`templateId/templateVersion` 与案卷一致，逐项 fail closed（缺确认/指纹不符/模板不符 → `technical-pre-review` 且 reason 区分）；全匹配 → `local-business`。
3. 无计划 → `local-business`（“模板绑定的本地业务案卷”）。

`registerT05LocalBusinessConfirmation`（`:83-91`）：`confirmedBy` 仅接受 `local-organizer`（`school-authorized` → `INVALID_TRANSITION('学校授权模式不在本地能力范围内')`）；`planFingerprint` 必填；写入进程内 Map。**注意**：冻结树检索 `apps/electron/src/**` 与 `packages/**`（含测试），该函数的调用者**只有** `review-v3-t05-business-mode.test.ts:86/:95`——生产代码（含注释所称“Phase 2 由 Plan 安装事务写入”）在冻结树中**没有任何调用点**。因此生产路径下带 `canonicalPlan` 的案卷恒被判 `technical-pre-review`（分支 2 的 local-business 达成条件目前不可达）。照实记录，不理想化。

### 3.3 Run 权威（`:141-179`）

`currentT05Run`/`readT05RunAuthority` 转调 `review-runtime-contract.resolveCurrentBusinessRun({aggregate, runs: listRunsV2(caseId), stale: run => isWorkspaceRunStaleV2(aggregate, run.id)})`（`:163-169`），复用既有新鲜度（`inputManifest.hash`、`documentVersions` 顺序回退、补件回复后失效；`:143-150` 注释明确修复了此前误读 `inputManifest.documents`）。`isT05DiagnosticRun = !isCurrentBusinessRun(run)`（`:171-174`）：`run-tpl-*`、`run-diag-*`、`run@rev*` 均属诊断/占位，不得冒充当前审核（测试 `review-v3-t05-main-service.test.ts:109-114`）。

### 3.4 适格判定 `t05ActionEligibility`（`:215-326`）

- 无 run（`:225-240`）：`readiness:'blocked'`；仅 `return-for-supplement` 允许；其余动作带“没有与当前原件一致的有效审核运行”原因。
- 有 run 时累计 blockers（`:242-300`）：
  1. `run.coverage.plannedChecks` 非安全正整数或 `checks.length < plannedChecks` → “缺少有效检查计划或结果覆盖不足”（`:245-248`）。
  2. `run.coverage.documents` 中 `status!=='read'` 的数量 → “N 份原件缺少完整读取或人工核对回执”（`:250-251`）。
  3. `inputManifest.effectiveRuleIds` 逐项核对 checks 的 `ruleId` 覆盖，缺项 → “计划覆盖不足：N 条规则没有检查结果”（`:254-261`）；`coverage.planned/missing` 记录。
  4. 处置只认绑定本 run 的（`!item.runId || item.runId===run.id`，`:265-268`）；`awaiting-confirmation/awaiting-supplement` 检查若无 `T05_RESOLVING_DISPOSITIONS` 处置 → “N 项检查仍待确认或待补件”（`:273-278`）。
  5. `execution-failed` / `not-executed` 各自计数阻断（`:280-284`）。
  6. 未结补件（open/responded/insufficient）→ 阻断（`:286`）。
  7. `non-compliant` 检查：进入 `nonCompliant` 列表；若无 `waived` 或 `human-confirmed-compliant` 处置 → “存在未解释的非合规项：<check.reason||通用文案>”（`:289-300`，用户文案取检查 reason 而非 checkId）。
- 汇总（`:302-325`）：`ready = blockers.length===0`；`runUsable = !stale && inputManifest.hash` 存在；`completed = run.status==='completed'`（RUN-05：`partially-completed` 只能拒绝/退回）；`allowed`：`stage-pass = ready && runUsable && completed`、`final-reject = runUsable`、`return-for-supplement = true`、`return-to-previous-stage = runUsable`。

### 3.5 能力投影 `readT05StageCapability`（`:353-386`）

`readAggregate` 缺失 → `NOT_FOUND`；`mode` + `deriveT05LocalActor(claim)`；`eligibleTaskIds` = open 且 role/assigneeActorId 匹配的任务；`run = readT05RunAuthority().run`；`t03 = run ? assessStagePassWithT03(...) : undefined`；`allowedActions` 仅 `local-business` 时给出（`stage-pass` 还须 `t03.allowed`），技术预审为空数组；`actorLabel` 教师为“本地终审教师（模拟，非学校授权）”（`:374`）；blockers 合并 `eligibility.blockers` 与 T03 去重后的 blockers（`:381-384`）。

### 3.6 写入 `recordT05StageDecision`（`:404-506`）

`actor = deriveT05LocalActor(input.claim)`（`:406`）；`submitCommand`（type `RecordTrustedStageDecision`、`expectedRevision`、`requestId`）handler（`:416-492`）：

1. `resolveT05BusinessMode` 非 local-business → `INVALID_TRANSITION('…不可办理正式业务阶段…')`（`:417-420`）。
2. 案卷模板 id/version 与 payload 一致（`:421-423`）；`getTemplate` 存在且 published（`:424-427`）。
3. `currentT05Run` + `t05ActionEligibility`；动作不允许 → `INVALID_TRANSITION`（拼 `reasons[action]`，`:428-433`）。
4. `stage-pass` 时 T03 严门禁 `assessStagePassWithT03`（RUN-05：completed、原件版本、冻结计划指纹、CheckId×target 绑定），不通过 → `INVALID_TRANSITION`（`:434-444`）。
5. `verifiedRun` 构造（`:445-453`）：来自权威 run，`current:true`、`status` 归一为 completed/partially-completed、`decisionReadiness=eligibility.readiness`。
6. `planT05LocalStageAction`（`:456-467`）→ `applyT05LocalStageProposal`（`:476`），ids 由 Main 生成（`dec-${Date.now()}-…` 等，`:469-475`）。
7. mutate 写 `caseStage/tasks/decisions/supplements`（`:480-491`）；`.then` 把 `!result.ok` 转抛 `CommandValidationError`，`entity` 缺失抛“阶段决定已写入但未返回提案”（`:493-505`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}` 与 `packages/**`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:1006-1007` `readT05StageCapability`；`:1019-1020` `recordT05StageDecision` | 渲染层入口 |
| F13 服务 | `review-v3-f13-main-service.ts:12`、`:51-52`、`:63-64`、`:155` | `resolveT05BusinessMode`/`deriveT05LocalActor`/`currentT05Run` |
| 测试 | `review-v3-t05-main-service.test.ts`、`review-v3-t05-business-mode.test.ts` | 直接调用（含 `registerT05LocalBusinessConfirmation`） |

出向：`case-store-v2`、`template-store.getTemplate`、`run-store-v2.listRunsV2`、`workspace-business-service-v2.isWorkspaceRunStaleV2`、`review-runtime-contract.{assessStagePassWithT03,isCurrentBusinessRun,resolveCurrentBusinessRun}`、`review-v3-t05-local-stage-plan.{applyT05LocalStageProposal,planT05LocalStageAction}`（`:19-31`）。

## 5. 数据 I/O、读写与副作用

- **读**：聚合（`readAggregate`/handler 快照）、Run 存储（`listRunsV2`）、模板库。
- **写**：仅经 `submitCommand`（`RecordTrustedStageDecision`）写 `state.v2.json`。
- **进程内状态**：`localBusinessConfirmations` Map（`:80`）——**不持久化**，重启即失（注释 `:79`“重启后按需重建”，但冻结树无重建调用者）。
- **副作用**：无日志/网络/窗口；ids 含 `Date.now()+Math.random`（`:471-473`）。
- **幂等**：依赖 `requestId`（`case-store-v2`）；`verifiedRun.current` 恒为 true（`:450`），新鲜度由前置 `assertCurrentRun` 等价的 `currentT05Run`+`isWorkspaceRunStaleV2` 保证。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 确认登记 `school-authorized` | `:84-86` | `INVALID_TRANSITION` |
| 确认登记缺指纹 | `:87-89` | `VALIDATION_FAILED` |
| 聚合不存在 | `:355` | `NOT_FOUND` |
| 技术预审写入 | `:418-420` | `INVALID_TRANSITION` |
| 模板不符/未发布 | `:421-427` | `INVALID_TRANSITION`/`DEPENDENCY_UNRESOLVED` |
| 动作不允许 | `:430-433` | `INVALID_TRANSITION`（拼真实 reasons） |
| T03 门禁未过 | `:440-443` | `INVALID_TRANSITION` |
| 事务失败 | `:494` | 转抛 `CommandValidationError` |
| entity 缺失 | `:496` | `INVALID_TRANSITION` |
| 取消 | 无 | 无 AbortSignal |
| 重启 | 确认 Map 丢失 | canonicalPlan 案卷回退 technical-pre-review（`:120-123`） |

## 7. 权限与权威状态

- **身份**：渲染层只能 `T05RoleClaim`；actor 由 Main 派生且非法角色降级（`:50-54`）。`local-teacher` 非学校授权（`:36-45`）。
- **授权来源**：local-business 资格 = 已发布模板 + Main 确认记录（指纹/模板版本匹配），**不能因案卷有 canonicalPlan 自动获得**（`:61-66` 注释、`:112-134` 实现）。
- **权威状态**：Run 权威由 `resolveCurrentBusinessRun` 判定；旧 Run/诊断 Run 只读（`:155-174`）；处置绑定 runId（`workspace-business-service-v2` 侧）。
- **fail-closed**：模式解析、适格判定、T03 门禁全部“不确定即拒绝”。

## 8. 修改影响面

- 改模式解析/确认登记 → 影响 F13 服务（`review-v3-f13-main-service`）与 `recordT05StageDecision` 的业务许可。
- 改 `t05ActionEligibility` → 影响 `readT05StageCapability` 展示与写入门禁；测试 21 例（两文件）直接断言。
- 改 actor 派生 → 影响所有 T05/F13 写入的身份。
- 改 `recordT05StageDecision` 事务 → 影响任务/决定/补件账本。
- 需同步的测试：`review-v3-t05-main-service.test.ts`、`review-v3-t05-business-mode.test.ts`。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试两份：

`review-v3-t05-main-service.test.ts`（1 describe、**10 test**，内存夹具 `aggregate()`，无持久化）：actor 派生三态（`:24-29`）；`isLocalBusinessCase` 对无计划 true、D2/CanonicalPlan false（`:31-35`）；无 Run → blocked（`:37-39`）；待确认+执行失败 → blocked 且 blockers ≥2（`:41-51`）；未结补件 → blocked、含“补件”（`:53-59`）；有效处置结掉待确认但待补件/执行失败仍阻断（`:61-77`）；旧 run 处置不沿用（`:79-85`）；全通过+无补件 → ready（`:87-93`）；RUN-05 partially-completed 可 readiness ready 但 `allowed['stage-pass']===false`（reasons 含“完整结束”）、`return-for-supplement` 仍 true（`:95-107`）；RUN-07/02 诊断隔离（`run-tpl-*`/`run-diag-*`/`run@rev3` 为诊断、`run-pi-1` 非）（`:109-114`）。

`review-v3-t05-business-mode.test.ts`（2 describe、**11 test**，夹具 `PROFER_CONFIG_DIR` 临时目录、`saveRunV2` 持久化真实 Run、`computeRunInputHash` 与快照一致、`afterEach` 清确认）：D2 无计划 → local-business（`:68-70`）；d2RuntimePlan → technical（`:72-75`）；canonicalPlan 无确认 → technical（reason 含“尚未经 Main 确认”）（`:77-83`）；确认匹配 → local-business（`:85-92`）；指纹变化 → technical（reason 含“指纹”）（`:94-102`）；无 Run 仅补件可（`:106-112`）；全合规覆盖完整 → 三动作允许（`:114-120`）；non-compliant 不能 stage-pass 但可拒绝/退回（`:122-130`）；waived 例外后 ready+可通过（`:132-139`）；覆盖不足（effectiveRuleIds 缺 r2）→ `coverage.missing===['r2']`、不可通过（`:141-148`）；执行失败+未执行 → 不可通过、可拒绝/退回（`:150-159`）。

**未覆盖**：`recordT05StageDecision` 全函数（事务、T03 门禁、entity 缺失）；`readT05StageCapability` 全函数；`registerT05LocalBusinessConfirmation` 的 `school-authorized`/缺指纹拒绝；`readT05TaskSummary`；`t05DecisionReadiness` 仅间接；`partially-read`/unread 文档阻断；`return-to-previous-stage` 适格 reasons。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 非法角色降级 reviewer，不按自称提权 | 已证实 | `:50-54`；测试 main `:24-29` |
| canonicalPlan 需 Main 确认才 local-business | 已证实 | `:112-134`；测试 bm `:77-102` |
| **`registerT05LocalBusinessConfirmation` 无生产调用者**（仅测试） | 已证实 | 冻结树全检索（`apps/electron/src/**`、`packages/**`） |
| 诊断 Run 不冒充当前业务 Run | 已证实 | `:171-174`；测试 main `:109-114` |
| partially-completed 只能拒绝/退回 | 已证实 | `:305-307`；测试 main `:95-107` |
| non-compliant 未解释不得通过 | 已证实 | `:289-300`；测试 bm `:122-130` |
| waived/human-confirmed-compliant 可解释非合规 | 已证实 | `:292-293`；测试 bm `:132-139` |
| 处置只认绑定本 run 的 | 已证实 | `:264-268`；测试 main `:79-85` |
| stage-pass 追加 T03 严门禁 | 已证实 | `:434-444`（代码；测试未覆盖写路径） |
| 确认 Map 进程内、重启丢失 | 已证实 | `:79-80` |
| `readT05StageCapability`/`recordT05StageDecision` 运行行为 | 未知 | 无直接测试；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `deriveT05LocalActor`/`LOCAL_ACTORS` | 3.1 | `:34-54` | covered |
| `registerT05LocalBusinessConfirmation` | 3.2 | `:83-91` | covered（无生产调用者） |
| `resolveT05BusinessMode` | 3.2 | `:112-134` | covered |
| `isLocalBusinessCase` | 2、3.2 | `:137-139` | covered |
| `currentT05Run`/`readT05RunAuthority` | 3.3 | `:151-169` | covered |
| `isT05DiagnosticRun`/`isT05RunStale` | 3.3 | `:172-179` | covered |
| `t05ActionEligibility` | 3.4 | `:215-326` | covered |
| `t05DecisionReadiness` | 2 | `:329-334` | covered（间接） |
| `readT05StageCapability` | 3.5 | `:353-386` | covered（代码）/unknown（测试） |
| `recordT05StageDecision` | 3.6 | `:404-506` | covered（代码）/unknown（测试） |
| `readT05TaskSummary` | 2 | `:509-515` | covered（代码）/unknown（测试） |
