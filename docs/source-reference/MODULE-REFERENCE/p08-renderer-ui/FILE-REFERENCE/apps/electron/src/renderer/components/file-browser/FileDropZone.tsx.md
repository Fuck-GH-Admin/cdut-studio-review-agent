---
path: apps/electron/src/renderer/components/file-browser/FileDropZone.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d91170d1aef32e9b2787c6a45f3d089ccbf34625
sha256: c1dbc3f34411b3f1ba9f7405e2cbd2b72b69bacec0969ca32799eaece2895c8c
lines: 336
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/FileDropZone.tsx

## 1. 结论与边界

文件拖拽上传区域（运行时组件）：两个并排 drop zone——左接受文件上传（回形针）、右接受文件夹附加（文件夹图标）；拖错区域给引导提示（`apps/electron/src/renderer/components/file-browser/FileDropZone.tsx:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FileDropZoneProps` | 接口 | 16-24 | workspaceSlug/sessionId?/target('session'\|'workspace')/onFilesUploaded/onFilesAttached?/onAttachFolder/onFoldersDropped |
| `FileDropZone` | 组件 | 26-336 | 唯一导出组件 |

## 3. 内部逻辑与关键流程

- `saveFiles`（`:32-103`）：**>MAX_ATTACHMENT_SIZE 分流**——有本地路径→`onFilesAttached` 附加（不复制），否则 toast 跳过（`:44-57`）；其余 base64 经 `saveFilesToWorkspaceFiles`/`saveFilesToAgentSession` 上传（`:80-92`）。
- `handleDrop`（`:105-176`）：`getPathForFile`+`checkPathsType` 区分目录/文件（`:119-133`）；左侧只收文件（目录引导右侧，`:136-146`）；右侧收文件夹+文件按原路径附加（`:147-159`）；路径检测失败回退（`:161-168`）。
- `handleSelectFiles`（`:195-260`）：`openFileDialog` 结果三分（largeFiles/skippedFiles/oversized）各自 toast 提示；上传同 saveFiles 路径。
- `handleDragLeave` 兄弟 zone 切换不闪烁（relatedTarget 判定，`:184-193`）；`activateOnKey` Enter/Space 可访问性（`:272-277`）；上传中 pointer-events 禁用（`:269`）。

## 4. 调用者与调用链

入向：侧栏文件区（非本批）。出向：`@/lib/file-utils`、`@profer/shared`（MAX_ATTACHMENT_SIZE）、`@profer/ui/primitives/tooltip`、sonner、`window.electronAPI.{getPathForFile,checkPathsType,saveFilesTo*,openFileDialog}`。

## 5. 数据 I/O 与副作用

IPC 文件上传/路径检测/文件对话框；toast 通知。

## 6. 分支、失败、取消与恢复

上传失败 toast+复位（`:97-102/:254-259`）；session 模式缺 sessionId 报错早退（`:34-37`）；isUploading 防重入（`:109`）。

## 7. 权限与权威状态

大文件不复制仅附加（保留原路径语义，`:48-53`）；`getPathForFile` 经 preload 受控桥。

## 8. 修改影响面

MAX_ATTACHMENT_SIZE 与 shared 契约同步；saveFilesTo* IPC 形状。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+双区三分支+大文件分流 | 已证实 | `:1-336` 逐行 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
