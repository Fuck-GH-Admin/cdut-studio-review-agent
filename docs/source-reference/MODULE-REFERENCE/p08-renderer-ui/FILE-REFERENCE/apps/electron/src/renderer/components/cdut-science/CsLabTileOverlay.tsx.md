---
path: apps/electron/src/renderer/components/cdut-science/CsLabTileOverlay.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4a9a2c6f600e96dad72706b21483d203552ae215
sha256: fe624ebf8c40e1b955f33e2bbebae04ca4377dcd53e53d4fbf22127f32ada873
lines: 74
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabTileOverlay.tsx

## 1. 结论与边界

资产拖拽四象限定向投射遮罩（头注释 :2-5）：只在拖 CSLab 资产时出现；文件摄取/胶囊拖拽不触发。

## 2. 导出与关键符号

导出 1 条（`export` :31）：`CsLabTileOverlay({visible, targetPaneId, onHoverPane, onDropOnPane})`（:31-74）。内部：`POSITION_LABELS`（:24-29，四象限中文标签）。

## 3. 内部逻辑与关键流程

visible=false 返 null（:37）；2×2 网格四 pane（:41-71）：dragOver 仅认 `CSLAB_ASSET_MIME`（:47，dropEffect 'copy'）；drop 读 payload→onDropOnPane（:53-59）；active 态高亮（:61-66）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:89` → :2193-2198（visible=!!assetDrag、onDropOnPane=handleTileDrop）。出向：`@/atoms/cslab-atoms`（CSLAB_PANE_IDS :9→:41）、`./cslab-dnd`（hasDragType :47/:54、readAssetDrag :57）。

## 5-7. 数据/分支/权限

无 I/O；MIME 类型门=拖拽权限边界；不适用取消/恢复。

## 8. 修改影响面

- 消费面：CsLabWorkspaceView 拖拽投射。
- 依赖面：cslab-dnd 契约（CSLAB_ASSET_MIME）。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；MIME 门+四象限 | 已证实 | :24-74 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+拖拽门 | §2/§3 | :31-74 | covered |
