---
path: apps/electron/src/renderer/components/cdut-science/CsLabAssetRail.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 654795602fd8a90e43f92ae3f83d38076f85eb2d
sha256: e7539bd84ccb130a6e49f470673301d92ef984160c3a435cf2fc45e690645584
lines: 410
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabAssetRail.tsx

## 1. 结论与边界

**六维科研资产导航**（`apps/electron/src/renderer/components/cdut-science/CsLabAssetRail.tsx:1-6`）：文献/笔记/实验/数据/图表/文稿六维分组；**所有条目来自真实资产**（空维度克制空态）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabAssetRail` | 组件 | `:93-410` | 资产导航 |

## 3. 内部逻辑与关键流程

六维分组（`:4`）；真实资产条目（`:5`）；点击跳对应视图。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（左栏）。
- 出向：Jotai（视图切换）。

## 5. 数据 I/O、读写与副作用

读资产列表；无写。

## 6. 分支、失败、取消与恢复

空维度空态（`:5`）。

## 7. 权限与权威状态

**条目来自真实资产**（`:5`）——不虚构。

## 8. 修改影响面

六维分组口径；资产类型契约。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、真实资产红线已证实（`:1-410`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabAssetRail` | `:93-410` | covered |
