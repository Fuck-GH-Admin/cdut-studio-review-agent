---
path: apps/electron/src/renderer/lib/webgpu/isosurface.wgsl
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e6617b22aae370728c286b10ab14b1f22323cc7a
sha256: 18befc26bc584380d8be16698e47eecf171986ee3b0a8179d51825d2c3f68c73
lines: 208
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/webgpu/isosurface.wgsl

## 1. 结论与边界

CSLab 等值面提取 Compute Shader（文件头 `:1-6`，Marching Tetrahedra）：每 invocation 处理一个体素，立方体拆 6 四面体；每四面体收集 0-4 个边交点、按 3/4 顶点三角化；**法线由体数据梯度变换到笛卡尔坐标；三角形绕序按法线自动校正**。GPU 着色器源（由 `webgpu-isosurface.ts` 运行时加载）。

## 2. 导出与关键符号（WGSL 绑定与常量）

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `Params` | `:8-19` | dims/iso/origin/stepA/B/C（斜格基）/recA/B/C（**倒易基**）——各 vec4 对齐 |
| bindings | `:21-24` | volume(storage,read)/params(uniform)/vertices(storage,read_write)/counter(atomic<u32>) |
| `CORNERS[8]`/`TETS[6]`/`EDGES[6]` | `:26-52` | 立方体角点、6 四面体拆分、四面体 6 边 |
| `Vertex` | `:54-57` | `{position; normal}`（vec3×2） |
| `gridIndex` | `:59-61` | x + nx*(y + ny*z) 线性索引 |

## 3. 内部逻辑与关键流程

1. 每体素取 8 角点标量，遍历 6 四面体（TETS）。
2. 四面体内逐边（EDGES）求 iso 交点（线性插值），0-4 个交点。
3. 3 交点→单三角形、4 交点→双三角形（按经典 case 表）。
4. 法线=体数据梯度经倒易基（recA/B/C）变换到笛卡尔；**绕序按法线方向校正**（一致朝外）。
5. `counter` 原子递增分配顶点槽，写入 vertices（position+normal 交错）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`webgpu-isosurface.ts`（buildParams 打包同构 Params、dispatch、readback）。无直接测试。

## 5. 数据 I/O、读写与副作用

GPU storage/uniform/atomic 读写。无持久化。

## 6. 分支、失败、取消与恢复

边交点计数 0-4 各 case；越界顶点由 counter 容量截断（CPU 侧 vertexCapacity 预算，见 webgpu-isosurface 手册）。无异步/取消。

## 7. 权限与权威状态

法线/绕序口径如实（梯度+倒易基变换、自动校正）。

## 8. 修改影响面

改 shader → 影响等值面几何正确性；与 `webgpu-isosurface.ts` 的 Params 布局强耦合（vec4 对齐）。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试（GPU 程序）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| MT 拆分/绑定布局 | 已证实 | `:8-61` |
| 法线梯度+绕序校正口径 | 已证实 | 文件头 |
| case 表细节 | 推断 | 尾段按经典 MT 口径归纳 |
| 运行行为 | 未知 | NOT_RUN（GPU） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Params/bindings/表族 | 2 | `:8-61` | covered |
| 三角化主流程 | 3 | `:62-208` | covered |
