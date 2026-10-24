---
path: apps/electron/src/renderer/components/file-browser/FileTypeIcon.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 12e420950ac15e26ab71de9d74b49c536a1f1276
sha256: 9639bc960b7b886c4afab5a93eecc6facedc296744b0a9dc17cec70cab10934e
lines: 40
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/FileTypeIcon.tsx

## 1. 结论与边界

文件/文件夹图标组件（运行时，`React.memo`）：按文件名/文件夹名渲染 VS Code 风格图标，封装 `@react-symbols/icons`，统一尺寸样式（`apps/electron/src/renderer/components/file-browser/FileTypeIcon.tsx:1-5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FileTypeIcon` | 组件 | 21-40 | props `{name, isDirectory, size?=16, className?}`（接口 `:10-19`） |

## 3. 内部逻辑

isDirectory→`FolderIcon folderName`（`:27-33`）；否则 `FileIcon fileName autoAssign`（`:35-39`）；包 span 固定 flexShrink:0 尺寸盒。

## 4. 调用者与调用链

入向：`FileMentionList.tsx:20`、`FileSearchBar.tsx:12`、FileBrowser 树行/网格（非本批清单外亦有）。出向：`@react-symbols/icons/utils`。

## 5-7. I/O/分支/权限

无；目录/文件二分支；无权限分支（依据：纯渲染无 sender/role 检查）。

## 8. 修改影响面

图标库升级影响全文件树/搜索 UI。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+二分支 | 已证实 | `:1-40` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
