---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/pierre-styles.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d4928b2bc23215dd5562e41991e049613731856
sha256: e45ba162823c8754d372dc7a3f766f2af808acdaefc1b9b0ec20c57093d0ced7
lines: 138
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/pierre-styles.ts

## 1. 结论与边界

`@pierre/diffs` **共享样式常量**（138 行，无 import）：与 DiffView.tsx 一致的配色，供 edit/write/read 渲染器复用（`:1-6`）。三出口：diff 样式、纯代码样式、行号偏移样式工厂。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `PIERRE_DIFF_CSS` | `:9-69` | diff 全套：:root/:host 变量（addition `rgb(67,167,71)`/deletion `rgb(206,66,52)`、light-dark 双主题、滚动条）、`[data-code]::-webkit-scrollbar` 系列、行类型着色（change-addition/deletion `!important`）、gutter 列号配色 |
| `PIERRE_FILE_CSS` | `:72-99` | 纯代码预览（无 diff 行类型）：背景+滚动条+列号/gutter 背景 |
| `createPierreFileCSS` | `:107-138` | `(lineNumberStart, maxLineNumber) => string`：非有限输入钳制（→1/safeStart `:108-109`）；minWidth `max(3, 位数)ch` `:110`；start===1→仅 PIERRE_FILE_CSS+min-width；否则注入 CSS 计数器偏移（`counter-reset: profer-read-line {start-1}`、隐藏原生行号、`::before` 递增显示 `:126-136`）——配套 Read 结果 `cat -n` 行号剥离（`:101-106` 注释） |

## 3. 内部逻辑与关键流程

静态模板串+工厂函数（参数钳制→分支拼接）。无副作用（生成字符串，由消费方注入 unsafeCSS）。

## 4. 调用者与调用链

`PIERRE_DIFF_CSS`←edit-result `:14`/write-result `:13`；`PIERRE_FILE_CSS`←DiffTabContent.tsx `:31`（批外）；`createPierreFileCSS`←read-result `:14`。

## 5. 数据 I/O、读写与副作用

纯字符串生成；注入方副作用（unsafeCSS）。

## 6. 分支、失败、取消与恢复

非有限输入钳制；start===1 短路分支。

## 7. 权限与权威状态

`unsafeCSS` 注入通道（write-result `:53`/edit-result 同）——样式来源固定常量；配色与 DiffView.tsx 一致性契约（`:2`）。

## 8. 修改影响面

改 CSS 影响三渲染器 diff 展示一致性；计数器名/偏移改动影响 Read 行号对齐。

## 9. 测试证据

无直接测试（**整体零测试**）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三导出/样式契约/工厂钳制 | 已证实 | 138 行全读（子agent 字节核对） |
| **①** CSS 计数器名 `profer-read-line` 疑为 `pierre` 拼写之误（3 处原始字节确认）；自洽无功能影响，照实记录 | 已证实 | `:127`/`:133`/`:134` |
| DiffView.tsx 一致性 | 未知 | DiffView.tsx 不在冻结树（注释自述） |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9、实效 unknown。
