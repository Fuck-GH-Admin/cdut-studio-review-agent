---
path: packages/shared/src/review/decision-readiness-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3be63f15fe6db4c7a10c5d08f1afc5d56c933f19
sha256: c0787dd531c392ce39f44c4e16b9bf8da619da04444a957897d69bc369d44918
lines: 154
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/review/decision-readiness-v2.ts

## 1. 结论与边界

V2 案卷「最终决定就绪」的单一判定器：`assessDecisionReadiness` 对照案卷聚合（`CaseAggregateV2`）、当前审核运行（`ReviewRunV2`）与模板（`TemplateVersion`），产出 `{ready, blockers[]}`；`ready` 仅当 blockers 为空。它是本地正式决定（pass/partial-pass）的业务门槛实现，被主进程业务服务与渲染层视图模型共用。纯函数、无 I/O（`packages/shared/src/review/decision-readiness-v2.ts:1-154` 全文逐行）。

边界：

- 不做决定、不写状态；只枚举阻断原因（`DecisionBlockerKind` 9 类，`:3-12`）。
- 不判定「运行是否当前」——`runStale` 由调用方传入（`:39`），本文件只消费该布尔。
- 不重新解析材料、不验证签名；只对账「已有记录」（dispositions、evidenceLinks、supplements、adjudications、coverage）。
- 与 `packages/shared/src/review/batch-review-triage.ts` 的 `validateBatchRun` 口径差异：此处运行状态接受 `'completed'` 与 `'partially-completed'`（`:44`），triage 只接受 `'completed'`（`batch-review-triage.ts:72`）——真实实现差异，照实记录。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DecisionBlockerKind` | type | 3-12 | `'stale-run'\|'unresolved-check'\|'unconfirmed-fact'\|'candidate-evidence'\|'missing-material-slot'\|'open-supplement'\|'missing-adjudication'\|'unread-material'\|'zero-effective-rules'` | 9 类阻断 |
| `DecisionReadiness` | interface | 14-17 | `{ready: boolean; blockers: Array<{kind: DecisionBlockerKind; id?: string; message: string}>}` | |
| `isDecisionRelevantObservation` | function | 22-27 | `(run: ReviewRunV2, fieldKey: string) => boolean` | 事实是否被有效规则依赖 |
| `assessDecisionReadiness` | function | 35-154 | `(input: {aggregate: CaseAggregateV2; run: ReviewRunV2 \| null; runStale: boolean; template?: TemplateVersion \| null; observations?: Array<Record<string, unknown>>}) => DecisionReadiness` | 主判定 |

关键内部符号：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `ACTIONABLE_CHECK_STATUSES` | 19 | `{non-compliant, awaiting-supplement, awaiting-confirmation, not-executed, execution-failed}` |
| `ACTIVE_SUPPLEMENT_STATUSES` | 20 | `{open, responded, insufficient}` |
| `currentAdjudicatedSubjectIds` | 29-33 | 当前运行+当前输入哈希下未被 supersede 的认定所覆盖的 subjectId 集合 |

导出计数：type 2 + function 2；内部 const 2 + function 1。

## 3. 内部逻辑与关键流程

### 3.1 `isDecisionRelevantObservation`（`:22-27`）

`run.inputManifest.effectiveRuleDependencies` 缺失（legacy 运行）→ 返回 `true`（注释：fail safely until a fresh run records them，`:24-25`，即旧运行的一切事实都视为相关、更易阻断）。存在时：任一 dependency 的 `fieldKeys` 含 `'*'` 或含 `fieldKey` → true。

### 3.2 `currentAdjudicatedSubjectIds`（`:29-33`）

`aggregate.adjudications ?? []`；被 `supersedesAdjudicationId` 指向的记录作废；保留 `basedOnRunId === run.id && inputHash === run.inputManifest.hash` 的记录；返回其 `subjectId` 集合。即「认定必须绑定本运行与本次输入哈希」。

### 3.3 `assessDecisionReadiness`（`:35-154`）按序累积 blockers

1. `:44-47` `!run || runStale || run.status ∉ {'completed','partially-completed'}` → `stale-run`（id=run?.id）；随后 `!run` 直接返回 `{ready:false, blockers}`（`:47`）。
2. `:49-50` `effectiveRuleCount = effectiveRuleIds?.length ?? coverage.plannedChecks`；为 0 → `zero-effective-rules`。
3. `:51-53` `completedChecks < plannedChecks` → `unresolved-check`（id `coverage:missing-results`，消息含缺多少项）。
4. `:55-69` 逐 actionable 检查：倒序找最新同 `(findingKey=checkId, runId, inputHash)` 的 disposition（`:57-58`）；无记录或 `disposition==='escalated'` → `unresolved-check`（`:59-62`）；`disposition==='supplement-requested'` 时查 `originFindingKeys.includes(checkId)` 的补件：不存在或任一在 `ACTIVE_SUPPLEMENT_STATUSES` → `unresolved-check`（`:63-68`）。
5. `:71-98` 证据引用归属校验（注释：结论引用必须落在本案、当前原件版本）：
   - `:76-79` `check.target.scope !== 'case'` 且 target subjectIds 有不在本案的 → `unresolved-check`（引用案卷之外的申报事项）。
   - `:80-88` 合并 `check.sourceRefs` 与 `check.basis?.sourceRefs`；每 ref：`caseId` 不符 / 文档不存在 / `active === false` / `parseRevision` 不等 → `unresolved-check`（材料引用不属于当前案卷或已过期）。
   - `:89-96` `scope==='subject' && document.role==='evidence'` 且首次见该 versionId：`evidenceLinks` 中 `confirmed` 的归属者集合非空且与 target subjects 无交集 → `unresolved-check`（证明已归属其他事项）。
6. `:100-113` 事实确认：`observations` = `aggregate.observations` + `input.observations`（`:100`）；`manuallyConfirmed` 取 `confirmed===true && extractedBy==='user'` 的 `subjectId::fieldKey` 键（`:101-102`）；逐 observation：`confirmed===true` 或 `extractedBy==='user'` 跳过（`:105`）；无 subjectId/fieldKey 或非规则相关跳过（`:108`）；同键已人工确认或已报过跳过（`:110`）；否则 `unconfirmed-fact`（`:112`）。
7. `:115-117` `evidenceLinks` 中 `status==='candidate'` → `candidate-evidence`。
8. `:119-135` 材料读取：跳过 `active===false` 与 `unusedReason` 以 `[审核员忽略]` 开头的（`:121-122`）；`readConfirmed = !!document.manualReadReceipt || (parseStatus !== 'failed' && (usage==='read' || runStatus==='read'))`（`:129-130`）——注释明确：解析失败原件即使旧 Run 误记 `read` 也必须人工打开确认（`:126-128`）；不成立 → `unread-material`（附 run coverage 的 reason，`:131-134`）。
9. `:137-142` 模板材料槽：仅 `(requiredAt ?? 'submission') === 'decision'` 的槽；有效文档计数 `< minCount` → `missing-material-slot`；`!template` → `missing-material-slot`（id `template`，`:142`）。
10. `:144-146` 活跃补件（`open/responded/insufficient`）→ `open-supplement`。
11. `:148-151` 每个 subject 必须在 `currentAdjudicatedSubjectIds` 内，否则 `missing-adjudication`。
12. `:153` `ready = blockers.length === 0`。

## 4. 调用者与调用链

出向：`import type { CaseAggregateV2, ReviewRunV2, TemplateVersion } from '../types'`（`:1`，类型桶 `packages/shared/src/types/index.ts`）；运行时零依赖。

入向（grep 全冻结树）：

- 主进程业务门槛：`apps/electron/src/main/lib/review/workspace-business-service-v2.ts:4,294-301`——`decideWorkspaceCaseV2` 对 `pass/partial-pass` 调 `assessDecisionReadiness`，不 ready 抛 `DEPENDENCY_UNRESOLVED`（`:301`）；同文件 `assertAutomatedWorkspaceDecision`（`:270-271` 上文）另核自动化一致性。
- 批量自动处理门槛：`apps/electron/src/main/lib/review/batch-automation-gates.ts:5,109-110`（pass 动作前）；批量人工处置 final-pass 预检：`apps/electron/src/main/lib/review/batch-group-action-service.ts:9,150-153`。
- 渲染层视图模型：`apps/electron/src/renderer/components/content-review/review-workspace-view-model.ts:1,3,87,211`（`isDecisionRelevantObservation` 于 `:87` 过滤抽取事实，`assessDecisionReadiness` 于 `:211`）。
- 间接测试（不在本批）：`apps/electron/src/main/lib/review/decision-readiness-v2.test.ts:2`（12 个 test，见 §9）、`apps/electron/src/main/lib/review/workspace-business-service-v2.test.ts:4,182`。
- 同名注意：`apps/electron/src/main/lib/review/review-v3-t05-main-service.ts:329` 的 `t05DecisionReadiness` 是 T05 自有函数，不导入本文件（grep 验证）。

## 5. 数据 I/O、读写与副作用

无。只读输入对象并构造新数组；不修改入参（`blockers` 为局部数组）。无缓存、无全局状态、无日志。

## 6. 分支、失败、取消与恢复

- 不抛异常、不返回错误码；一切「失败」编码为 blockers。`ready:false` 是唯一拒绝形态。
- `:47` 提前返回点唯一（run 缺失时不再评估其余门槛）。
- 无取消/恢复概念（同步纯函数）。「恢复」语义在数据层：disposition/supplement/adjudication 的补录会解除对应阻断（`§3.3` 各条），调用方重跑本函数即重算。
- 静态可观察的边界：`:57-58` 倒序查找假设 `dispositions` 按时间追加（数组序即时间序）；若调用方乱序追加可能取到非最新 disposition——推断（见 §10）。

## 7. 权限与权威状态

无权限分支（依据：全文无 actor/role/sender 检查）。权威状态由**数据来源**区分：人工确认事实看 `extractedBy==='user' && confirmed===true`（`:101-102,105`），Agent 读取证明看 `run.coverage.documents`（`:124-125` 注释），认定权威看 `adjudications` 的 run/hash 绑定（`:29-33`）；本文件只对账不产生。`template` 缺失本身即阻断（`:142`），不静默按无要求通过。

## 8. 修改影响面

- 改任一 blocker 判定：直接影响 `workspace-business-service-v2.ts:301`（正式决定是否抛错）、`batch-automation-gates.ts:110`（自动通过门槛）、`batch-group-action-service.ts:152`（final-pass 预检文案取 blockers 前两条）。
- `DecisionBlockerKind` 增删值：影响 `review-workspace-view-model.ts` 的渲染分类与外部测试断言（`decision-readiness-v2.test.ts` 按 kind 断言）。
- `isDecisionRelevantObservation` 语义变化影响未确认事实数量（`:108`）。
- 与 `batch-review-triage.ts` 的状态口径差异（`partially-completed`）若要统一，须两文件与双方测试同步。

## 9. 测试证据

本批**无**直接测试文件（SCOPE 18 文件中无 `decision-readiness-v2.test.ts`）。间接证据（外部测试，未逐条核实现细节，仅列真实存在与断言行）：

- `apps/electron/src/main/lib/review/decision-readiness-v2.test.ts`（12 个 `test(`，断言如 `:26-27` blockers kinds 含 `missing-adjudication/unconfirmed-fact/unread-material`、`:38` 全就绪 `{ready:true,blockers:[]}`、`:49` 解析失败材料历史 read 不解除 `unread-material`、`:60-61` 运行账本误写 read 仍阻断、`:73` 他案材料引用 → `unresolved-check`、`:89` 证明归属他事项 → `unresolved-check`、`:100` 人工核对原件后解除、`:111` `[审核员忽略]` 豁免、`:123` 部分读取带 reason、`:132` 非规则相关事实不阻断、`:137` `zero-effective-rules`、`:146-147` `coverage:missing-results`）。
- `apps/electron/src/main/lib/review/workspace-business-service-v2.test.ts:182`（经业务服务间接调用）。

未覆盖（静态推断）：`candidate-evidence` 与 `open-supplement` 的独立单测断言未在上述 grep 片段出现（可能在其它行，未逐行核——记 UNKNOWN 而非「无」）。

**NOT_RUN**：本轮未执行任何测试；以上仅为静态读到的断言行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数、无 I/O、无 throw | 已证实 | 全文 `:1-154`，仅 type import（`:1`） |
| 运行状态接受 `completed`/`partially-completed` | 已证实 | `:44` |
| legacy 运行（无 `effectiveRuleDependencies`）一切事实判相关 | 已证实 | `:23-26` |
| 认定必须绑定 run.id + inputHash、supersede 链排除旧认定 | 已证实 | `:29-33` |
| 解析失败材料只有 `manualReadReceipt` 解除未读阻断 | 已证实 | `:126-130`；间接测试 `:52-61,92-100` |
| `[审核员忽略]` 前缀豁免未读阻断 | 已证实 | `:122`；间接测试 `:103-111` |
| 证据归属他事项 → 阻断 | 已证实 | `:89-96`；间接测试 `:76-89` |
| `!template` 阻断 | 已证实 | `:142` |
| `dispositions` 数组序=时间序的倒序查找前提 | 推断 | `:57-58`；数据层追加约定未在本文件声明 |
| `effectiveRuleIds` 缺失时以 `plannedChecks` 兜底计数 | 已证实 | `:49` |
| `candidate-evidence`/`open-supplement` 是否有直接单测 | 未知 | 外部测试未逐行核（非本批文件） |
| 真实案卷数据下的 blocker 分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DecisionBlockerKind`/`DecisionReadiness` | §2 | 3-17 | covered |
| `isDecisionRelevantObservation` | §3.1 | 22-27 | covered |
| `currentAdjudicatedSubjectIds` | §3.2 | 29-33 | covered |
| `assessDecisionReadiness` 12 步 | §3.3 | 35-154 | covered |
| 读取/认定/事实/证据四类权威状态 | §7 | 55-151 | covered |
| `dispositions` 时序前提 | §6 | 57-58 | partial（推断） |
| 外部测试逐条断言 | §9 | 间接 | partial（非本批，列行为止） |
