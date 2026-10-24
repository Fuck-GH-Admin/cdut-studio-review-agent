---
path: apps/electron/src/renderer/lib/webgpu/webgpu-isosurface.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8543fe6d6d96f0c77c18e0792aa66d590d27faa7
sha256: d2c1e769ec0ff7ecc8727b733987f5dfc920bbaa8918fa5774c72de2cdf5cfc8
lines: 241
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/webgpu/webgpu-isosurface.ts

## 1. 结论与边界

CSLab WebGPU 等值面提取（文件头 `:1-7`）：优先 WGSL Compute Shader；**设备不可用或执行失败返回 null，由调用方自动回退 Worker CPU Marching Tetrahedra**。为避免引入 `@webgpu/types` 依赖，WebGPU 对象用局部 any（照实口径）。运行时模块（WebGPU）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isWebGpuAvailable` | function | `:96-98` | `getDevice() !== null` |
| `extractIsosurfaceWebGpu` | function | `:101-241` | `(grid, isovalue) => CsLabIsoMesh \| null`（任何失败→null） |

内部：`MAX_DIMENSION=256`/`MAX_VERTICES=2_000_000`（`:14-15`）；`cross/dot`（向量）；`reciprocalBasis`（`:31`，网格基向量倒易基，失败 null）；`buildParams`（`:44`，uniform 参数打包 Float32Array）；`downsampleGrid`（超 256 降采样）。

## 3. 内部逻辑与关键流程

1. `getDevice()` 无设备→null；降采样至 ≤256；任维 <2→null。
2. 顶点容量 `max(3, min(MAX_VERTICES, cells*12))`（6 四面体×2 三角形→单体素 ≤36 顶点口径，`:112-113`）。
3. 四 buffer（volume STORAGE/params UNIFORM/vertices STORAGE+COPY_SRC/counter 8B）→ dispatch compute（isosurface.wgsl）→ readback 顶点/索引 → 组 `CsLabIsoMesh`。
4. **任何异常→null**（try/catch 全吞，交 CPU 回退）；buffer 显式销毁。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`use-cslab-isosurface` hook（详见其手册）。出向：`isosurface.wgsl`（运行时加载）、`CsLabVolumeGrid`/`CsLabIsoMesh`（shared 类型）、WebGPU API（局部 any）。

## 5. 数据 I/O、读写与副作用

GPU buffer 创建/写入/读回；无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无设备/维不足 | `:106-110` | null（CPU 回退） |
| 任何执行异常 | 全链 try/catch | null |
| 超限 | `:14-15/:112` | 降采样/截断顶点 |

## 7. 权限与权威状态

回退口径如实（null=交 CPU）；`@webgpu/types` 规避为有意取舍（文件头）。

## 8. 修改影响面

改提取 → 影响 CSLab 等值面渲染链；wgsl 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试（WebGPU 硬件依赖）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 失败 null/CPU 回退 | 已证实 | 文件头、`:100-110` |
| 顶点容量/降采样口径 | 已证实 | `:14-15/:112-113` |
| 运行行为 | 未知 | NOT_RUN（GPU） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/内部工具 | 2 | `:14-94` | covered |
| 两导出/全链 | 3 | `:96-241` | covered |
