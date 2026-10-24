---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/bash-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 112785b4da6cc4ed0a09f8a28905809e9a6d4b21
sha256: eeb948c11e730fb208327ff0418b5ce561fa2713728ad95d8ae05c197b48730f
lines: 80
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/bash-result.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

命令类工具（Bash/PowerShell）结果渲染器（80 行，头注 :1-5）：终端风格（深底/等宽/stderr 红色）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BashResultRenderer` | 组件 | 37-80 | 终端渲染（CollapsibleResult 包裹） |

内部：`BashResultRendererProps`（:11-15）、`classifyLine`（:18-31，error:/fatal:/warning:/traceback/exception/stderr: 模式→stderr）。

## 3. 内部逻辑与关键流程

命令回显（`$ {command}`，:50-55）；`text.split(/\r?\n/)`（注释 :41-43：Windows CRLF 残留 `\r` 在 pre-wrap 下多出空行）；每行 `<div>`（空行 `\u200B` 占位 min-h）；`isError` 时全行 stderr 红；`CollapsibleResult revealStep=50`（注释 :73-74 按 50 行递进避免一次铺满）。

## 4. 调用者与调用链

入向：工具结果渲染分发（`./collapsible-result` 同族）。出向：`@/lib/utils`（cn）、`./collapsible-result`、`@profer/project-core`（:1，工具名识别）。

## 5. 数据 I/O、读写与副作用

纯渲染（React）。

## 6. 分支、失败、取消与恢复

无 command 字段则不回显；不抛。

## 7. 权限与权威状态

- 展示诚实：stderr 启发式仅按行模式着色（不改内容）。无 sender/role 检查。

## 8. 修改影响面

Bash/PowerShell 结果展示。无专属测试文件。

## 9. 测试证据

直接测试：无（全树检索 bash-result 渲染测试 = 0）；视觉行为 NOT_RUN（Electron/GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| CRLF/递进渲染语义 | 已证实（代码） | :41-43/:73-74 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `classifyLine` | §3 | 18-31 | covered（未测） |
| `BashResultRenderer` | §3 | 37-80 | covered（未测） |
