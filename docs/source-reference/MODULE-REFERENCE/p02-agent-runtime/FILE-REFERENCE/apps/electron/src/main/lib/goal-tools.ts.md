---
path: apps/electron/src/main/lib/goal-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b933425e91b46fb5e51ba36878dabece326d398
sha256: d0a8bba163760ae917321d6509e55a77d4832e135f4cf49bc9cd8cdfee28c216
lines: 34
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-tools.ts

## 1. 结论与边界

Goal 报告工具的**结果归一器**（34 行）：把模型 `update_goal` 工具调用的原始字段（status/summary/evidence）归一为 `AgentGoalIterationResult`，无效报告一律降级 `outcome:'failed'`——**绝不伪装成功 continue**（防伪完成红线）。注释 `:34`："结果只回传给 GoalController，不写入普通对话"。

不做的事：不含工具注册体（文件末注释 `:34` 之后无代码——工具 schema/注册在别处）；不判业务完成（controller 侧）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `GoalToolsContext` | `:5-8` | `{iteration; report(result)}`（接口声明，本文件内无消费者——供工具注册侧） |
| `normalizeGoalToolResult` | `:19-28` | `({status,summary,evidence}) => AgentGoalIterationResult`：status 白名单（continue/complete/blocked，其余→continue）、summary trim（非 string→''）、evidence 清洗（`normalizeEvidence:14-17`：非数组→[]，去非 string/空白项、trim、**截 20 条**）；校验失败→`{status:'continue', outcome:'failed', error:'Goal 报告格式无效或缺少真实证据'}`（`:24-25`） |
| `normalizeGoalIterationResult` | `:30-32` | 委托别名（`AgentGoalIterationResult` 形参，内部转发） |

内部：`jsonResult:10-12`（content 包装——**本文件内无调用点**，疑为工具返回助手预留）。

## 3. 内部逻辑与关键流程

校验条件（`:24`）：`!validStatus || summary 为空 || (status==='complete' && evidence 为空)` → failed。成功路径返回 `{status, summary, evidence, outcome:'success'}`（`:27`）。注意 `status` 归一与 `validStatus` 判定分离（`:20` vs `:23`）：非法 status 归一为 continue 但同时走 failed 出口。

## 4. 调用者与调用链

`goal-session-service.ts`（runTurn 内 `reportGoalResult: (result) => { report = normalizeGoalToolResult(result) }` `apps/electron/src/main/lib/goal-session-service.ts:90`）；`goal-controller.ts`（结果消费）；出向 `@profer/shared`（`GOAL_UPDATE_TOOL_NAME`、`AgentGoalIterationResult`——`GOAL_UPDATE_TOOL_NAME` 在本文件**未使用**（导入未用，矛盾②））。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

失败即降级：任何格式问题→`outcome:'failed'`（`:25`），调用侧（`apps/electron/src/main/lib/goal-session-service.ts:102`）据此拒绝判定完成。无异常抛出。

## 7. 权限与权威状态

**防伪完成红线**：complete 必须带真实证据（`:24` `evidence.length===0` 判败）；空白证据被清洗后为空即触发；"工具文本中的协议不能成为完成报告"（`apps/electron/src/main/lib/goal-session-service.test.ts:59-69` 语义：tool_result 文本中的 `<goal_result>` 不经本函数不生效）。evidence 上限 20 条（`:16`）。

## 8. 修改影响面

改校验口径直接影响 Goal 完成判定（误放行=伪完成）；`AgentGoalIterationResult` 形状来自 shared；`normalizeGoalIterationResult` 别名的消费点在 controller/reducer 侧。

## 9. 测试证据

直接测试 `goal-tools.test.ts`（3 个 `test(`）：结构化归一（数字项剔除+trim）、空白证据过滤与 complete 无证据拒收、无效报告失败不伪装。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出 + 2 内部函数、校验逻辑 | 已证实 | 文件全读 |
| evidence 20 条上限/防伪完成 | 已证实 | `:16`、`:24` |
| **矛盾①** `jsonResult:10-12` 本文件无调用点（预留/残留） | 已证实 | 全文检索 |
| **矛盾②** `GOAL_UPDATE_TOOL_NAME` 导入未用 | 已证实 | `:1` |
| 工具注册/schema 位置 | 未知 | 不在本文件 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 3 导出全量 | §2 | covered |
| 校验/防伪红线 | §3/§7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/矛盾 | §9/§10 | covered |
