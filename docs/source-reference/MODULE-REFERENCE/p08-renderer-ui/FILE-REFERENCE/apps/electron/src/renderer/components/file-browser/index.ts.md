---
path: apps/electron/src/renderer/components/file-browser/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 65cadb567cef09bbcc7ab5333ec36ccb4bf4ebe1
sha256: 4e765a6bc10055b50169ddf20dade6eb4fe7d23c4c6e37179134fc51dea79156
lines: 9
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/index.ts

## 1. 结论与边界

文件浏览器模块导出索引（9 行纯 re-export）：`apps/electron/src/renderer/components/file-browser/index.ts:1-3`。

## 2. 导出与关键符号

`export *` 4 模块（`:5-8`）：`./FileBrowser`、`./FileDropZone`、`./FileTypeIcon`、`./FileSearchBar`、另 `./tree-row-layout`（`:9`）。注意：**`./tree-row-layout` 不在本批**（跨文件归属登记）；FileMentionList/FilePreviewDialog/DefaultAppMenuItem 等不经此索引导出。

## 3. 内部逻辑

无（聚合导出）。

## 4. 调用者与调用链

入向：侧栏等消费方。出向：5 兄弟模块。

## 5-7. I/O/分支/权限

无；不适用。

## 8. 修改影响面

公共 API 面变更需同步消费方。

## 9. 测试证据

无专属测试；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 模块聚合清单 | 已证实 | `:5-9` |
| tree-row-layout 内容 | 未知 | 非本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全文 | §2 | covered |
