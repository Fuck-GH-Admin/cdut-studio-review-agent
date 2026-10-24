---
path: apps/electron/src/renderer/atoms/preview-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc2f9ff5ef5e5bbacbb6c20a2d7c95ab192e162b
sha256: ae4fb1febef3d95337a404e72cccfcf5942fbfbe09bdbd01994cb2641e94bc01
lines: 184
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/preview-atoms.ts

## 1. 结论与边界

**内联预览/Diff 面板状态 Atoms**（`apps/electron/src/renderer/atoms/preview-atoms.ts:1-4`）：每 Agent 会话独立预览面板状态（选中文件/开关）。

## 2. 导出与关键符号

`export` 共 **18 个**（按真实行号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PreviewFile` | interface | `:15` | — |
| `previewFileMapAtom` | const | `:40` | — |
| `autoPreviewEnabledAtom` | const | `:43` | — |
| `QuotedSelectionSourceType` | type | `:48` | — |
| `QuotedSelection` | interface | `:51` | — |
| `quotedSelectionMapAtom` | const | `:73` | — |
| `currentQuotedSelectionAtom` | const | `:76` | — |
| `AgentInterruptionState` | interface | `:90` | — |
| `agentInterruptionMapAtom` | const | `:100` | — |
| `currentAgentInterruptionAtom` | const | `:103` | — |
| `AgentInterruptionTone` | type | `:110` | — |
| `getAgentInterruptionTone` | function | `:113` | — |
| `DocumentHighlightTarget` | interface | `:126` | — |
| `documentHighlightTargetAtom` | const | `:152` | — |
| `pdfHighlightTargetAtom` | const | `:155` | — |
| `PreviewViewportState` | interface | `:165` | — |
| `previewViewportStateMapAtom` | const | `:177` | — |
| `previewViewportMemoryKey` | function | `:180` | — |

## 3. 内部逻辑与关键流程

每会话 Map 隔离；自动预览默认关（性能，`:42`）；引用来源四态（`:48`）。

## 4. 调用者与调用链

- 消费方：预览面板/Diff 面板。
- 出向：Jotai/localStorage。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

每会话隔离（`:39`）；默认关是性能取舍（`:42`）。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

5 个导出已证实（`:15-50`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:15-184` | covered |
