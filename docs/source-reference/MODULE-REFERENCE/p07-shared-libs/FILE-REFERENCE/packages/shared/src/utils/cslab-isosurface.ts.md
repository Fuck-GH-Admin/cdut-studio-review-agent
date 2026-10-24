---
path: packages/shared/src/utils/cslab-isosurface.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a9375f346f9cf656242d88996090dca73828aa39
sha256: a48650b89928abe8cea66c23073c3cb967285e43a035f36b2cd1c7e4c3dec063
lines: 275
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-isosurface.ts

## 1. 结论与边界

CSLab 等值面提取（**CPU Marching Tetrahedra**，`packages/shared/src/utils/cslab-isosurface.ts:1-6`）：每体素拆 6 四面体、仅 16 种拓扑——避免手写 256 项 Marching Cubes 三角表差错风险；输出带法线三角网格。

边界：CPU 版（WebGPU 版在 webgpu hook 另模块）；顶点上限 **500 万**（超出抛错提示降分辨率，`:11,157-158`）；维度 <2 任一维返回空网格（`:174-183`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `extractIsosurfaceCpu` | function | 168-270 | `(grid: CsLabVolumeGrid, isovalue, phase='positive'\|'negative') => CsLabIsoMesh` | 主入口 |
| `sampleVolume` | function | 273-275 | `(grid, x, y, z) => number` | 三线性采样兼容导出（直通 `sampleGrid`） |

内部：`CUBE_CORNERS`/`TETRAHEDRA`（`:15-33`，6 四面体拆分）、`cross/dot/normalize/add/scale`（`:35-59`）、`positionAt`（`:61-70`，体素仿射定位）、`gradientBasis/gradientAt`（`:78-111`，倒易基+中心差分梯度）、`vertexKey/interpolate/addVertex`（`:120-165`）、`MeshBuilderState`（`:113-118`）。

## 3. 内部逻辑与关键流程

`extractIsosurfaceCpu`（`:168-270`）：

1. `:173-183` 维度 <2 → 空 `CsLabIsoMesh`（含 isovalue/phase 透传）。
2. `:185` 梯度基（体积近零 → null，梯度退回网格坐标差分）。
3. `:196-260` 逐体素×6 四面体：`inside=value>=isovalue`；0/4 全同侧跳过（`:215`）；1/3 情形单点三边插值出一三角形（绕序按内外翻转，`:235-243`）；2-2 情形四边形拆两三角形（`:246-256`）。
4. 插值（`:124-147`）：`t=(iso-start)/(end-start)`（分母近零取 0.5）；法线取最近格点 `gradientAt`（中心差分+倒易基变换，`normalize`）。
5. 顶点去重（`vertexKey` 1e-5 精度，`:120-122`）；≥500 万顶点抛错（`:157-158`）。
6. `:262-269` 输出 Float32Array positions/normals + Uint32Array indices + triangleCount。

## 4. 调用者与调用链

出向：`../types/cslab-vesta-types`（CsLabIsoMesh/CsLabVolumeGrid）、`./cslab-volume`（sampleGrid）（`:8-9`）。入向（检索=符号名+模块名，全冻结树）：

- `extractIsosurfaceCpu`：`packages/shared/src/utils/cslab-volume.test.ts:3,68`（批外 8 test）、`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:18,99`（唯一产品调用）。
- `sampleVolume`：零外部引用（仅 barrel）。
- **同名碰撞警示**：`apps/electron/src/renderer/lib/webgpu/use-cslab-isosurface.ts`（WebGPU hook）名族相近但非本模块。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯计算，输入网格进出网格。

## 6. 分支、失败、取消与恢复

唯一抛错=顶点超限（`:158`）；空网格/零体积基为静默降级；无异步/取消。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

6 四面体拆分/绕序/插值口径影响渲染 worker 网格几何；`CsLabIsoMesh` 形状是渲染契约。测试：批外 `cslab-volume.test.ts`（8 test，:66 等值面用例）。

## 9. 测试证据

本批**无**直接测试；间接 `cslab-volume.test.ts`（批外 8 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| Marching Tetrahedra 16 拓扑（1/3 与 2-2 分支） | 已证实 | `:209-256` |
| 500 万顶点硬上限 | 已证实 | `:11,157-158` |
| 梯度倒易基+中心差分 | 已证实 | `:78-111` |
| `sampleVolume` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实体数据精度验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 168-275 | covered |
| 1/3 与 2-2 拓扑 | §3 | 235-256 | covered |
| 插值/法线/去重 | §3 | 120-165 | covered |
| 超限/空网格 | §3 | 157-183 | covered |
