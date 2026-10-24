---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/edit-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5843a3f5231d4fe48efabc5885fa93063fd73f1b
sha256: 5678c8cbc189b335192c896d0a788273658a0c1ddc32fc9fc9bbe8e7d82e0056
lines: 187
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/edit-result.tsx

## 1. 结论与边界

Edit 工具结果渲染器（187 行，@pierre/diffs 版本）：`MultiFileDiff`/`FileDiff` 渲染 `old_string→new_string` 差异（Shiki 高亮+行号，**固定 unified 视图** `:3-5`）；带**真实文件行号探测**（磁盘 resolveAndReadFile 定位编辑片段起始行再偏移 hunks）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `EditResultRenderer` | `:86-187` | 唯一 export：`(result, isError, input, basePath)`——**唯一接收 basePath 的渲染器**（`index.tsx:38-39`） |

内部：`cheapHash:16-20`（与 read-result **逐字重复** M2）、`HUNK_HEADER_RE:29`、`getExplicitStartLine:31-36`（仅 number，**拒数字串**、缺省 null M3）、`uniqueIndexOf:38-43`（**唯一出现**才命中）、`findEditedSnippetStartLine:53-60`（CRLF 归一→newStr 优先/oldStr 兜底）、`offsetHunkSpecs:62-70`/`offsetFileDiffLineNumbers:72-84`（hunk 行号偏移）。

## 3. 内部逻辑与关键流程

atom（theme/sessionId）→input 取 old/new/filePath（`file_path` 缺省 `'file'` `:91`）→行号探测 Effect（`:119-147`：显式行号短路→错误/空→null→`window.electronAPI.resolveAndReadFile`（basePath 候选）→定位片段→取消旗标清理）→`fileDiff` memo（`parseDiffFromFile`+偏移，**catch→null** `:153`）→三分支：isError 红 pre（`:158-164`）/双空"编辑成功"（`:166-172`）/**!fileDiff 同款回退**（`:174-180`，no-op 与解析失败不可区分——M4）/diff 视图（max-h 400 `:183`）。

## 4. 调用者与调用链

`index.tsx:38-39`；出向 `@pierre/diffs`（parseDiffFromFile/FileDiff）、`@/atoms/*`、`./pierre-styles`（PIERRE_DIFF_CSS）、全局 `window.electronAPI.resolveAndReadFile`（preload 契约）。

## 5. 数据 I/O、读写与副作用

**磁盘读文件**（经 electronAPI resolveAndReadFile，只读）；其余纯渲染。

## 6. 分支、失败、取消与恢复

读文件失败→行号不偏移（回退 0，无提示）；解析异常→null 静默；Effect cancelled 旗标防竞态。

## 7. 权限与权威状态

`resolveAndReadFile` 只读探测（sessionId+candidateBasePaths 收敛查找面）；行号定位**唯一出现约束**（防错位，`:42`）。

## 8. 修改影响面

行号偏移逻辑影响 diff 与源文件对齐；`unsafeCSS` 注入 PIERRE_DIFF_CSS；与 write/read 共享 pierre 样式契约。

## 9. 测试证据

**全树无测试引用本文件**（子agent grep 确认）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件行号探测/偏移/三分支 | 已证实 | 187 行全读（字节核对 `:32`/`:91`/`:108`/`:169`） |
| **M4** diff 解析失败与 no-op 同显"编辑成功"文案（错误被掩盖） | 已证实 | `:153`/`:174-180` |
| **M2** cheapHash 与 read-result 逐字重复；**M3** 起始行强弱不一致（拒数字串/缺省 null vs read 收数字串/缺省 1）；**M5** 文件名回退不一致；**M8** useMemo deps 冗余 | 已证实 | `:16-20`/`:31-36`/`:91`/`:156` |
| 可访问性零 aria/role | 已证实 | 字节级 grep |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 行号探测/偏移链 | §3 | covered |
| 4 矛盾+可访问性 | §10 | covered |
| 测试 | §9 | unknown（零测试） |
