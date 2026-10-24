---
path: apps/electron/src/renderer/components/agent/TurnFileChangesSummary.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fcbda329316162723e30d5972482be8c7af704bf
sha256: 92d26a7e9ebedf581f70d0efb54044969b7d84e3ff379265e6e8587df7bab4f0
lines: 124
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/TurnFileChangesSummary.tsx

## 1. 结论与边界

Turn 底部文件改动汇总（文件头 `apps/electron/src/renderer/components/agent/TurnFileChangesSummary.tsx:1-11`）：chip 横排本轮修改类工具（Edit/Write/MultiEdit/NotebookEdit）触及的文件；**子代理修改也冒泡**（SDK 子代理 assistant 消息经 `parent_tool_use_id` 在 turnMessages 中）；chip 复用 `FilePathChip` 与 Agent 消息渲染一致。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 2 个函数/组件 = 3 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `buildTurnFileNameMap` | 函数（导出） | 79-98 | 「文件名→绝对路径」映射；**同名冲突直接剔除**维持 basePaths 降级防误预览（`:75-78`） |
| `TurnFileChangesSummaryProps` | 接口（导出） | 100-103 | `{turnMessages,basePath?}` |
| `TurnFileChangesSummary` | 组件（导出） | 105-124 | `useMemo` 收集+`FilePathChip` 渲染 |
| `MUTATING_TOOLS`/`TOUCHED_TOOLS`/`getFilePath`/`collectFilePaths` | 内部 | 24-73 | 改动四工具；Touched=改动+Read（`:26-29`：Grep/Glob 命中无法安全归入）；失败工具剔除（`is_error` 集合，`:42-52,64`）；NotebookEdit 用 `notebook_path` |

## 3. 内部逻辑与关键流程

`collectFilePaths`（`:41-73`）：两轮扫描——先收集失败 tool_use_id，再取 assistant tool_use（工具集过滤+失败剔除+去重保序）。`buildTurnFileNameMap`（`:79-98`）：basename 映射，冲突（同名不同路径）删键进 `conflicted` 防复活。

## 4. 调用者与调用链

入向：AssistantTurnRenderer 的 MessageActions 之上（turn 底部）；正文行内引用映射。测试：`TurnFileChangesSummary.test.ts`（57 行，本批）。出向：`@profer/shared`（类型）、`@/components/ai-elements/file-path-chip`（本文件 `:21` import，批次外 alias）、`@/lib/file-utils`（`:22`）。

## 5. 数据 I/O、读写与副作用

纯渲染/纯函数；无 IO。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 工具失败（is_error） | 不入 chip/映射 | 42-52,64 |
| 同名不同路径 | 映射剔除 | 88-93 |
| 路径字段缺 | 跳过 | 37-38 |
| 无 paths | 空渲染 | 114 |

## 7. 权限与权威状态

文件引用权威=本轮真实 tool_use（成功者）；同名歧义保守剔除防误预览。

## 8. 修改影响面

改收集语义影响 chip 与正文文件引用解析。

## 9. 测试证据

直接测试：`TurnFileChangesSummary.test.ts`（57 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 子代理冒泡契约 | 已证实 | `:7-8` |
| 失败剔除/同名剔除 | 已证实 | `:42-52,88-93` |
| 渲染行为 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 收集族 | §2,§3 | 24-73 | covered |
| 3 导出 | §2 | 79-124 | covered |
