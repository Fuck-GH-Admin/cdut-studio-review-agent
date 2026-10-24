---
path: packages/session-core/src/render-markdown.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8a5498d682b018c808e0e5e3dea2ec3fe5dc6e65
sha256: 6100120439ca44275b814b43d0b2abaacab3aa9aab759ee6faba7d4341890535
lines: 44
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/src/render-markdown.ts

## 1. 结论与边界

TranscriptTurn[] → Markdown 对话（:17-19 注释）：连续同角色合并到同一标题；工具调用以 `> [工具: …]` 引用行呈现。

## 2. 导出与关键符号

导出 2 条（`export` :3/:20）：`RenderMarkdownOptions`（:3-8，sessionId?/header=true）、`renderTranscriptMarkdown(turns, opts)`（:20-44）。内部：`HEADING`（:10-14，用户/助手/系统三级标题）。

## 3. 内部逻辑与关键流程

header 可选（:24-27，含「自动清洗自会话 JSONL」说明行 :26）；按角色变化插标题（:30-34）；text 块+工具引用行（:35-40）；末尾压缩连续空行（:43）。不适用取消/恢复/权限：纯函数。

## 4. 调用者与调用链

入向（子agent 交叉核）：`index.ts:52`；经 index 仅 `cli/commands/export.ts:17`。出向：`./transcript`（type :1）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

header 二分支；无 throw。

## 7. 权限与权威状态

不适用，依据：纯函数。

## 8. 修改影响面

CLI `export` 命令 Markdown 输出格式。

## 9. 测试证据

无直接测试（批内）；`cli/commands/export.test.ts`（批外）可能覆盖。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；同角色合并 | 已证实 | :20-44 |
| 仅 CLI export 消费 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | :3-44 | covered |
