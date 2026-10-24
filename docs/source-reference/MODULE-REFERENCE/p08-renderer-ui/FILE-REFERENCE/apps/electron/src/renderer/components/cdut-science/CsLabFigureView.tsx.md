---
path: apps/electron/src/renderer/components/cdut-science/CsLabFigureView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 859b4ddd82e3951d27494101bd1cbc7dab67a9ff
sha256: 3992b066dee42dfdc03a95e087cf76d08b64c31a04394a3d5f3b1c4a1f70a37c
lines: 518
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabFigureView.tsx

## 1. 结论与边界

**科研图表与图像窗格**（`apps/electron/src/renderer/components/cdut-science/CsLabFigureView.tsx:1-9`）：高保真平移缩放、超大图分辨率预检、一键逆向数字化（全图）、框选公式验算（局部裁剪）。**红线：所有 Canvas 光栅化统一限制最大边 4096/总像素 24MP，绝不以原始分辨率直接 drawImage 超大图**（`:7-8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabFigureView` | 组件 | `:58-518` | 图表窗格 |

## 3. 内部逻辑与关键流程

平移缩放→分辨率预检（4096/24MP 上限）→逆向数字化/框选验算。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（图表区）。
- 出向：Canvas API（受限光栅化）。

## 5. 数据 I/O、读写与副作用

Canvas 光栅化（限最大边/总像素）；导出。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 超大图 | `:7-8` | 预检限制（4096/24MP） |

## 7. 权限与权威状态

**绝不原始分辨率 drawImage 超大图**（`:8`）——Canvas 资源红线。

## 8. 修改影响面

分辨率上限常量（4096/24MP）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、Canvas 红线已证实（`:1-518`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabFigureView` | `:58-518` | covered |
