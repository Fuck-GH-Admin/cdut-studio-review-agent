---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/read-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 83ac9b268db0843ce0ff844b4d718d1040071108
sha256: 8c7494f0019d02138d2ee0b8a2daf95d872ed02f6953c2f00f6feeaf76de862a
lines: 156
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/read-result.tsx

## 1. 结论与边界

Read 工具结果渲染器（156 行，@pierre/diffs File 版本）：代码预览（Shiki 高亮+行号 gutter，主题与 diff 一致，`:2-3`）；`cat -n` 行号**剥离**+`createPierreFileCSS` 把 gutter 起始行调回真实行号（防双行号，`:114-115`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ReadResultRenderer` | `:104-156` | 唯一 export：`(result, isError, input)`——**无 basePath**（区别于 Edit M5） |

内部：`cheapHash:16-20`（与 edit 逐字重复 M2）、`NUMBERED_READ_LINE_RE:28`（`\s*(\d+)(?:\t\|\u2192\s?\|\s+)(.*)`——`\u2192` 为正则转义非原始 → 字符，字节核对）、`getInputStartLine:36-51`（收 number+数字串、缺省 1 M3）、`parseCatNumberedContent:53-90`（逐行连续校验 `:72`、偏移规则 `:80-83`：仅 first===1 且 expected>1 时 offset）、`normalizeReadContent:92-102`。

## 3. 内部逻辑与关键流程

`renderCode` 回调（`:116-144`）：isError 红 pre→归一化（cat 剥离或原文回退）→FileContents（cacheKey `read:{path}:{start}:{hash}` `:129`）→options（`unsafeCSS: createPierreFileCSS(start, max)` `:136`）→PierreFile 容器（max-h 400）。外包 `CollapsibleResult`（**`foldByLines={false}`** `:152`——自带 gutter+内部滚动，按行折叠会双重滚动且短文件不该折叠，`:149-151` 注释）。

## 4. 调用者与调用链

`index.tsx:36-37`；出向 `@pierre/diffs/react`（File）、`./collapsible-result`、`./pierre-styles`（createPierreFileCSS）。

## 5. 数据 I/O、读写与副作用

纯渲染（不读磁盘——与 Edit 不同，行号仅靠 input.offset，照实）。

## 6. 分支、失败、取消与恢复

错误→红 pre（CollapsibleResult 仍包裹）；cat 解析失败→原文+inputStartLine 近似行号；**折叠切片时 cat 连续性校验大概率失败→原文回退，切片边缘行号漂移**（固有局限，照实）。

## 7. 权限与权威状态

行号归一契约（剥 cat -n 前缀+counter 修正防双行号）；`foldByLines=false` 单一限高契约。

## 8. 修改影响面

改归一化影响代码预览行号对齐；createPierreFileCSS 联动 pierre-styles。

## 9. 测试证据

**全树无测试引用本文件**（子agent grep 确认）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件归一化/渲染/foldByLines=false | 已证实 | 156 行全读（字节核对 `:28`/`:129`/`:136`/`:152`） |
| **M2/M3/M5** 与 edit-result 的重复/强弱/回退不一致 | 已证实 | `:16-20`/`:36-51`/`:106-110` 对拍 |
| 折叠切片行号漂移固有局限 | 已证实 | `:72`/`:96-101` 逻辑推演 |
| 可访问性零 aria/role | 已证实 | 字节级 grep |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 归一化/渲染链 | §3 | covered |
| 矛盾/局限 | §10 | covered |
| 测试 | §9 | unknown（零测试） |
