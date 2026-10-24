---
path: apps/electron/src/renderer/components/cdut-science/CsLabSpectrumStrip.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b1f3e6256703bbb7852531ec916f155bba96e85d
sha256: 9e5ca3d0854791408fd1305fd72c236e5693a8c438f89c4cd317edc2bad41a0f
lines: 678
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabSpectrumStrip.tsx

## 1. 结论与边界

多通道 1D 谱图（头注释 :2-11）：XRD/拉曼/红外/MAT 多列曲线。**只画线与命中，不做峰识别/拟合**（:4）；点击返回真实 X 轴数值由上层解释（:5）。**多通道量纲红线**（:7-10）：默认共享绝对 Y 轴；线性/对数/归一化（0-100%）三量程防微弱信号压成死线；每通道胶囊展示真实 [min,max] 不隐藏量纲差异。

## 2. 导出与关键符号

导出 1 条（`export` :104）：`CsLabSpectrumStrip({series, highlights?, reflections?, selectedX?, loading?, onPick?, height?, activeKeys?, onActiveKeysChange?, showChannelToggles?, emptyHint?})`（:104-）。内部：`VIEW_WIDTH=1000`/`PADDING`（:34-35）、`CHANNEL_COLORS`（:36）、`SCALE_OPTIONS`（:47）、`formatTick`/`formatRange`/`nearestIndex`（:53/:62/:66）、`ChannelStat`（:94）、`totalIndexValid`（:676）。

## 3. 内部逻辑与关键流程

（头+大纲级，678 行）：纯 SVG 渲染（无 electronAPI/hooks）；三量程换算；命中 nearestIndex+onPick 返回真实 X。

## 4. 调用者与调用链

入向（子agent 交叉核，3 生产）：`CsLabDatasetView.tsx:47`（:513 split h=200/:534 strip h=320）、`CsLabMolstarViewer.tsx:40`（:764）、`crystal/CsLabVestaCrystalPane.tsx:27`（:515 PXRD 模拟谱）。出向：`@profer/shared`（CsLabTableSeries/CsLabXrdReflection）、`./cslab-vibrational`（CsLabVibrationalBand :16）。

## 5. 数据 I/O、读写与副作用

纯 SVG 渲染，无 I/O。

## 6. 分支、失败、取消与恢复

三量程分支；空 series 提示。不适用取消/恢复。

## 7. 权限与权威状态

量纲红线权威（:7-10）；点击语义=真实 X 值（:5）。

## 8. 修改影响面

- 消费面：DatasetView/MolstarViewer/VestaCrystalPane 三处谱图。
- 依赖面：shared 系列/反射类型、vibrational 波段。
- 需同步测试：无专属（全树 647 测试 0 命中）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；量纲红线 | 已证实 | :2-11/:34-47 |
| SVG 实现逐行 | 推断（头+大纲级） | :104-677 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+红线 | §2/§7 | :2-104 | covered |
| SVG 实现 | §3/§10 | :104-677 | 推断 |
