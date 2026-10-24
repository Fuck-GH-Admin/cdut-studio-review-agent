---
path: apps/electron/src/renderer/components/cdut-science/CsLabOriginPlotPane.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 22953644fddac68c9eb996b6a2b1553d9354ce62
sha256: 6b2a4874aa07f385e20ff2c3434004093236ab6429f08e0159d7eb10aae5ff89
lines: 477
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabOriginPlotPane.tsx

## 1. 结论与边界

**CSLab Origin 级出版绘图窗格**（`apps/electron/src/renderer/components/cdut-science/CsLabOriginPlotPane.tsx:1-3`）：出版级绘图（ROI/拟合/期刊预设/文档）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabOriginPlotPane` | 组件 | `:30-477` | 绘图窗格 |

内部：`CsLabAgentPlotRoi`/`CsLabFitResult`/`CsLabJournalPresetId`/`CsLabPlotDocument` 类型（`:8-12`）。

## 3. 内部逻辑与关键流程

绘图编辑（ROI/拟合/期刊预设）→保存/导出（Save/Download）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（绘图区）。
- 出向：绘图 API。

## 5. 数据 I/O、读写与副作用

经 API 保存/导出。

## 6. 分支、失败、取消与恢复

加载态；保存失败。

## 7. 权限与权威状态

无身份语义；出版级绘图（期刊预设）。

## 8. 修改影响面

`CsLabPlotDocument` 等类型契约；期刊预设表。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:30-477`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabOriginPlotPane` | `:30-477` | covered |
