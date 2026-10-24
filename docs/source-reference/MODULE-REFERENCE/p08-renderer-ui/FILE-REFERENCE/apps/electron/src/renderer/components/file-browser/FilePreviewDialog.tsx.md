---
path: apps/electron/src/renderer/components/file-browser/FilePreviewDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 00d9c52a0bf7e127b6797c0e9eb292a0f34312ad
sha256: e859f12f9c1ad770eca1bc8712b2a2a79c643b600162983dcc624c75010dfb92
lines: 262
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/FilePreviewDialog.tsx

## 1. 结论与边界

文件内嵌预览弹窗（运行时组件）：按扩展名分派——图片自渲染（useSmoothZoom 普通滚轮缩放+rAF 平滑+指针锚定；OFV imagePlugin 体验不足改回，`:5-7` 注释）、PDF→prepare-pdf-preview iframe、Office→只读 OfficePreview、代码/文本→查看器、其他→文件信息+下载提示（`apps/electron/src/renderer/components/file-browser/FilePreviewDialog.tsx:1-12`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FilePreviewDialogProps` | 接口 | 27-34 | open/filePath/fileName/onClose/teamDownload?（团队模式先下载） |
| `FilePreviewDialog` | 组件 | 71-262 | 唯一导出组件 |

内部：`PreviewState` 八态联合（`:36-44`：loading/image/html/office/iframe/text/unsupported/error）、`TEXT_EXTS/IMAGE_EXTS`（`:46-53`）、`ext/langFromExt`（`:55-69`）。

## 3. 内部逻辑与关键流程

`loadPreview`（`:86-132`）：teamDownload 先下载（失败 error，`:91-95`）；`candidateBasePaths=[parentDir]` 授权上下文（`:98-100`）；分支——图片 `registerPreviewPath`（`:102-105`）、PDF `preparePdfPreview`（`:106-109`）、Office `normalizeOfficeFormat`→OfficePreview（`:110-111`）、HTML **DOMPurify 消毒（FORBID script/style/iframe/object/embed/form/input/button + style 属性）+CSP meta**（`:112-121`）、文本 `resolveAndReadFile`（md 走 ReactMarkdown+remarkGfm，其余 pre/code，`:122-125/:234-243`）、其他 unsupported（`:126-127`）。

顶栏（`:178-198`）：默认应用打开 `systemOpenFile`、文件夹中显示 `showItemInFolder`、关闭；`hideClose` 防双关闭按钮（`:173-174` 注释）。图片态放大弹窗尺寸（`:176`）。

## 4. 调用者与调用链

入向：FileBrowser/侧栏预览入口（非本批）。出向：`./office-preview/OfficePreview`、`./office-preview/silurus-bridge`（normalizeOfficeFormat）、`@profer/ui`（Dialog/primitives/useSmoothZoom）、DOMPurify、react-markdown+remark-gfm、`window.electronAPI.{registerPreviewPath,preparePdfPreview,resolveAndReadFile,systemOpenFile,showItemInFolder}`。

## 5. 数据 I/O 与副作用

IPC 读文件/注册预览路径/打开外部应用/定位文件；团队模式下载。

## 6. 分支、失败、取消与恢复

各分支失败→error 态显式文案（`:105/:109/:114/:125/:130`）；异常 catch 统一（`:129-131`）。

## 7. 权限与权威状态

HTML 预览沙箱：`iframe sandbox=""` + DOMPurify + CSP `default-src 'none'`（`:115-121/:221`）。

## 8. 修改影响面

扩展名分派表与预览 IPC 契约同步；OfficePreview/silurus-bridge 接口。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+八态分派+沙箱 | 已证实 | `:1-262` 逐行 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支/沙箱 | §2/§3/§7 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
