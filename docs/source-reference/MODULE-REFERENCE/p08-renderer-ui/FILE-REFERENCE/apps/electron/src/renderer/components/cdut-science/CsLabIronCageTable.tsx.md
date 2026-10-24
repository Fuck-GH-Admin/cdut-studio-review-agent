---
path: apps/electron/src/renderer/components/cdut-science/CsLabIronCageTable.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 370ae2c497ad02f9c995879facc0263137ea0f1a
sha256: c7f2148a247e2cbcce5e31f0ceb8a73ec53ce7ec85e0d4c76b750f1de553b933
lines: 188
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabIronCageTable.tsx

## 1. 结论与边界

**只读数据铁笼表**（`apps/electron/src/renderer/components/cdut-science/CsLabIronCageTable.tsx:1-5`）：**红线：所有单元格只读**；显示 SHA-256 只读徽章；单元格可拖拽为 `cdut://` 胶囊载荷。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabIronCageTable` | 组件 | `:46-188` | 铁笼表 |

内部：`CsLabIronCageTableProps`（`:12-…`）；`CSLAB_CELL_MIME`（cslab-dnd）。

## 3. 内部逻辑与关键流程

只读表格（`:4`）；SHA-256 徽章；拖拽 `cdut://` 胶囊载荷（`CsLabTablePayload`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（数据区）。
- 出向：`cslab-dnd`（MIME）。

## 5. 数据 I/O、读写与副作用

拖拽载荷（`CSLAB_CELL_MIME`）；无写。

## 6. 分支、失败、取消与恢复

只读（无写分支）。

## 7. 权限与权威状态

**所有单元格只读**（`:4`）——数据铁笼红线；SHA-256 徽章披露。

## 8. 修改影响面

`CsLabCellRef`/`CsLabCellValue`/`CsLabTablePayload` 契约；拖拽 MIME。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、只读红线已证实（`:1-188`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabIronCageTable` | `:46-188` | covered |
