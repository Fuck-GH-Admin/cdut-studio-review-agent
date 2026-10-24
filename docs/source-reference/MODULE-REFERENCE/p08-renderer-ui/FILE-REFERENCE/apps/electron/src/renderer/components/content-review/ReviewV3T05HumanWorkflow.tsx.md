---
path: apps/electron/src/renderer/components/content-review/ReviewV3T05HumanWorkflow.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 81e3466f43d7421f8feb6375c2a72a9bb02bf211
sha256: 447796c495110f9cb9903a13c341a71a1e2efbe83d3bc4bb9971a8594acb0d93
lines: 437
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T05HumanWorkflow.tsx

## 1. 结论与边界

**T05 本地人工业务流程**（`:1-5` 注释）：**Renderer 只持草稿与展示，全部持久动作经既有 reviewAPI 命令与 Main 持有的 actor/revision 边界**。端口契约：申诉三端口由 **L 持有可信 Main 注册**（`:37`）；`T05TrustedStageCapability` **只是 Main 签发的读投影，不是授权令牌**（实际命令须独立解析 actor/stage/Run `:44-48`）；**Renderer 不提供 actor 或伪造 runId**（`:67-70`）。

## 2. 导出与关键符号（8 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T05AppealSubmission`/`T05AppealReview` | interface（export） | `:16-35` | 申诉提交/复核入参（含 `confirmLocalSubmitter`（旧案卷无提交人绑定时本机确认 `:23-24`）） |
| `T05AppealPorts` | interface（export） | `:38-42` | submit/review/withdrawAppeal 三可选端口 |
| `T05TrustedStageCapability`/`T05TrustedStageCommand`/`T05TrustedStagePorts` | interface（export） | `:49-72` | 阶段能力/命令/端口 |
| `ReviewV3T05HumanWorkflow` | function（export） | `:95-437` | 主组件（§3） |

内部：`terminalSupplement`/`businessStatus`/`decisionLabel`（`:79-87`）、`parseElements`（补件要素按行/逗号去重 `:92-93`）、`effectiveDecisions/effectiveAdjudications`（**被更正/被取代者剔除** `:134-143`）。

## 3. 内部逻辑与关键流程

1. **资格边界**（`:126-161`）：**Main 授予的 eligibleTaskIds 是唯一可选集合，能力读取失败不回退旧 reviewer 命令**（`:127-131`）；技术预审 Plan 卷宗禁正式阶段决定（**:148-153 注释：CanonicalPlan 不等于纯技术语义，须 Main 显式背书 local-business**）；`getT05StageActionState` 汇总禁用原因（`:154-161`）。
2. **能力刷新**（`:182-204`）：`getT05StageCapability`（claim 仅 role，**不构造 actor** `:189-192`）；序号防陈旧（`:184/:193`）；切案/revision/角色变化作废旧快照（`:174-180`）。
3. **阶段决定**（`:222-239`）：理由必填；return-for-supplement 需要素+说明（`:225`）；`recordTrustedStageDecision`（expectedRevision `:230`）。
4. **界面**：阶段待办（`:257-303`）——无资格→「不能在界面伪造教师或校方授权」（`:269`）；4 动作含 allowedActions 不可用标注（`:278-281`）；`actionState.reasons` 明示不可提交原因（`:293-296`）；「提交时仍会重新验证身份、任务、Run 和案卷版本」（`:297`）。
5. **事项认定**（`:307-324`）：认定≠整案通过（`:309`）；保留 basedOnRunId。
6. **决定历史**（`:326-341`）：追加不覆盖（`:327`）；「已被更正」标注（`:333`）；有效最终结论行（`:340`）。
7. **申诉**（`:343-433`）：仅 final 决定可申诉（`:350`）；无 submitter→本机身份确认（**不证明学校账号** `:366-371`）；端口未接入→**「不会假称已提交」**（`:386`）；复核（maintain/amend+amendedResult `:397-411`）；**复核端口须可信教师/独立复核人，本地审核员不伪装**（`:424`）；**撤回须可信 Main 识别原申诉人，复审人不得代撤**（`:430`）。

## 4. 调用者与调用链

入向：统一工作台（T10/Local-L）。出向：`./review-v3-t05-stage-actions`/`review-error-text`、`ReviewV3F12SupplementCycle`/`ReviewV3F13AppealHistory`（同批）、`window.reviewAPI.getT05StageCapability`、注入端口。

## 5. 数据 I/O、读写与副作用

写：阶段决定/申诉命令（经 Main CAS）；读：aggregate/能力投影。

## 6. 分支、失败、取消与恢复

命令失败→humanizeReviewError（`:206-220`）；端口缺失全为只读提示。不适用取消/恢复。

## 7. 权限与权威状态

**本文件即本地人工阶段授权边界**：能力=读投影非令牌（`:44-48`）、Renderer 零 actor（`:67-70`）、不伪造教师/校方（`:269/:424`）、撤回身份约束（`:430`）。

## 8. 修改影响面

改流程 → 阶段决定/申诉/认定三链与授权语义。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T05HumanWorkflow` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出+资格边界+三链全读 | 已证实 | 逐行读 `:1-437` |
| Main 端口/能力签发 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2 | `:16-95` | covered |
| 资格/决定/认定/历史/申诉 | §3 | `:95-437` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
