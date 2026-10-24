---
path: apps/electron/src/main/lib/attachment-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b565773008bcafc31fd9f9d53e1bf9caae1562c4
sha256: 2e9ae1c26734155f5a4b33690d70bc3e1981a517838541b5072591981e792afa
lines: 326
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/attachment-service.ts

## 1. 结论与边界

**附件存储服务**（326 行）：本地存储/读取/删除，路径 `~/.proma/attachments/{conversationId}/{uuid}.ext`（`:5`）；小文件 base64 读入、**大文件仅返回路径引用**（`:10`/`:245`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `isImageAttachment` | `:114-116` | 4 种图片 MIME |
| `getMimeType` | `:121-124` | 扩展名→MIME（`MIME_MAP:42-90` 含 WPS/et/dps 国产格式）；未知→octet-stream |
| `saveAttachment` | `:135-168` | base64 解码落盘；**>100MB 拒绝**（`data.length*0.75` 估算 `:138-142`）；uuid 命名 |
| `readAttachmentAsBase64` | `:180-201` | 相对路径解析+**绝对路径安全校验**（必须在 configDir 下防路径穿越 `:184-189`） |
| `deleteAttachment`/`deleteConversationAttachments` | `:208-219`/`:228-239` | 单删/整目录 rmSync（失败 warn 不抛） |
| `openFileDialog` | `:249-326` | Electron 对话框多选；**三态分流**（小文件 base64/大文件 largeFiles 引用/skippedFiles 原因码）；macOS 父窗口防遮挡（`:250-251`） |

内部：`FILE_FILTERS:93-109`、IMAGE_MIME_TYPES。

## 3. 内部逻辑与关键流程

对话框→statSync 前置校验（非普通文件/读不了→skipped）→>100MB→largeFiles→读取失败→skipped→正常→base64。

## 4. 调用者与调用链

附件 IPC（保存/读取/删除/选择）；出向 `./config-paths`、`@profer/shared`（MAX_ATTACHMENT_SIZE/类型）、electron dialog。

## 5. 数据 I/O、读写与副作用

文件读写/删除、Electron 对话框。

## 6. 分支、失败、取消与恢复

取消→空 files；超限→largeFiles；不可读→skippedFiles（reason:'unreadable'+message）；删除失败 warn 不抛。

## 7. 权限与权威状态

- **路径穿越防线**（`:184-189`）：绝对路径必须在 configDir 内。
- **100MB 上限**（shared 常量，保存/对话框双闸）。

## 8. 修改影响面

改 MIME_MAP/过滤器影响附件兼容性；安全校验是附件读取红线。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件七导出/三态分流/安全闸 | 已证实 | 326 行全读（主根自读兜底） |
| **照实**：`:5`/`:130` 注释路径仍写 `~/.proma/`（去 proma 化后 configDir 实际名未核——config-paths 不在本批）；`:187` startsWith 校验对 `configDir2` 前缀误放行未做分隔符边界（normalize 后前缀碰撞理论可能，照实） | 已证实 | `:5`/`:187` |
| config-paths resolveAttachmentPath 实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 7 导出/分流/安全闸 | §2/§3/§7 | covered |
| 照实边界 | §10 | covered |
