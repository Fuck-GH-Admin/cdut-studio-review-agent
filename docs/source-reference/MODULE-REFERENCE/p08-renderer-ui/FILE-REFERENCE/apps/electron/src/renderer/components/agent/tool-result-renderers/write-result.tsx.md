---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/write-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ffa6739e5dfc64e9d3e436f8c1b6691e55bc4369
sha256: 5ac4b1c1ddd74982cc0ec6cca10c78030e051b4998e9ae5319b01bc4967fb089
lines: 82
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/write-result.tsx

## 1. 结论与边界

Write 工具结果渲染器（82 行，@pierre/diffs 版本）：新建文件以 pierre diff 显示全部新增行（old 为空，`:3-4`）。错误态红底 pre；无内容时"已写入 <文件>"简讯。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `WriteResultRenderer` | `:27-82` | `(result, isError, input)`：`content=input.content`、`filePath=input.file_path`（`:29-30`）；`oldFile`（空串+`cacheKey:old:` `:32-36`）/`newFile`（内容+`cacheKey:new:{cheapHash}` `:38-42`）→`MultiFileDiff`（unified、one-dark-pro/one-light、disableFileHeader、bars、lineDiffType none、overflow scroll、`unsafeCSS: PIERRE_DIFF_CSS` `:44-54`） |

内部：`cheapHash:15-19`（31 乘法滚动 hash，缓存键用）。

## 3. 内部逻辑与关键流程

主题 atom（`resolvedThemeAtom` jotai）→diff options→错误/空内容分支→MultiFileDiff+FilePathChip 头。容器 max-h 400 纵向滚动（`:73`）。

## 4. 调用者与调用链

`index.tsx`（Write 分支 `:40-41`）；出向 `@pierre/diffs/react`、`@/atoms/theme`、`@/components/ai-elements/file-path-chip`、`./pierre-styles`。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

isError→pre；`!content`→"已写入"简讯（`:64-70`）。

## 7. 权限与权威状态

`unsafeCSS: PIERRE_DIFF_CSS` 注入第三方 diff 库（样式来自 pierre-styles 常量——照实记录该通道存在）。

## 8. 修改影响面

改 diff options 影响写文件展示；cheapHash 仅影响缓存键（碰撞=重渲染，无正确性影响）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件分支/diff options | 已证实 | 82 行全读 |
| pierre 库行为 | 未知 | `@pierre/diffs` 不在冻结树 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；依赖/实效 unknown。
