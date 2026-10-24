---
path: packages/session-core/src/outline.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ae42cdccf9cda5709a1006d8898eb24e07e7bd57
sha256: b548b93dbb7297ceda8e147041278332168212db7e6924567e89925360f50009
lines: 43
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/src/outline.ts

## 1. 结论与边界

Turn 级地图（:12 注释：每 turn 一行结构概览，供 Agent 决定读哪段）。

## 2. 导出与关键符号

导出 3 条（`export` :3/:13/:38）：`OutlineEntry`（:3-10，index/role/preview/tools?/tokens）、`outline(turns)`（:13-21）、`formatOutlineLine(e)`（:38-43，`#N 角色 · 预览80字 · [工具] (~Nt)`）。内部：`summarizeToolCounts`（:24-33，`ToolName ×N` 概览，正则取首词 :27）、`ROLE_LABEL`（:35，用户/助手/系统）。

## 3. 内部逻辑与关键流程

map 转换+工具计数收敛+单行格式化（§2）。不适用取消/恢复/权限：纯函数。

## 4. 调用者与调用链

入向（子agent 交叉核）：`index.ts:49`；经 index 仅 `cli/commands/outline.ts:9`（outline/formatOutlineLine）。出向：`./transcript`（type :1）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

tools 有无二分支（:18）；无 throw。

## 7. 权限与权威状态

不适用，依据：纯函数。

## 8. 修改影响面

CLI `outline` 命令输出格式。

## 9. 测试证据

无直接测试（批内）；`session-core.test.ts`（批外）可能覆盖。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条 | 已证实 | :3-43 |
| 仅 CLI outline 消费 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+summarizeToolCounts | §2/§3 | :3-43 | covered |
