---
path: packages/shared/src/utils/cslab-polyhedra.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a12f2dba2d474bcbf88fa51322d9add2c88658b0
sha256: 3fa3e44d12b66fa5968e27045744d169e900ff0024c091e4e5470884acd17f30
lines: 226
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-polyhedra.ts

## 1. 结论与边界

CSLab **配位多面体**纯函数（`packages/shared/src/utils/cslab-polyhedra.ts:1-7`）：周期近邻搜索（小体系 O(N²)，注释宣称大体系 Cell List 分桶——实现实际是镜像三重循环，见 §10）、暴力凸包（邻居 ≤24）、配位数/体积/平均键长/键长方差/畸变度。

边界：邻居数 <4 或共面（faces<6）跳过返回空（`:177,193,196`）；凸包是 O(n⁴) 暴力枚举（`:125-155`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `buildNeighborList` | function | 50-111 | `(atoms, cell, options: CsLabNeighborOptions) => Map<number, NeighborHit[]>` | 中心元素→近邻（距离升序） |
| `buildPolyhedra` | function | 178-226 | → `CsLabPolyhedron[]` | |

内部：`Vector3`/`subtract`/`cross`/`dot`/`length`（`:17-41`）、`NeighborHit`（`:43-47`）、`computeHullFaces`（`:113-158`）、`hullVolume`（`:160-175`）。

## 3. 内部逻辑与关键流程

### 3.1 `buildNeighborList`（`:50-111`）

cutoff 钳 ≥0.1；候选=元素在 `neighborElements` 集内（`:59-61`）；镜像范围 `range=max(1, ceil(cutoff/最短边)+1)`（`:64-65`，保证截断半径内镜像全覆盖）；逐中心（element===centerElement）× 候选 × 镜像三重循环，分数差→笛卡尔距离，≤cutoff 入选；`seenPositions` 按 `index:1e4 精度分数坐标` 去重（`:91-93`）；按距离排序。

### 3.2 `computeHullFaces`（`:113-158`）

暴力凸包：三点组→法向（共线跳过 epsilon 1e-6）→其余点同侧判定（异侧跳过）→去重（排序 key）→以质心定外向绕序（`:150-152`）。

### 3.3 `buildPolyhedra`（`:178-226`）

近邻取前 24（`:188`）；点数<4 或 faces<6 跳过；键长 mean/variance/distortion=√variance/mean（mean=0 → 0）；输出 `CsLabPolyhedron` 9 字段（vertices 平铺、hullVolume 用三角面相对质心求和 `:168-173`）。

## 4. 调用者与调用链

出向：`../types/cslab`/`../types/cslab-vesta-types` 类型、`./cslab-crystal`（fractionalToCartesian）（`:9-15`）。入向（检索=符号名+模块名，全冻结树）：

- `buildPolyhedra`：`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:14,89`（唯一产品调用）+ 本批 `cslab-polyhedra.test.ts:5,22`。**同名碰撞警示**：`CsLabVestaCrystalPane.tsx:208` 本地 `const buildPolyhedra` 处理器（`:408` 调本地版）。
- `buildNeighborList`：仅内部（`:183`）+ barrel（零外部引用）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

无异常路径（不足/共面静默跳过）；无异步/取消。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

近邻截断/镜像范围/凸包 epsilon 影响渲染 worker 的多面体几何；`CsLabPolyhedron` 形状是渲染契约。测试：`cslab-polyhedra.test.ts`（本批 1 test）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-polyhedra.test.ts`（本批，36 行/1 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 镜像范围公式保证全覆盖 | 已证实 | `:63-65` |
| 前 24 邻居上限 | 已证实 | `:188` |
| 暴力凸包 O(n⁴)+共面跳过 | 已证实 | `:113-158,196` |
| `buildNeighborList` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| **注释与实现不符**：头注称「大体系 Cell List 分桶」，实现为镜像三重循环（无分桶） | 已证实（照实记录） | `:4,73-102` |
| 真实晶体几何验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 50-226 | covered |
| 近邻搜索 | §3.1 | 50-111 | covered |
| 凸包 | §3.2 | 113-175 | covered |
| 多面体组装 | §3.3 | 178-226 | covered |
