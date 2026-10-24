---
path: apps/electron/src/main/lib/agent-end-reason.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10a801f441782690c6ad28a0652156f04693ee01
sha256: 0cdcd1905a3118295049a5ad855272ef6d41d09cba40ab377b98517da6d46c97
lines: 90
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-end-reason.ts

## 1. 结论与边界

Agent 任务结束原因统一归一化：把零散终态信号（SDK result subtype / stoppedByUser / 运行级错误标志）归一为 `AgentEndReason` + 可读 label（模块头 :2-8）。纯函数模块（无副作用，可单测）；供对话记录条目、输入框中断 chip、注入文本与 toast 共用。

不做的事：不判定「何时结束」（调用方 orchestrator owner finally 决定）；不写会话元数据（调用方写）；label 只提供文案不提供 i18n。

## 2. 导出与关键符号

导出 5 条（`export` 逐条核 :13/:15/:24/:30/:54）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DELEGATION_CANCELLED_RESULT_SUBTYPE` | const | `:13` | `'delegation_cancelled'` | 父会话级联取消的 subtype 标记 |
| `NormalizeAgentEndReasonInput` | interface | `:15-22` | `{resultSubtype?: string, stoppedByUser?: boolean, hasError?: boolean}` | 输入 |
| `AgentEndReasonResult` | interface | `:24-27` | `{reason: AgentEndReason, label: string}` | 输出 |
| `AGENT_END_REASON_LABELS` | const | `:30-38` | `Record<AgentEndReason, string>` | 7 值文案表；`completed` 为空串（:31） |
| `normalizeAgentEndReason` | function | `:54-90` | `(input) => AgentEndReasonResult` | 优先级链归一化 |

`AgentEndReason` 枚举本身定义在 `packages/shared/src/types/agent.ts:733`（7 值：completed/stopped_by_user/max_turns/max_budget/max_tokens/error/unknown）。

## 3. 内部逻辑与关键流程

`normalizeAgentEndReason`（:54-90）优先级（第一个命中生效）：注释（源 :40-53）为 9 级清单、**漏列 `delegation_cancelled` 分支**（代码 :76-78，插在 `error_during_execution` 与 `hasError` 之间）；代码顺序以 :54-90 为准（下表 10 步）。
1. `stoppedByUser === true` → `stopped_by_user`（:57-59，注释 :44：用户手动停止优先于一切）。
2. `resultSubtype === 'success'` → `completed`（:61-63）。
3. `'error_max_turns'` → `max_turns`（:64-66）。
4. `'error_max_budget_usd'` → `max_budget`（:67-69）。
5. `'max_tokens'` → `max_tokens`（:70-72，注释 :48：Pi stopReason=length 特有）。
6. `'error_during_execution'` → `error`（:73-75）。
7. `DELEGATION_CANCELLED_RESULT_SUBTYPE` → `reason:'unknown'` + 专用 label `因父会话停止而取消`（:76-78）。
8. `hasError === true` → `error`（:80-82）。
9. 其它非空字符串 subtype → `unknown`（label `任务中断`，:84-86）。
10. 兜底（无 subtype/无错误/未停止）→ `completed`（:88-89，注释 :88：防御不误判为中断）。

label 来自 `AGENT_END_REASON_LABELS`，唯一例外是步骤 7 的专用文案（:77）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- `apps/electron/src/main/lib/agent-orchestrator.ts:114` 导入；`:3597-3601` 在 owner finally 统一终态判定调用（输入 `effectiveSubtype`——:3595-3596 防御：干净结束归一为 `'success'`；`stopped` 合并手动停止与运行中停止标记 :3583/:3591；`hasError = runEndedWithError` :3593）。
- `apps/electron/src/main/lib/agent-headless-runner-registry.ts:10` 导入 `DELEGATION_CANCELLED_RESULT_SUBTYPE`；`:45` 在 `getAgentStopCompletionOptions` 把 `delegation_cancel` 映射为 `{stoppedByUser:false, resultSubtype: 'delegation_cancelled'}`。
- `apps/electron/src/main/lib/agent-goal-runtime-bridge.test.ts:7/:72`：把 `normalizeAgentEndReason` 当模块缝合桩（打桩，不执行）。
- 文档性引用（非调用）：`packages/shared/src/types/agent.ts:912/:1696`、`apps/electron/src/renderer/atoms/preview-atoms.ts:93` 注释引用 label 表。

出向：类型 `@profer/shared` `AgentEndReason`（:11）；无模块调用。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用、无状态（依据：仅类型导入 :11；纯查表 + 条件返回）。

## 6. 分支、失败、取消与恢复

- 全部分支见 §3（10 个出口）；无 throw。
- 与取消/恢复的关系：`delegation_cancelled` subtype 专门表示「因父会话停止而取消」，归为 `reason:'unknown'` 而非 `stopped_by_user`（:76-78），避免把级联取消归因给用户（配合 `agent-headless-runner-registry.ts:45` 的 `stoppedByUser:false`）。
- 恢复后展示：orchestrator 把 `{reason,label}` 写入会话中断记录（`lastInterruptReason/Label`，agent.ts:911/:912），completed 时清除（orchestrator :3603-3613，`reason==='completed'` 分支）。
- 不适用「失败后磁盘状态」：本文件无状态。

## 7. 权限与权威状态

无权限分支（依据：无 sender/role/权限字段）。权威语义：本文件是「结束原因归一化」的唯一定义点（优先级表 + 文案表）；输入信号的权威来源在 orchestrator（stoppedByUser/runEndedWithError/SDK result subtype）。

## 8. 修改影响面

- 改优先级影响对话记录/chip/toast 的归因（orchestrator :3597 一处调用、多处展示）。
- 改 `AGENT_END_REASON_LABELS` 影响所有展示面（chip/注入文本/toast）与 `agent-end-reason.test.ts` label 一致性用例（本批内 :80-124）。
- `DELEGATION_CANCELLED_RESULT_SUBTYPE` 是与 `agent-headless-runner-registry.ts:45` 的字符串契约，改动需同步。
- `AgentEndReason` 枚举改动需同步 `packages/shared/src/types/agent.ts:733`、label 表（Record 全覆盖约束）与渲染端展示组件。
- 需同步修改的测试：`agent-end-reason.test.ts`（本批内，16 用例）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-end-reason.test.ts`（本批内，2 describe / 16 用例）。
- describe「normalizeAgentEndReason」12 用例（:13-77）：用户停止优先于 success（:14-17 断言 reason+label）；success→completed（:20-22）；max_tokens 文案（:25-28）；error_max_turns（:31-34）；error_max_budget_usd（:37-40）；error_during_execution（:43-46）；hasError→error（:49-51）；subtype 优先于 hasError（:54-56）；级联取消专用文案 `toEqual({reason:'unknown', label:'因父会话停止而取消'})`（:59-61）；未知 subtype→unknown（:64-67）；空输入防御→completed（:70-72）；空串 subtype→completed（:75-77）。
- describe「AGENT_END_REASON_LABELS 一致性」4 用例（:91-124）：label 表覆盖全部 7 枚举（:91-95）；completed label 为空串（:98）；非 completed label 非空（:101-105）；归一化输出 label 与表一致（9 组输入 :108-123）。
- mock/边界：纯函数无 mock。未覆盖：orchestrator 侧 `effectiveSubtype` 防御合成（agent-orchestrator.ts:3595-3596）不在本测试；`DELEGATION_CANCELLED_RESULT_SUBTYPE` 与 registry 的集成。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 5 条；优先级链 10 出口（注释 9 级漏列 delegation_cancelled，代码以 :54-90 为准） | 已证实 | `:54-90`；注释 :43-52 为 9 级 |
| stoppedByUser 优先于一切（含 success） | 已证实 | `:57-59`；测试 :13-17 |
| subtype 优先于 hasError | 已证实 | `:64-75` 在 :80 之前；测试 :53-56 |
| 级联取消 → unknown + 专用文案，不归因用户 | 已证实 | `:76-78`；registry:45；测试 :58-61 |
| completed label 空串（不展示） | 已证实 | `:31`；测试 :97-99 |
| 兜底 completed 防御 | 已证实 | `:88-89`；测试 :69-77 |
| orchestrator 的 effectiveSubtype 防御逻辑 | 已证实（调用侧） | agent-orchestrator.ts:3583-3601 |
| 渲染端各展示面的具体组件 | 推断 | 仅知 label 流入 meta 字段（agent.ts:912/:1696）与 preview-atoms.ts:93 注释 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalizeAgentEndReason` 全 10 出口 | §3/§9 | :54-90 | covered |
| `AGENT_END_REASON_LABELS` 全表 | §2/§9 | :30-38 | covered |
| `DELEGATION_CANCELLED_RESULT_SUBTYPE` 契约 | §4/§8 | :13；registry:45 | covered |
| `NormalizeAgentEndReasonInput`/`AgentEndReasonResult` | §2 | :15-27 | covered |
| 展示面组件 | §10 | — | unknown |
| 集成（orchestrator 合成输入） | §9 | orchestrator:3583-3601 | partial（无集成测试） |
