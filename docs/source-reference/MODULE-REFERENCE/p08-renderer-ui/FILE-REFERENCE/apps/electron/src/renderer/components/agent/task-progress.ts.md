---
path: apps/electron/src/renderer/components/agent/task-progress.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b03c72454f8e0a5d98202a2da4e030ef964744f
sha256: 1d88a0c273fcffae65a1b2317fae33c7dd6a1655181ded00a5cc0438bdece6d3
lines: 250
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/task-progress.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

任务进度聚合（250 行）：从 `ToolActivity[]` 提取任务项最新状态；TaskCreate 读 SDK 0.3 结构化输出 `{task:{id,subject}}`；TaskUpdate 以 taskId 更新（跨 turn 用历史 subject 恢复）；TodoWrite 走独立 `todo-*` 命名空间；终止态收敛（streamEnded→in_progress 回 pending；stoppedByUser→cancelled）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `TASK_TOOL_NAMES` | const | 6 | 静态 5 名（MCP 前缀由 isTask* 动态识别） |
| `isTaskProgressTool` | fn | 8-10 | TodoWrite 或 Task 工具族 |
| `TaskItemStatus` | type | 12 | 6+deleted 七态 |
| `TaskItem` | interface | 14-21 | id/subject/status/activeForm?/description? |
| `extractToolResultText` | fn | 41-63 | string/`{content:[…]}`/块数组三形态归一（窄口径防二进制泄漏，注释 :38-40） |
| `parseTaskCreateResult` | fn | 65-105 | `{task:{id,subject}}`→嵌套 content→**旧 SDK 文本 `Task #N` 兜底**（:96-100） |
| `aggregateTaskItems` | fn | 137-250 | 聚合主入口 |

内部：`isRecord/parseJsonObject`（:24-36）、`toTaskStatus/stringId/taskIdFromInput`（:107-131）。

## 3. 内部逻辑与关键流程（`aggregateTaskItems`，:137-250）

1. 预扫 TaskCreate：解析 result 建 `toolUseId→taskId` 映射（result 缺失退回 toolUseId）与 subject 映射。
2. TodoWrite：清旧 `todo-*` 重建（`todo-${n}` 自增 id）。
3. TaskCreate：id=解析 id??toolUseId；subject=输入 subject??结果 subject??description??`未命名任务`；description 提取。
4. TaskUpdate：taskId 缺→跳过；已有条目合并更新；**无已有条目仅当能提供有意义名字才建**（subject/历史映射，注释 :226-229 防「任务 #N」重影）。
5. 收敛：deleted 过滤；stoppedByUser→in_progress→cancelled（注释 :237「路线变更」）；否则 streamEnded→in_progress→pending。

## 4. 调用者与调用链

入向：任务进度条组件（同目录，全树 grep）。出向：`@profer/project-core`（`isTaskCreateTool/isTaskUpdateTool`，:1）、`@/atoms/agent-atoms` 类型。

## 5. 数据 I/O、读写与副作用

纯函数（Map 聚合）。

## 6. 分支、失败、取消与恢复

JSON 解析失败→null 走兜底；未知 status→回退原状态；不抛。

## 7. 权限与权威状态

- 状态诚实权威：终态不被 streamEnded/stoppedByUser 覆盖（测试锁定）；未知 status 不伪造；无名 TaskUpdate 不造重影条目。无 sender/role 检查。

## 8. 修改影响面

任务进度 UI/迷你地图。同测：`task-progress.test.ts`（9 声明，test.each 展开 14 用例）。

## 9. 测试证据

直接测试 `task-progress.test.ts`（9 声明 / 1 describe，展开 14 用例；纯函数；NOT_RUN）：
1. `:28-32` test.each failed/cancelled 保终态。
2. `:34-36` deleted 过滤。
3. `:38-50` MCP 前缀任务工具聚合（proma_task_create/update）。
4. `:52-67` SDK MCP content 信封取真实任务 ID（toolUseId 不得当节点 id——夹具名即断言语义）。
5. `:69-79` 未知 status 回退原状态。
6. `:81-88` test.each 流结束不覆盖终态（failed/cancelled/completed）。
7. `:90-97` test.each 用户打断不覆盖终态。
8. `:99-103` 正常结束仅 in_progress→pending。
9. `:105-109` 用户打断仅 in_progress→cancelled。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 终态保护/信封解析/兜底 | 已证实 | 测试族逐条 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `aggregateTaskItems` 全分支 | §3/§9 | 137-250 | covered |
| `parseTaskCreateResult` 三层 | §3/§9 | 65-105 | covered |
| `extractToolResultText` | §2/§9 | 41-63 | covered |
