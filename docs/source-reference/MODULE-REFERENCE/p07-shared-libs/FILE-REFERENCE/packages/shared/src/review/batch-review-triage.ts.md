---
path: packages/shared/src/review/batch-review-triage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b3bd2c9880f8ee92e8ab3f3b8f847f3b243e25b
sha256: f652f6e95cb92aef7dbb912158ee64e2b0e2f73238b27ef06fdf482f9dc7eab9
lines: 321
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/review/batch-review-triage.ts

## 1. 结论与边界

批量审核分流（batch triage）的**只读投影**：把「批次中单个案卷的运行结果」确定性地映射为一条 `BatchTriageRoute` 建议路由，并把相同规则/状态/根因的检查结果保守归组成问题组、生成人工处置草稿与批量处置的预览/回执**类型契约**。运行时函数（`validateBatchRun` / `triageBatchCase` / `groupBatchIssues` / `prepareBatchIssueActionDraft`）全部是纯函数：无 I/O、无全局状态、不抛业务异常（`packages/shared/src/review/batch-review-triage.ts:1-10`）。

边界（`packages/shared/src/review/batch-review-triage.ts:3-9`）：

- **不记录任何业务决定**。`auto-pass-candidate` / `auto-return-candidate` 只是建议状态（advisory），`BatchTriageResult.requiresBusinessGate`（`:35`）显式提示两者仍须过业务门槛；真正的业务动作必须由工作区业务服务走当前运行、角色与 decision-readiness 门槛（消费方证据见 §4）。
- **不做模糊相似度归组**。归组键只允许「同 ruleId + 同 status + 保守归一化的同因」（`:8-9`、`:162-166`）。
- 文件后半段（`:208-321`）只有**类型**（`BatchIssueActionDraft`、`BatchGroupAction`、`BatchGroupPreview*`、`BatchGroupApplyRequest/Result`），实际持久化与写入在 `apps/electron/src/main/lib/review/batch-group-action-service.ts`（见 §4），本文件不含任何执行逻辑。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `BatchTriageRoute` | type | 13-20 | `'pending' \| 'awaiting-supplement' \| 'technical-exception' \| 'manual-review' \| 'auto-return-candidate' \| 'auto-pass-candidate' \| 'already-decided'` | 7 种路由值 |
| `BatchTriageInput` | interface | 22-29 | `{caseId; entryStatus: BatchStateV2['cases'][number]['status']; caseStage?: string; run?: ReviewRunV2; batch: Pick<ReviewBatch,'templateId'\|'templateVersion'\|'policyVersionLock'>}` | `caseStage` 注释明示「索引层当前以字符串暴露 stage，未知值 fail closed」（`:25-26`） |
| `BatchTriageResult` | interface | 31-37 | `{caseId; route; explanation; requiresBusinessGate}` | `requiresBusinessGate` 仅 auto-pass/auto-return 为 true（`:95`） |
| `validateBatchRun` | function | 60-87 | `(input: BatchTriageInput) => {valid:true; run:ReviewRunV2} \| {valid:false; reason:string}` | 「一份有效运行」统一闸门，triage 与归组共用（`:54-59`） |
| `triageBatchCase` | function | 90-135 | `(input: BatchTriageInput) => BatchTriageResult` | 主分流，保守、确定、无副作用（`:89`） |
| `BatchIssueOccurrence` | interface | 137-146 | `{caseId; runId; inputHash; checkId; ruleId; status; reason; sourceRefs}` | 一次命中的来源快照 |
| `BatchIssueGroup` | interface | 148-156 | `{key; ruleId; status; reason; caseIds:string[]; occurrences[]}` | `caseIds` 是去重案卷数（`:153-154`） |
| `groupBatchIssues` | function | 167-205 | `(inputs: BatchTriageInput[]) => BatchIssueGroup[]` | 保守归组 + 排序 |
| `BatchIssueActionDraft` | interface | 209-224 | `{groupKey; ruleId; action:'supplement-draft'\|'human-review-draft'; suggestedReason; cases[]; eligibleCount}` | 「不从组构造 auto-reject/auto-pass」（`:212-213`） |
| `prepareBatchIssueActionDraft` | function | 230-264 | `(inputs, groupKey, selectedCaseIds?) => BatchIssueActionDraft \| null` | 逐案重推导成员资格（`:226-229`） |
| `BatchGroupAction` | type | 268-269 | `'confirm-issue'\|'false-positive'\|'human-confirmed-compliant'\|'escalate'\|'request-supplement'\|'final-return'\|'final-pass'` | 显式本地人工处置动作（`:267`） |
| `BatchGroupActionRequest` | interface | 272-279 | `{batchId; groupKey; caseIds; action; reason; requiredElements?}` | |
| `BatchGroupPreviewRow` | interface | 281-291 | `{caseId; title; eligible; reason; revision; runId; inputHash; findingKey; sourceCount}` | |
| `BatchGroupPreview` | interface | 293-302 | `{previewHash; batchId; action; groupKey; eligibleCount; rows; advisoryOnly:true}` | `advisoryOnly: true` 字面量（`:300-301`） |
| `BatchGroupApplyRequest` | interface | 304-309 | `extends BatchGroupActionRequest {previewHash; operationId; confirmed:true}` | UI 须每次操作显式确认（`:307-308`） |
| `BatchGroupApplyResult` | interface | 311-321 | `{batchId; operationId; action; previewHash; results[{caseId;status:'applied'\|'excluded'\|'conflict'\|'failed';message;receiptId?}]; applied; excluded; conflicts; failed}` | |

关键内部符号（均未导出）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `HARD_FAILURES` | 39 | `CheckResult['status']` 集合：`execution-failed`、`not-executed` |
| `UNCERTAIN` | 40 | 集合：`awaiting-confirmation`、`non-compliant` |
| `ISSUE_STATUSES` | 41-43 | 集合：`non-compliant`、`awaiting-supplement`、`awaiting-confirmation`、`not-executed`、`execution-failed` |
| `hasMatchingPolicyLock` | 45-52 | 运行 manifest 的 `policyVersions` 与批次 `policyVersionLock` 双向逐对匹配（长度相等 + 每个 locked 都能在 actual 找到同 id 同 version） |
| `normalizedCause` | 158-160 | `trim → toLocaleLowerCase → 空白折叠 → 去尾部单个中英标点`（`/[。！!，,；;：:]$/u`） |
| `result()`（`triageBatchCase` 内闭包） | 91-96 | 统一构造 `BatchTriageResult`，`requiresBusinessGate` 由路由推导 |

导出计数：类型导出 10 个（`BatchTriageRoute`、`BatchTriageInput`、`BatchTriageResult`、`BatchIssueOccurrence`、`BatchIssueGroup`、`BatchIssueActionDraft`、`BatchGroupAction`、`BatchGroupActionRequest`、`BatchGroupPreviewRow`、`BatchGroupPreview`、`BatchGroupApplyRequest`、`BatchGroupApplyResult` 共 12 个 type/interface，其中 2 个含字面量字段约束）+ 函数导出 4 个（`validateBatchRun`、`triageBatchCase`、`groupBatchIssues`、`prepareBatchIssueActionDraft`）。无常量导出。

## 3. 内部逻辑与关键流程

### 3.1 `validateBatchRun`（`packages/shared/src/review/batch-review-triage.ts:60-87`）——顺序短路

1. `:61` `entryStatus !== 'done'` → `未完成当前批次的审核运行`。
2. `:62-63` 无 `run` → `标记完成但找不到审核结果`。
3. `:64-71` 五项一致性：`run.caseId === input.caseId`、`run.templateId === batch.templateId`、`run.templateVersion === batch.templateVersion`、`run.inputManifest.templateVersion === batch.templateVersion`（外层与 manifest 两处都查）、`run.inputManifest.hash` 非空、`hasMatchingPolicyLock(...)`；任一不过 → `审核结果与批次锁定的模板、政策或案卷不匹配，或输入哈希缺失`。
4. `:72` `run.status !== 'completed'` → `审核没有完整结束`（注意：`partially-completed` 在此**不算**完整结束，与 `decision-readiness-v2.ts:44` 接受 `partially-completed` 的口径不同，属两模块真实差异，见 §10）。
5. `:73-79` 覆盖度：`plannedChecks <= 0`、**存在但为空**的 `effectiveRuleIds`（`effectiveRuleIds && length===0`；字段缺失不触发）、`effectiveVerdicts <= 0`、`completedChecks < plannedChecks`、`checks.length < plannedChecks` 任一 → `检查结果不足或没有有效检查，不能按无异常通过`。
6. `:80-82` `coverage.documents` 任一 `status !== 'read'` → `仍有材料未完整读取；需核实材料覆盖范围`。
7. `:83-85` 任一 check ∈ `HARD_FAILURES` → `存在未执行或执行失败的检查`。
8. `:86` 全过 → `{valid: true, run}`。

### 3.2 `triageBatchCase`（`:90-135`）——分支顺序即优先级

1. `:98-100` stage ∈ {`decided`,`archived`} → `already-decided`（不重复自动处理）。
2. `:101-103` stage = `awaiting-supplement` → `awaiting-supplement`。
3. `:104-109` stage 非空且不在 8 个已知 stage 白名单（`:105-107`）→ `manual-review`（fail closed）。
4. `:110` entryStatus=`failed` → `technical-exception`；`:111` `paused` → `pending`；`:112` 其它非 `done` → `pending`。
5. `:114-115` `validateBatchRun` 不过 → `technical-exception`（reason 原样透传到 explanation）。
6. `:117-119` stage ∈ {`awaiting-review`,`awaiting-final`,`awaiting-rating`} → `manual-review`（要求人工认定/评分）。
7. `:120-122` 存在 `UNCERTAIN` 检查（`non-compliant`/`awaiting-confirmation`）→ `manual-review`。
8. `:123-129` 存在 `awaiting-supplement` 检查：全部 `reason.trim()` 非空 → `auto-return-candidate`；否则 `manual-review`（`补件问题缺少清晰原因`）。
9. `:130` `coverage.pendingChecks > 0` → `manual-review`。
10. `:131-133` 存在既非 `compliant` 也非 `not-applicable` 的检查 → `manual-review`。
11. `:134` 其余 → `auto-pass-candidate`（explanation 明示「正式通过还须校验事实、证据、事项认定及审批授权」）。

`requiresBusinessGate` = route ∈ {`auto-pass-candidate`,`auto-return-candidate`}（`:95`）。

### 3.3 `groupBatchIssues`（`:167-205`）

对每个 input：`validateBatchRun` 不过则跳过（`:170-171`）；`triageBatchCase` 路由必须是 `manual-review` 或 `auto-return-candidate` 才进入归组（`:174-175`，注释明示 decided/补件中/未知 stage 的旧检查不得浮现为当前待办）。遍历 `run.checks` 只取 `ISSUE_STATUSES`（`:179`）；reason 空时取字面量 `未提供具体原因`（`:180`）；归组键 `JSON.stringify([ruleId, status, normalizedCause(reason)])`（`:181-182`，注释：JSON 编码避免分隔符碰撞）。同 key 合并、`caseIds` 去重、`occurrences` 按 `(caseId, checkId)` 去重（`:188-189`）。排序：`caseIds` 数降序 → `ruleId` `localeCompare` → `key` `localeCompare`（`:203-204`）。

### 3.4 `prepareBatchIssueActionDraft`（`:230-264`）

用**当前** `inputs` 重新跑 `groupBatchIssues` 再按 `groupKey` 找组；找不到返回 `null`（`:235-236`）。`selectedCaseIds` 过滤（`:237`）。`action` 由组 status 推导：`awaiting-supplement` → `supplement-draft`，否则 `human-review-draft`（`:238`）。逐案重跑 `triageBatchCase`：supplement-draft 要求路由 `auto-return-candidate`，human-review-draft 要求 `manual-review` 才 `eligible`（`:241-245`）；每行带 `runId`/`inputHash`（取该组该案首个 occurrence，`:248-249`，非空断言）、`findingKeys`（去重 checkId）。note 文案区分 eligible（`仅供人工核对；正式操作前逐案复核当前证据、补件要素及权限`）与 ineligible（`本案存在其他阻断因素，不能套用本问题组的建议动作`）（`:252-253`）。

## 4. 调用者与调用链

出向：仅 `import type {...} from '../types'`（`:11`，类型桶 `packages/shared/src/types/index.ts`）——运行时零依赖。

入向（grep 全冻结树，全部经包根 `@profer/shared` 或相对路径导入）：

- `packages/shared/src/review/batch-review-triage.test.ts:3`（直接相对导入，本批测试，见 §9）。
- `apps/electron/src/main/lib/review/batch-store.ts:13,571`：批次状态读取侧对每案调用 `triageBatchCase({caseId, entryStatus, caseStage, batch, run})`。
- `apps/electron/src/main/lib/review/batch-automation-service.ts:8,60`：自动化策略入口取 `triageBatchCase` 路由。
- `apps/electron/src/main/lib/review/batch-automation-gates.ts:5,68-73`：自动动作门槛要求路由恰为 `auto-pass-candidate`（pass）或 `auto-return-candidate`（return），并叠加 `assessDecisionReadiness`（`:109-110`）等业务门槛——本文件的「建议」在此被消费为**必要非充分**条件。
- `apps/electron/src/main/lib/review/batch-group-action-service.ts:9-10,81,120`：`groupBatchIssues` 定位问题组（`:81-82` 失效抛错）、`triageBatchCase` 逐案过滤（`:120-123`）；`final-pass` 预检再过 `assessDecisionReadiness`（`:150-153`）；`BatchGroupApplyRequest/Result` 类型贯通 IPC（`apps/electron/src/main/lib/review/review-ipc.ts:1237-1243` → `previewBatchGroupAction`/`applyBatchGroupAction`，preload `apps/electron/src/preload/index.ts:5047-5050`）。
- `apps/electron/src/renderer/components/content-review/BatchPanel.tsx:3-4,264-275,356,413`：批量页对每案 `triageBatchCase`、`groupBatchIssues(triageInputs)`、`prepareBatchIssueActionDraft(triageInputs, openedGroupKey)`。
- `apps/electron/src/renderer/components/content-review/BatchGroupActionDialog.tsx:3`、`batch-ui-feedback.ts:1`、`batch-ui-feedback.test.ts:2`：仅用类型（`BatchGroupAction`、`BatchGroupPreview`、`BatchGroupApplyResult`、`BatchIssueGroup`、`BatchTriageRoute`）。
- 同名/近名注意：`apps/electron/src/main/lib/review/review-v3-t05-main-service.ts:329` 的 `t05DecisionReadiness` **不是**本文件符号，无调用关系。

## 5. 数据 I/O、读写与副作用

无。四个函数均为纯计算：不读写磁盘/网络/缓存/全局状态，不发事件、不写日志；输入不可变使用（`groupBatchIssues` 只读 `run.checks`，`prepareBatchIssueActionDraft` 不改输入对象）。持久化、原子写（tmp+rename）与幂等回执在消费方 `batch-group-action-service.ts:32-37,210,257`（`persist` 覆盖式写 `review-batch-operations/<digest>.json`），与本文件无代码耦合，仅类型耦合。

## 6. 分支、失败、取消与恢复

- 本文件不 `throw`、不返回错误码；所有「失败」都编码为路由（`technical-exception`）或 `{valid:false, reason}` 文案，explanation 是给 UI 的中文提示（`§3` 各条）。
- 无取消/恢复概念（纯函数无挂起操作）。消费方的崩溃恢复（`applyBatchGroupAction` 的 write-ahead 回执、中断案卷标记 `failed`）在 `batch-group-action-service.ts:182-197`，属该文件行为，不在本文件内。
- 潜在运行时异常点（静态推断）：`prepareBatchIssueActionDraft:240` `inputs.find(...)!` 与 `:248-249` `related[0]!` 用了非空断言。正常情况下 `groupBatchIssues(inputs)` 产出的 caseId/occurrence 必能在 `inputs`/`group.occurrences` 中找到（同一输入推导），`related` 至少含 1 条（该 caseId 即由此 occurrence 入组）；但若 `inputs` 含**重复同 caseId** 且运行不一致，`:240` 可能取到另一条重复项，`:248` 仍安全。此边界为推断（见 §10）。

## 7. 权限与权威状态

本文件无权限分支（依据：全文无 actor/role/sender 检查、无 I/O）。权威状态划分由文件头契约（`packages/shared/src/review/batch-review-triage.ts:3-7`）与消费方实现共同保证：本模块只产生 advisory 路由；正式处置权限（模板 `executorRole==='reviewer'` 授权、角色占位、单案事务复核）在 `batch-group-action-service.ts:106-111`、`workspace-business-service-v2.ts:274-313` 校验。`BatchGroupApplyRequest.confirmed: true`（`:308`）是类型层强制的「UI 显式确认」标记。

## 8. 修改影响面

- 改路由判定顺序/文案：影响 `BatchPanel.tsx` 分流标签与语气（`TRIAGE_LABELS`/`TRIAGE_TONES`，`BatchPanel.tsx:63-73`）、`batch-ui-feedback.ts` 的路由反馈映射。
- 改 `validateBatchRun` 门槛（如接受 `partially-completed`、`effectiveRuleIds` 缺失语义）：同时改变 triage、问题组成员和自动化门槛（`batch-automation-gates.ts:72-73`），可能放大/缩小 auto-pass 候选面，须同步复核 `batch-group-action-service` 预检。
- 改归组键或 `normalizedCause`：历史 `groupKey` 失效（`previewBatchGroupAction:82` 会抛「问题组已失效」），UI 需刷新；`previewHash`（`batch-group-action-service.ts:165-166`）含 rows，间接影响预览指纹稳定性。
- 类型改动（`BatchGroupApplyRequest/Result` 等）需同步：`review-ipc.ts:1237-1243`、`preload/index.ts:5047-5050`、`BatchGroupActionDialog.tsx`。
- 测试：`packages/shared/src/review/batch-review-triage.test.ts`（本批）与 `apps/electron/src/main/lib/review/batch-group-action-service.test.ts`（间接，不在本批）需同步。

## 9. 测试证据

直接测试 `packages/shared/src/review/batch-review-triage.test.ts`（196 行，bun:test）。夹具（`:5-33`）：`batch`（templateId 't'、templateVersion 2、policyVersionLock 单条）、`check()` 默认 `status:'compliant'`、`run()` 默认有效运行（checks 1、coverage 全 read/1/1/1/0）、`item()` 默认 `caseStage:'reviewing'`、`entryStatus:'done'`。共 **20 个 `test(`**，分 3 个 `describe`：

- `describe('批量审核分流只产生候选，不执行正式决定')`（10 个）：`:36` auto-pass 且 `requiresBusinessGate===true`；`:42` queued/running/paused → pending；`:48` decided → already-decided、awaiting-supplement → awaiting-supplement；`:53` 5 个 technical-exception 来源（plannedChecks=0、documents unread、completedChecks=0、`status:'partially-completed'`、run 缺失）；`:61` 模板/政策/caseId 不匹配 3 例；`:67` non-compliant/awaiting-confirmation → manual-review；`:72` 带 reason 的 awaiting-supplement → auto-return-candidate、空 reason → manual-review；`:77` failed/not-executed/execution-failed 分离；`:83` awaiting-final/awaiting-rating → manual-review；`:88` 未知 stage → manual-review。
- `describe('相似问题保守归组')`（7 个）：`:94` 同因归并（「缺少证明。」与「缺少证明」经 `normalizedCause` 同键，2 案 3 occurrence、caseIds `['c1','c2']`）；`:106` 同规则不同因不合并；`:112` 不同规则/状态不合并（3 组）；`:121` 回归：外层模板版本符而 manifest 版本不符 → technical-exception 且 `groupBatchIssues` 0 组；`:130` 输入哈希缺失/检查不完整/材料未读/not-executed/effectiveRuleIds 空 5 例均不入组；`:145` decided/awaiting-supplement 案卷不产生问题组；`:151` 未完成运行与版本不匹配运行不入组。
- `describe('问题组人工处置草稿不自动写入决定')`（3 个）：`:160` supplement-draft 生成、逐案 `runId`/`inputHash`/`findingKeys` 断言；`:173` 部分案卷 ineligible（同案另有 non-compliant 检查）且按 `selectedCaseIds` 过滤后 `eligibleCount===0`；`:188` 无效版本运行 0 组、`prepareBatchIssueActionDraft([invalid],'nonexistent')` 返回 `null`。

覆盖缺口（静态读得）：`human-review-draft` 动作路径（组 status 非 `awaiting-supplement`）无直接测试；`:203-204` 排序规则无断言；`prepareBatchIssueActionDraft` 的 `related[0]!`/`inputs.find(...)!` 非空断言边界无测试。间接证据：`apps/electron/src/main/lib/review/batch-group-action-service.test.ts` 经真实服务覆盖 preview/apply 与本文件类型的组合行为（不在本批，未逐条核）。

**NOT_RUN**：本轮未执行任何测试/typecheck/构建/GUI（静态阅读断言行，不代表通过）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数、无 I/O、无 throw | 已证实 | 全文逐行（`packages/shared/src/review/batch-review-triage.ts:1-321`），无 import 运行时模块（`:11` 仅 type） |
| `requiresBusinessGate` 仅 auto-pass/auto-return 为 true | 已证实 | `:91-96` |
| `validateBatchRun` 只接受 `run.status==='completed'`；`partially-completed` → invalid | 已证实 | `:72`；测试 `batch-review-triage.test.ts:57` |
| `effectiveRuleIds` 缺失不触发「零有效规则」，仅「存在但为空」触发 | 已证实 | `:73-79`（`effectiveRuleIds && length===0`）；测试 `:136`（空数组 → 不入组） |
| `normalizedCause` 去尾部单个标点、折叠空白、大小写归一 | 已证实 | `:158-160`；测试 `:94-104`（「。」差异归并） |
| 归组键含 ruleId+status+归一化原因，不同因不合并 | 已证实 | `:181-182`；测试 `:106-110` |
| 已决定/补件中案卷不产生问题组 | 已证实 | `:172-175`；测试 `:145-149` |
| 消费方把 auto-* 路由当必要非充分条件并叠加 decision-readiness | 已证实 | `batch-automation-gates.ts:68-73,109-110`、`batch-group-action-service.ts:120-123,150-153`、`workspace-business-service-v2.ts:294-301` |
| `prepareBatchIssueActionDraft` 的 `!` 断言在重复 caseId 输入下可能取错行 | 推断 | `:240,248-249` 非空断言；输入契约未显式禁止重复 caseId，无测试覆盖 |
| `validateBatchRun` 与 `decision-readiness-v2.ts:44` 对 `partially-completed` 口径不同（前者拒绝、后者接受）是真实实现差异 | 已证实 | `:72` vs `packages/shared/src/review/decision-readiness-v2.ts:44` |
| 运行时真实路由分布、`previewHash` 稳定性 | 未知 | 需真实数据运行，本轮 NOT_RUN |
| `groupBatchIssues` 对超大批次的性能 | 未知 | 无基准；纯 CPU，消费方在 UI useMemo（`BatchPanel.tsx:275`） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `BatchTriageRoute`/`BatchTriageInput`/`BatchTriageResult` | §2 | 13-37 | covered |
| `HARD_FAILURES`/`UNCERTAIN`/`ISSUE_STATUSES` | §2, §3.1-3.3 | 39-43 | covered |
| `hasMatchingPolicyLock` | §3.1 | 45-52 | covered |
| `validateBatchRun` 全部 7 段短路 | §3.1 | 60-87 | covered |
| `triageBatchCase` 全部 11 步分支 | §3.2 | 90-135 | covered |
| `normalizedCause` | §2, §3.3 | 158-160 | covered |
| `groupBatchIssues` 归组/去重/排序 | §3.3 | 167-205 | covered |
| `prepareBatchIssueActionDraft` | §3.4 | 230-264 | covered |
| `BatchGroupAction` 等 6 个类型 | §2, §4 | 268-321 | covered（类型；执行体在消费方） |
| `human-review-draft` 路径 | §9 缺口 | 238,245 | partial（无直接测试） |
| 排序规则 | §3.3 | 203-204 | partial（无测试断言） |
