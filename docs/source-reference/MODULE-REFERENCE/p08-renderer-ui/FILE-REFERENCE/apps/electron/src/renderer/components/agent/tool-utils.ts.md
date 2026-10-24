---
path: apps/electron/src/renderer/components/agent/tool-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b4d1f062d2b7f2d3a902638c6ea01ba6a47782d2
sha256: cb7f7f04ef3075fcd636ecb850aebf3025d5d0e71707657ecb0fb24e33d74c0f
lines: 557
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-utils.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

工具展示可复用函数与常量（557 行，头注 :1-5）：图标/显示名/输入摘要/文件路径提取/Edit 差异统计/耗时格式化；供 SDK 内容块、任务进度卡片复用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `TOOL_ICONS` | const | 44-91 | 55 工具→Lucide 图标 |
| `isSilentStreamToolName` | fn | 98-100 | Goal 更新工具+AskUserQuestion 消息流静默（注释 :93-97 由目标面板/AskUserBanner 承接） |
| `getToolIcon` | fn | 106-110 | 名→图标；`mcp__` 前缀→Plug；默认 Wrench |
| `getToolDisplayName` | fn | 196-206 | 中文名表+MCP `SERVER / TOOL` 大写格式 |
| `getInputSummary` | fn | 211-495 | 大 switch 摘要（截断 60/80 字；Read/Edit/Write 只显文件名） |
| `extractFilePath` | fn | 500-511 | file_path/filePath/path/notebook_path 优先级 |
| `computeDiffStats` | fn | 516-543 | 仅 Edit：new/old 行数（additions=newLines,deletions=oldLines） |
| `formatElapsed` | fn | 548-557 | <60 `X.Xs`，否则 `Xm Ys` |

内部：`TOOL_DISPLAY_NAMES`（:115-193，50+ 中文名）。

## 3. 内部逻辑与关键流程

`getInputSummary` 分支要点：Bash/PowerShell 80 截断；Grep `/pattern/`；BrowserNavigate 取 URL host（解析失败回退截断）；BrowserClick/Fill 取 ref；TaskUpdate statusMap 拼接；Read/Edit/Write 仅文件名（注释 :346-347 兼容 Windows 反斜杠不显完整路径）；CronList 恒 null。`computeDiffStats` 语义=行数对比（非逐行 diff）。

## 4. 调用者与调用链

入向：SDK 内容块/任务卡片/工具活动行（`tool-phrase.ts` 消费 computeDiffStats）。出向：`@profer/shared`（isGoalUpdateToolName，:7）、lucide-react。

## 5. 数据 I/O、读写与副作用

纯函数/常量。

## 6. 分支、失败、取消与恢复

default 回 null/原始名；不抛。

## 7. 权限与权威状态

- 展示边界：文件路径只显文件名（:346-347）；静默工具不计数（Goal/AskUser 由专用面板承接）。无 sender/role 检查。

## 8. 修改影响面

工具行展示全量。无专属测试（tool-phrase.test.ts 仅间接触及 computeDiffStats）。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 文件名脱路径/静默语义 | 已证实 | :93-100/:346-347 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 图标/显示名/静默 | §2 | 44-206 | covered（未测） |
| `getInputSummary` 全分支 | §3 | 211-495 | covered（未测） |
| extract/diff/elapsed | §2 | 500-557 | covered（未测） |
