---
path: apps/electron/src/renderer/lib/todo-agent-prompt.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8918d81ef019c77fb184823f48eec7302c4be850
sha256: fad67507dc457bb87d3a1b0c216bb3a6252bd99abc589118c470836c8b15fc4c
lines: 30
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/todo-agent-prompt.ts

## 1. 结论与边界

构建“处理关联 Todo”的 Agent 首条消息（`:3-8`）：Claude/Pi 都提供规划 Todo MCP，工具名仅因 runtime 的 MCP 暴露形式不同而异；**保留 Todo 快照作为降级上下文**（工具暂不可用时不丢用户目标）。纯函数（prompt 组装）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `buildTodoAgentPrompt` | function | `:9-30` | `(todoId, agentRuntime, todo?) => string` |

## 3. 内部逻辑与关键流程

- 工具名映射：`pi → mcp__planning__get_todo`，其余 → `get_todo`（`:10`）。
- 快照行（`:11-20`）：Title/Notes/Priority（high/low/其它→Medium）/计划完成时间（zh-CN 24h）/Group/Tags——空项过滤。
- 消息体：要求**先调工具读最新原始记录**（`:25`，工具结果优先）→ 快照标注“context only; the tool result above takes precedence”（`:27`）→ 按任务目标推进、需澄清/高风险先问用户、**非真完成不勾 Todo**、用户可见输出用用户语言（`:28`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Todo 关联 Agent 启动链路。出向：`@profer/shared`（AgentRuntime/Todo 类型）。

## 5. 数据 I/O、读写与副作用

无（字符串组装）。

## 6. 分支、失败、取消与恢复

runtime 工具名分支（`:10`）；快照空项过滤（`:19`）；无 todo 时仅指令段（`:27`）。

## 7. 权限与权威状态

诚实口径：**工具结果优先于快照**（快照仅降级上下文）；“非真完成不勾 Todo”“高风险先问”写入指令。

## 8. 修改影响面

改 prompt → 影响 Todo 关联 Agent 行为契约。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 工具优先/快照降级 | 已证实 | `:25-27` |
| 双 runtime 工具名 | 已证实 | `:10` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildTodoAgentPrompt` | 2/3 | `:9-30` | covered |
