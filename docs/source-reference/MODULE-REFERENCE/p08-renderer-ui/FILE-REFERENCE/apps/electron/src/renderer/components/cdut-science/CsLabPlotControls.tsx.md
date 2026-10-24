---
path: apps/electron/src/renderer/components/cdut-science/CsLabPlotControls.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f56501d6ad7728807172cbf5bc8a82651b254f19
sha256: af4806067c3d97298dbc7986f6a4040ca572c35ce8b9b97d543cd08fced207d6
lines: 128
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabPlotControls.tsx

## 1. 结论与边界

绘图图层面板（头注释 :2）：单层（layers[0]）可见性/序列可见性/三轴刻度（linear/log10/log2 :13-17）。

## 2. 导出与关键符号

导出 1 条（`export` :19）：`CsLabPlotControls({document, onChange})`（:19-128）。内部：`SCALES`（:13-17）。

## 3. 内部逻辑与关键流程

无图层兜底文案（:21）；`updateLayer`（:23-29）：只 patch layers[0]+updatedAt；序列可见性 map 更新（:49-55）；X/左右 Y 三 select（:69-124，yAxes[0]/[1] 非空断言）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabOriginPlotPane.tsx:18` → :457（document/onChange 由其注入）。出向：仅 React+`@profer/shared` 类型（无 electronAPI/hooks）。

## 5-7. 数据/分支/权限

纯受控组件；无 I/O；不适用。

## 8. 修改影响面

- 消费面：绘图工具面板。
- 依赖面：CsLabPlotDocument 形状（layers/yAxes 双轴）。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；单层 patch 语义 | 已证实 | :23-29 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+三轴控制 | §2/§3 | :19-128 | covered |
