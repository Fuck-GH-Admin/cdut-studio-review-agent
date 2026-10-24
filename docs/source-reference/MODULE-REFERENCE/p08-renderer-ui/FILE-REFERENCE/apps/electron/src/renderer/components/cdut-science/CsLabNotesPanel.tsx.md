---
path: apps/electron/src/renderer/components/cdut-science/CsLabNotesPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 739860ae153370a36c76e8d8a826f8d9deac53a8
sha256: 753c55e690adf66ca6d4ceec686116a15637adaac99a2d17a2989f8507d1c745
lines: 394
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabNotesPanel.tsx

## 1. 结论与边界

**Vault 笔记与 JSON Canvas 浏览**（`apps/electron/src/renderer/components/cdut-science/CsLabNotesPanel.tsx:1-5`）：**Markdown 只读预览（Obsidian 是唯一事实源）**；Canvas 直接交给 DAG 舞台打开。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabNotesPanel` | 组件 | `:31-394` | 笔记/Canvas 面板 |

## 3. 内部逻辑与关键流程

Markdown 只读预览（ReactMarkdown+remarkGfm）；Canvas→DAG 舞台（`:4`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（笔记区）。
- 出向：`react-markdown`、DAG 舞台（`CsLabDagCanvas`）。

## 5. 数据 I/O、读写与副作用

读 Vault（Obsidian 唯一事实源）；无写。

## 6. 分支、失败、取消与恢复

加载/空态。

## 7. 权限与权威状态

**Obsidian 唯一事实源**（`:4`）——只读预览不写回。

## 8. 修改影响面

Markdown 渲染链（remarkGfm）；Canvas→DAG 协议。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、Obsidian 唯一源已证实（`:1-394`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabNotesPanel` | `:31-394` | covered |
