---
path: apps/electron/src/main/lib/cslab/cslab-zotero-format.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e6d2e045ce3b300fd32226b0afea0cc202d21d4f
sha256: ba29a62951905cc928457f053117cd4dfc53801c50262b5fabd8466c1abd4651
lines: 67
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-zotero-format.ts

## 1. 结论与边界

**Zotero 附件路径解析**（主进程）：纯坐标函数已下沉 `@profer/shared`（避免渲染进程引入 node:path），旋转方向与 PDF.js PageViewport 一致（`apps/electron/src/main/lib/cslab/cslab-zotero-format.ts:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| re-export 3 函数+4 类型 | 10-20 | | `normalizeRotation`/`parseZoteroAnnotationPosition`/`zoteroRectToViewport` + 4 类型（自 shared） |
| `ZoteroAttachmentPathInput` | 接口 | 22-28 | `{path, attachmentKey, dataDir, linkedBasePath?}` |
| `ZoteroAttachmentPathResult` | 接口 | 30-33 | `{path?, reason?}` |
| `resolveZoteroAttachmentPath` | 函数 | 42-67 | 附件路径→宿主绝对路径 |

## 3. 内部逻辑

`resolveZoteroAttachmentPath` 三分支：`storage:`→`<dataDir>/storage/<attachmentKey>/<rest>`（`:50-54`）；`attachments:`→`<linkedBasePath>/<rest>`（无 linkedBasePath 报 reason，`:56-63`）；其他→绝对路径原样/相对路径拼 dataDir（`:65-66`）。Windows 反斜杠归一（`:48`）；缺 path/缺文件名/缺相对路径给 reason（`:46/:52/:58`）。

## 4. 调用者与调用链

入向：CSLab 文献/Zotero 模块（非本批，经 index）。出向：`node:path`、shared。

## 5-6. I/O/分支

无 I/O；解析失败返回 reason 不抛。

## 7. 权限与权威状态

不适用（纯路径解析）。

## 8. 修改影响面

路径规则变更与 Zotero 库结构/linkedAttachmentBasePath 配置契约同步。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 接口/函数+三分支 | 已证实 | `:1-67` |
| shared 下沉函数实现 | 未知 | 非本批 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
