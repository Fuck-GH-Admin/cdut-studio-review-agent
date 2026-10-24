---
path: apps/electron/src/renderer/components/cdut-science/CsLabDatasetView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13dd4b94f21cd4e13e38bc9e6ec34238ee61015e
sha256: fe2a4e925233725b8bcb1a84c0e732e0279bf595d739cd87eb326e6cabfb7a26
lines: 568
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabDatasetView.tsx

## 1. 结论与边界

**科学数据集复合窗格**（`apps/electron/src/renderer/components/cdut-science/CsLabDatasetView.tsx:1-7`）：默认分屏（上多通道曲线/下只读数据铁笼）；三视图切换（曲线谱图/数据表格/分屏联动）；动作栏接后端能力（晶体关联/Python 工具/数据导出/实验批次）到当前文件。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabDatasetView` | 组件 | `:80-568` | 数据集窗格 |

## 3. 内部逻辑与关键流程

分屏（`:4`）；三视图切换（`:5`）；动作栏后端能力接入（`:6`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（数据区）。
- 出向：数据 API、`CsLabIronCageTable`（只读铁笼）。

## 5. 数据 I/O、读写与副作用

经 API 读数据/导出。

## 6. 分支、失败、取消与恢复

加载/空态。

## 7. 权限与权威状态

数据表格用只读铁笼（配套 IronCageTable 红线）。

## 8. 修改影响面

三视图协议；后端能力接口。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:1-568`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabDatasetView` | `:80-568` | covered |
