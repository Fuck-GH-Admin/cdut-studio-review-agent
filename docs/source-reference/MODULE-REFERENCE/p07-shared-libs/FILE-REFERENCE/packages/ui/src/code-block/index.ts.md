---
path: packages/ui/src/code-block/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 951b8e9b5ac7dc97e2b2a07d8a8615d8d0974cc1
sha256: a5b3de983266fc4d9ed72452ee223682d823c9a95b9e00ad6ce6a4ce04f9ece6
lines: 7
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/code-block/index.ts

## 1. 结论与边界

代码块组件的**模块 barrel**（`packages/ui/src/code-block/index.ts:1-7`）：仅再导出 `CodeBlock`，无逻辑。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CodeBlock` | re-export | `:7` | `export { CodeBlock } from './CodeBlock.tsx'` | 唯一导出 |

## 3. 内部逻辑与关键流程

无（纯 re-export）。

## 4. 调用者与调用链

入向：`packages/ui/src/index.ts:8`（`@profer/ui` 包入口再导出）；外部直接消费者经包入口（`CodeBlock` 2 个外部文件：`ai-elements/message.tsx`、`settings/ReleaseNotesViewer.tsx`，均走 `@profer/ui`）。出向：`./CodeBlock.tsx`（本批同组手册）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

不适用，依据：纯 re-export 无分支。

## 7. 权限与权威状态

无。

## 8. 修改影响面

改导出名 → `packages/ui/src/index.ts:8` 与上述 2 个消费者。

## 9. 测试证据

无直接测试（barrel 无逻辑）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一 re-export | 已证实 | 逐行读 `:1-7` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CodeBlock` re-export | §2/§4 | `:7` | covered |
