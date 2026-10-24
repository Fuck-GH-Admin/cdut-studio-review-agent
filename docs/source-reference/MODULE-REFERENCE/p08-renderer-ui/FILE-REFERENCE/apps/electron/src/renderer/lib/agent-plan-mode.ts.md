---
path: apps/electron/src/renderer/lib/agent-plan-mode.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 039b50d8c9a9d35cfce3edd87a4adedb270e9e25
sha256: 2c276907eeac6e6d2f26d13ecff899eba75727af954772677202a48f5e40b074
lines: 35
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-plan-mode.ts

## 1. 结论与边界

计划阶段工具名解析+会话集合更新（35 行）。

## 2. 导出与关键符号

导出 3 条（`export` :3/:9/:19）：`PlanModeChange`（:3-6）、`getPlanModeChangeFromToolName(toolName)`（:9-16）、`updatePlanModeSessionSet(prev, sessionId, active)`（:19-35）。

## 3. 内部逻辑与关键流程

- EnterPlanMode→active:true（:11）；**ExitPlanMode 不算已退出**（:13-15 注释：仅发起审批请求，真退出由后端 plan_mode_changed）。
- Set 更新：无变化复用原引用减 Jotai 刷新（:18/:25/:31）。

## 4. 调用者与调用链

入向：工具事件/计划状态链。出向：`@profer/shared` 类型。

## 5-7. 数据/分支/权限

纯函数；ExitPlanMode 语义契约（:13-15）。

## 8. 修改影响面

- 消费面：计划模式指示。
- 依赖面：plan_mode_changed 后端事件。
- 需同步测试：`agent-plan-mode.test.ts`（42 行）。

## 9. 测试证据

`agent-plan-mode.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；ExitPlanMode 契约 | 已证实 | :13-15 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2/§3 | :9-35 | covered |
