---
path: apps/electron/src/renderer/components/agent/TaskProgressCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 201b4736f64c7a0c132ec0491cb2ce70b3f02fa4
sha256: b36d55ae995254376759f60c59a0ac38054e01ff4337a5f8fcebce8b25131835
lines: 170
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/TaskProgressCard.tsx

## 1. 结论与边界

内联聚合式任务进度卡片（文件头 `apps/electron/src/renderer/components/agent/TaskProgressCard.tsx:1-8`）：把消息流散落的 TaskCreate/TaskUpdate/TodoWrite 聚合为实时进度卡；数据直接从 `ToolActivity[]` 提取聚合。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出（类/常量 0；`TaskProgressCardProps` 为**内部接口未导出**，`:95` 无 export 关键字，下游无法 import）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `TaskProgressCardProps` | 内部接口（未导出） | 95-106 | `{activities,animate?,streamEnded?,stoppedByUser?,historicalTaskSubjects?}`（跨 turn 回溯恢复任务名，`:104`） |
| `TaskProgressCard` | 组件（导出） | 108-170 | 聚合渲染（空→null，`:112`） |
| `TaskRow`/`ProgressBar`/`MAX_VISIBLE`/`dashedBorderStyle` | 内部 | 29-93 | 三态行（completed 划线/in_progress activeForm/pending）；进度条（total≤1 不显示）；折叠阈 8；虚线边框 SVG（与 Thinking 块同风格，`:89`） |
| `aggregateTaskItems` | 外部 | 111 | `./task-progress`（本批外文件） |

## 3. 内部逻辑与关键流程

`useMemo` 聚合（`:109`，`aggregateTaskItems(activities,streamEnded,historicalTaskSubjects,stoppedByUser)`——打断→in_progress 变 cancelled，`:102` 注释）；>8 项折叠展开（`:116-117`）；标题行 `完成数/总数`；`streamEnded` 停 spinner 由聚合层处理。

## 4. 调用者与调用链

入向：AssistantTurn 内联任务进度区；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@/lib/utils`、`@/atoms/agent-atoms`、`./task-progress`（批次外）。

## 5. 数据 I/O、读写与副作用

纯渲染；本地 `expanded` 状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 无 items | null | 112 |
| >8 项 | 折叠/展开 | 116-117,148-166 |
| 打断 | in_progress→cancelled | 102 |
| 总数≤1 | 无进度条 | 71-72（`ProgressBar`） |

## 7. 权限与权威状态

任务态权威=`aggregateTaskItems` 聚合（含历史映射回溯）。

## 8. 修改影响面

改聚合输入影响进度卡显示。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 聚合/折叠/三态 | 已证实 | `:29-170` |
| 渲染行为 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+内部件 | §2,§3 | 29-170 | covered |
| 断言 | §9,§10 | — | unknown |
