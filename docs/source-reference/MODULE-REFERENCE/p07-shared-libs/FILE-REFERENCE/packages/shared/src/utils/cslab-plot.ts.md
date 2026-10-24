---
path: packages/shared/src/utils/cslab-plot.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a8dd3e2f0ff7f206c82682c2a8c1ddaf29203fba
sha256: 92c972cdc32aeb3b5c14e3eb83a5a8cea896c0f70756b852f437ff39fe45ac67
lines: 233
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-plot.ts

## 1. 结论与边界

CSLab **图表数字化纯几何/标定函数**（`packages/shared/src/utils/cslab-plot.ts:1-8`）：主进程（Python 结果校验）与渲染进程（磁性吸附）共用，禁依赖运行时能力。红线：① 对数映射仅接受正数物理值，无法拟合如实返回 **null 不伪造**；② R² 统一在**物理数值空间**计算（线性/对数口径一致）。

边界：不读图（坐标由调用方传入）；`polygonArea` 注释限定「仅散点质量过滤轻量辅助」（`:223`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabPoint` | interface | 12-15 | `{x;y}` | |
| `CsLabSegmentProjection` | interface | 17-22 | `{point;distance;segmentIndex;polylineIndex}` | |
| `CsLabAxisScaleFit` | interface | 24-28 | `{scale:'linear'\|'log'; r2; predict(pixel)=>number}` | |
| `fitAxisScale` | function | 113-133 | `(ticks, preferred='auto', coordinate='px') => CsLabAxisScaleFit\|null` | 自动选线性/对数 |
| `mapPixelToValue` | function | 136-146 | `(pixel, ticks, scale, coordinate) => number\|null` | |
| `projectPointOnSegment` | function | 149-176 | `(point, start, end) => CsLabSegmentProjection` | 含端点裁剪 |
| `snapPointToPolyline` | function | 185-221 | `(point, polylines, threshold) => CsLabSegmentProjection` | 磁性吸附 |
| `polygonArea` | function | 224-233 | `(points) => number` | 鞋带公式 |

内部：`mean`/`computeR2`（`:30-48`）、`fitLinear`（`:50-74`）、`fitLogarithmic`（`:76-104`）。

## 3. 内部逻辑与关键流程

- `computeR2`（`:35-48`）：物理空间 R²；`ssTot===0` 时完美=1 否则 0。
- `fitLinear`/`fitLogarithmic`（`:50-104`）：最小二乘 `value~pixel`（对数版先 `log10`，predict 用 `10**`）；分母 0 → null；**对数版非正 tick → null**（`:80`）。
- `fitAxisScale`（`:113-133`）：过滤非有限 tick、≥2 个；preferred 偏好+回退；`auto` 取 R² 高者，**平局选线性**（`> +1e-9` 判优，`:131-132`，确定性）。
- `mapPixelToValue`（`:136-146`）：拟合失败/非有限 → null。
- `projectPointOnSegment`（`:149-176`）：零长线段退化为点投影（`:157-164`）；`t∈[0,1]` 端点裁剪。
- `snapPointToPolyline`（`:185-221`）：全折线×全段取最近投影；距离 ≤threshold 返回投影（带 segment/polyline 索引），否则返回原点+`(-1,-1)` 索引（`:214-220`）。
- `polygonArea`（`:224-233`）：鞋带公式取绝对值/2；<3 点返回 0。

## 4. 调用者与调用链

出向：类型 `../types/cslab`（CsLabAxisTick，`:10`）。入向（检索=符号名+模块名，全冻结树）：

- `mapPixelToValue`/`snapPointToPolyline`：`apps/electron/src/renderer/…/CsLabPlotDigitizerPanel.tsx:12-13,237-241`（唯一产品调用，renderer 数字化面板）。
- `fitAxisScale`：仅测试（`cslab-cv-cas.test.ts:7,15,38,49,57`）。
- `projectPointOnSegment`：仅内部（`:198`）。
- `polygonArea`：**全树零调用**（含模块内）。
- 3 类型接口：仅自用+barrel。
- 测试：`apps/electron/src/main/lib/cslab/cslab-cv-cas.test.ts`（9 test，批外）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯几何/标定函数。

## 6. 分支、失败、取消与恢复

失败形态= null（红线不伪造）；`snapPointToPolyline` 阈值外原样返回（`:215-220`）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:6-7`）：正数限制+物理空间 R²。

## 8. 修改影响面

- R² 平局判据（1e-9）与 null 语义影响数字面板标定行为。
- 测试：批外 `cslab-cv-cas.test.ts`（9 test）。

## 9. 测试证据

本批**无**直接测试；间接 `cslab-cv-cas.test.ts`（批外 9 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（正数/null/物理空间 R²） | 已证实 | `:6-7,80,143` |
| 平局选线性（确定性） | 已证实 | `:131-132` |
| 吸附阈值外原样返回 | 已证实 | `:214-220` |
| `polygonArea` 全树零调用、`projectPointOnSegment` 仅自调 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实数字化操作验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 接口 + 5 函数 | §2 | 12-233 | covered |
| fit 三路+R² | §3 | 35-133 | covered |
| 投影/吸附 | §3 | 149-221 | covered |
| polygonArea | §3 | 224-233 | covered（零调用） |
