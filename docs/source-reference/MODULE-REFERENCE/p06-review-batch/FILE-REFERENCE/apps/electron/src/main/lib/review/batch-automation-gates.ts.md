---
path: apps/electron/src/main/lib/review/batch-automation-gates.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 92dd2e5062d6d890c2bc3eff14f179463dd6951e
sha256: 0bd8d278d43de1fe4eab0837192d970416e9c6698d9543bb1be372a931281d87
lines: 133
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/batch-automation-gates.ts

## 1. 结论与边界

单案自动化资格的保守门（文件头 `:1-4`）：在既有单案事务内可重跑、不写任何业务数据——`checkAutoBatchAction` 对“自动通过/自动退回”逐项检查批次授权、模板一致性、批次成员终态、案卷阶段、补件/申诉、单阶段归属、评分/逐事项边界、他角色待办、分流匹配、政策确认规则集、Run 计划一致性、本轮读取覆盖与证据定位，任一不满足即 `blocked` 并给用户可见理由；通过时产出补件要素与理由文案。纯读函数 + `getSettings/getPolicy` 查询。

不做的事：不落盘、不做决定（由 `workspace-business-service-v2.assertAutomatedWorkspaceDecision` 在事务内调用本门）；不校验 Run 新鲜度（调用方负责）；不实现规则编译（`policy-store.compiledRules` 已固化）。

## 2. 导出与关键符号

导出 3 项：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AutoAction` | type | `:10` | `'pass' \| 'return'` |
| `AutoGate` | type | `:11` | `{allowed:true; requiredElements[]; reason}` 或 `{allowed:false; reason}` |
| `checkAutoBatchAction` | function | `:33-133` | `(state, aggregate, run, template, action, observations=[]) => AutoGate` |

内部：`blocked(reason)`（`:13`）、`confirmedRules(template, batch)`（`:15-31`，政策→规则集解析，失败返回 null）。

## 3. 内部逻辑与关键流程

`checkAutoBatchAction` 顺序（全部 fail-closed）：

1. **授权模式**（`:41-43`）：无 automation、`assist`、或 `pass` 但非 `auto-approve` → “本批次未授权此类自动处理”（`auto-return` 模式只许 return，`:42`）。
2. **批次状态**（`:44`）：`finalized`/`running` → “批次仍在运行或已定稿”。
3. **授权与批次匹配**（`:45-46`）：automation 的 templateId/Version 必须匹配 batch 且 `grantedAt` 存在、`grantedBy==='local-reviewer'`，否则“授权策略与批次不匹配”。
4. **模板与案卷**（`:47-48`）：template published、案卷模板 id/version 与批次一致。
5. **批次成员终态**（`:49-50`）：`state.cases` 须有 `{caseId, status:'done'}`（“当前案卷还没有完成批次检查”）。
6. **案卷阶段**（`:51-52`）：`awaiting-supplement/decided/archived` → “案卷已经在补件或正式决定阶段”。
7. **补件/申诉**（`:53-56`）：任一 `open/responded/insufficient` 补件或 `in-review/submitted` 申诉 → 阻断。
8. **单阶段归属**（`:58-62`）：须恰 1 阶段、非校方、无 `requiredApprovers>0`、`executorRole ∈ {reviewer, system}`，否则“存在多阶段、校方归属或人工审批门槛”。
9. **评分/名额/逐事项**（`:63-64`）：`template.rubric?.quota !== undefined || template.rubric || subjects.length>0` → “评分、名额或逐事项认定不允许由批次规则跳过”。
10. **他角色待办**（`:65-66`）：存在 open 任务且 `assigneeRole ∉ {reviewer, system}` → “存在其他角色的未办任务”。
11. **分流匹配**（`:68-73`）：`triageBatchCase({caseId, entryStatus:'done', caseStage, batch, run})` 的 route 必须恰为 `action==='pass' ? 'auto-pass-candidate' : 'auto-return-candidate'`，否则“审核运行未满足本动作的自动分流条件”。
12. **规则集** `confirmedRules`（`:15-31`）：模板 `policyRefs`（带 contentHash）或 legacy `policyVersionIds`（hash 空，`:17`）；refs 数量须等于批次 `policyVersionLock` 且逐项 id/version 匹配（`:18/:21`）；`getPolicy` 取回须 published、hash 一致（有 hash 时）、有 confirmations、有 compiledRules（`:23-24`）；规则须有 id、无重复、`confirmation==='confirmed'`、有 `sourceRefIds`（`:26`）；任一失败返回 null。
13. **规则/计划一致性**（`:75-82`）：`rules` 非 null、`effectiveRuleIds` 非空且都在规则集、每条 check.ruleId 在规则集、`coverage.completedChecks===plannedChecks`、`checks.length===plannedChecks`、每个 effectiveRuleId 至少有一条 check——否则“政策规则未完整发布确认，或本轮检查与规则计划不一致”。
14. **本轮读取覆盖**（`:84-90`）：每个 `active!==false` 且 `unusedReason` 非 `[审核员忽略]` 开头的文档，必须在 `run.coverage.documents` 有 `status==='read'` 的本轮记录；历史 `usage:'read'` 不算（`:84-85` 注释），否则“本轮审核运行未覆盖全部有效材料，不得自动处理”。
15. **证据定位**（`:91-99`）：每条 check 的每条 sourceRef 须 `caseId===aggregate.caseV2.id` 且匹配 active 文档 `versionId+parseRevision` 且该文档 `parseStatus==='parsed' || manualReadReceipt`；“非空数组+伪造 versionId 不是证据”（`:91-92` 注释），否则“检查引用的证据不属于当前有效案卷材料或尚未正确读取”。
16. **pass 专属**（`:101-111`）：全局 `reviewAgentAutoApproval===true`（否则“全局自动审批授权已撤销”）；`autoPassPolicy.enabled===true` 且无 `conditions`（“模板未明确开启可评估的自动通过策略”）；`singleStage.kind ∈ {auto-check, finalize}`（“当前模板阶段必须人工审核”）；全部 check `status ∈ {compliant, not-applicable}` 且 `executedBy==='semantic'` 的必须有 sourceRefs（“存在不合规检查或语义检查缺少证据”）；`assessDecisionReadiness({aggregate, run, runStale:false, template, observations})` 必须 ready（“业务审批尚有阻断：…”取前 2 个 blocker，`:109-110`）；通过返回 `{allowed:true, requiredElements:[], reason:'有效规则检查全部符合且完成业务门槛校验，按批次已授权策略自动通过'}`（`:111`）。
17. **return 专属**（`:114-116`）：`needs = checks.filter(status==='awaiting-supplement')`；`needs` 为空或存在 `status ∉ {awaiting-supplement, compliant, not-applicable}` 的检查 → “存在不能自动补正的检查”。
18. **补件构建**（`:117-132`，仅 return）：每条 `needs` 的规则须 `onFail==='supplement'`、`requirement` 非空 ≤400 字、sourceRefs 定位有效（同 15），否则“补件规则未明确授权或检查缺少有效证据定位”；要素文案 `请提供能够证明以下要求的材料：{requirement}` 去重（`:128-129`）；reason 汇总 `根据已确认规则，需补充核实：{检查 reason 用 ；连接}`（`:131`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| 工作台业务事务 | `workspace-business-service-v2.ts:258` | `checkAutoBatchAction`（`assertAutomatedWorkspaceDecision` 事务内，校验 `batch-auto:*` 系统 actor 的动作与理由/要素一致） |
| 自动化服务 | `batch-automation-service.ts:12` | 逐案先过本门再调 `decideWorkspaceCaseV2` |
| 测试 | `batch-automation-service.test.ts:267/:286` | 直接调用门（本轮读取/规则去重负例） |

出向：`@profer/shared.assessDecisionReadiness`（`:5`，`:109` 调用）、`triageBatchCase`（`:68`）、`getSettings`（`:102`）、`getPolicy`（`:22`）。

## 5. 数据 I/O、读写与副作用

只读：`getSettings()`/`getPolicy()` 查询，无写盘/网络/日志。输出为新对象；同输入同输出（幂等）。无并发问题（不共享可变状态）。

## 6. 分支、失败、取消与恢复

全部为 `blocked` 返回而非 throw；无异步、无取消、无恢复概念。分支清单见 §3 的 18 步；pass/return 差别集中在 `:42`（授权）、`:72`（route）、`:101-116`（pass 专属校验 / return 补件构建）。

## 7. 权限与权威状态

- **授权语义**：`policy.grantedBy==='local-reviewer'`+`grantedAt` 是本地人工授权痕迹（`:46`）；pass 还要求全局 `reviewAgentAutoApproval` 与模板 `autoPassPolicy`（无附加 conditions）（`:102-104`）。
- **权威状态**：批次授权锁在 `BatchStateV2.automation`；规则集权威在 `policy-store` published policy（contentHash 比对）；读取/证据权威在 `run.coverage`/`check.sourceRefs` 与聚合文档逐条比对。
- **fail-closed**：缺任何证据（规则、本轮读取、来源定位、业务就绪）都拒绝；评分/名额/逐事项不许批次自动化跳过（`:63-64`）。

## 8. 修改影响面

- 改门逻辑 → 影响自动通过/自动补件准入与 `workspace-business-service-v2` 代批校验；测试 `batch-automation-service.test.ts` 13 例（多经 `runBatchAutomation` 间接）+ 2 例直接门测试。
- 改 `confirmedRules` → 联动 `policy-store` 与 `batch-store.resolvePolicyVersionLock`。
- 需同步：`batch-automation-service.test.ts`。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `batch-automation-service.test.ts` 2 例直接调门：

- `:255-270`：`run.coverage.documents` 清空后 `checkAutoBatchAction(...,'pass')` → `allowed:false`、reason 含“全部有效材料”——历史 `usage:'read'` 不算本轮读取（对应 `:84-90`）。
- `:272-288`：effectiveRuleIds 两条但 checks 重复同一条（coverage 计数凑齐）→ `allowed:false`（对应 `:75-82` 的逐 ruleId 覆盖）。

其余分支经 `runBatchAutomation` 间接：默认 assist 不能自动（`:112-120`）、无来源证据阻断（`:168-175`）、伪造 sourceRefs 阻断（`:203-217`，对应 `:91-99`）、输入变更拒旧运行（`:219-235`）、授权撤销后 blocked（`:156-166`，对应 `:102`）、混合分流（`:290-311`）、补件要素文案含“证明申请资格”（`:139`，对应 `:128`）。**未覆盖**：`:58-66`（多阶段/校方/评分名额/他角色待办——组动作测试 `batch-group-action-service.test.ts:208-225` 走的是另一服务的同名文案）、`conditions` 模板拒绝、semantic 缺来源拒绝、`awaiting-*`/execution 状态的 return 负例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 门只读、可重跑、fail-closed | 已证实 | 文件头 `:1-4`；全函数无写 |
| 历史 `usage:'read'` 不替代本轮读取；`[审核员忽略]` 豁免 | 已证实 | `:84-90`；测试 `:255-270` |
| 规则/计划一致性按 ruleId 逐条核对 | 已证实 | `:75-82`；测试 `:272-288` |
| 伪造 versionId 不是证据（须 parsed 或 manualReadReceipt） | 已证实 | `:91-99`；测试 `:203-217` |
| pass 须全局授权+模板 autoPassPolicy（无 conditions）+auto-check/finalize 阶段 | 已证实（代码） | `:101-108` |
| `assessDecisionReadiness` 在 pass 末端把关 | 已证实 | `:109-110` |
| return 补件要素由确认规则 requirement 拼装 | 已证实 | `:117-132`；测试 `:139` |
| 评分/名额/逐事项与他角色待办阻断 | 已证实（代码）/未知（测试） | `:63-66` |
| `confirmedRules` legacy 无 hash 分支 | 已证实（代码） | `:17` |

## 11. 覆盖表

| 分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 授权模式/状态/匹配 | 3.1-3.3 | `:41-46` | covered（间接） |
| 模板/成员/阶段/补件/申诉 | 3.4-3.7 | `:47-56` | covered（间接） |
| 单阶段/评分名额/他角色 | 3.8-3.10 | `:58-66` | unknown（测试） |
| 分流匹配 | 3.11 | `:68-73` | covered（间接） |
| `confirmedRules` | 3.12 | `:15-31` | covered（间接） |
| 规则/计划一致性 | 3.13 | `:75-82` | covered |
| 本轮读取/证据定位 | 3.14-3.15 | `:84-99` | covered |
| pass 专属 | 3.16 | `:101-111` | covered（间接） |
| return 补件构建 | 3.17-3.18 | `:114-132` | covered |
