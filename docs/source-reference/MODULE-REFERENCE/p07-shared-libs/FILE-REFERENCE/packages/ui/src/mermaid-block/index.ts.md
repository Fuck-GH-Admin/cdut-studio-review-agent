---
path: packages/ui/src/mermaid-block/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 593c5d5fc9f24d70e9d7528be451e8d02db22cbc
sha256: 637c2f18f0326fd9802dd65fb060e6438529bcdec8c9ffa7ba5ce4a3f20a5eb4
lines: 7
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/mermaid-block/index.ts

## 1. 结论与边界

Mermaid 图表组件的**模块 barrel**（`packages/ui/src/mermaid-block/index.ts:1-7`）：仅再导出 `MermaidBlock`（文件头注释 `:2-4` 自述"使用 beautiful-mermaid 渲染的 MermaidBlock 组件"——beautiful 优先+官方兜底的实际策略见 MermaidBlock 手册）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MermaidBlock` | re-export | `:7` | `export { MermaidBlock } from './MermaidBlock.tsx'` | 唯一导出 |

## 3. 内部逻辑与关键流程

无（纯 re-export）。

## 4. 调用者与调用链

入向：`packages/ui/src/index.ts:9`；外部消费者 3 文件（`ai-elements/MindMapBlock.tsx`、`ai-elements/message.tsx`、`diff/markdown-preview-extensions.tsx`，均经 `@profer/ui`）。出向：`./MermaidBlock.tsx`（本批同组手册）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

不适用，依据：纯 re-export 无分支。

## 7. 权限与权威状态

无。

## 8. 修改影响面

改导出 → `packages/ui/src/index.ts:9` 与上述 3 个消费者。

## 9. 测试证据

无直接测试（barrel 无逻辑）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一 re-export | 已证实 | 逐行读 `:1-7` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MermaidBlock` re-export | §2/§4 | `:7` | covered |
