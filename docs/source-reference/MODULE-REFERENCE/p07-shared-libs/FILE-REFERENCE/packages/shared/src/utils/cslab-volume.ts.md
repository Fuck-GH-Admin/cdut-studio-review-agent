---
path: packages/shared/src/utils/cslab-volume.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b536127367939661cff812e0bc73d534889da32d
sha256: 43e83bb70e9f8bbfdb75ad900551d429dd9630ab637a61865434f3af6da7d44c
lines: 408
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-volume.ts

## 1. 结论与边界

CSLab **体数据解析**纯函数（`packages/shared/src/utils/cslab-volume.ts:1-10`）：Gaussian Cube、VASP CHGCAR/LOCPOT → 统一三维规则网格。限制（`来源：`）：单文件文本上限由调用方控制；**体素总数上限 64M**（超限报错）；任一方向 >256 时三线性降采样+warning。

边界：CHGCAR/LOCPOT 的 PAW 增补占据段**忽略**（仅第一组网格，`:186`）；差分网格维度必须一致（**绝不静默截断或补零**，`:218`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabVolumeParseError` | class | 21-26 | `extends Error` | |
| `parseCube` | function | 93-138 | `(text) => CsLabVolumeGrid` | 多数据集仅取首个+warning |
| `parseChgcar`/`parseLocpot` | function | 204-208 | → `parseVaspGrid(text, …)` | |
| `computeDifferentialGrid` | function | 221-281 | `(total, ...subtrahends) => CsLabVolumeGrid` | `Δρ = ρ_total − Σρ_sub` |
| `sampleGrid` | function | 293-325 | `(grid, u, v, w) => number` | 三线性+周期边界 |
| `downsampleGrid` | function | 330-365 | `(grid, maxDimension=256) => CsLabDownsampledGrid` | |
| `gridSlice` | function | 370-408 | `(grid, axis:0\|1\|2, index) => {width;height;values}` | 二维剖面 |

内部：`MAX_VOXELS=64M`/`MAX_DIMENSION=256`（`:29-30`）、`isNumericToken/parseHeaderLine`（`:32-38`）、`readNumbers`（`:40-85`，手写浮点词法（符号/小数/e 指数），非数值段跳过）、`gridStats`（`:87-94`）、`findVaspDataStart`（`:141-149`，VASP4/5+Selective 兼容定位）、`parseVaspGrid`（`:151-192`）。

## 3. 内部逻辑与关键流程

- `parseCube`（`:93-138`）：行数 ≥8；第三行原子数/原点（负原子数=多数据集 warning，`:110`）；三网格定义行（维度绝对值+体素向量）；`total>MAX_VOXELS` 抛；跳过头行后 `readNumbers` 满额读取（不足抛「体数据数值不足」，`:84`）。
- `parseVaspGrid`（`:151-192`）：`parsePoscar` 拿晶胞；`findVaspDataStart` 定位数据首行；网格行 3 数值；体素向量=晶胞基/维度（`:175-180`）；warning「PAW 增补占据段已忽略」。
- `computeDifferentialGrid`（`:221-281`）：≥1 减数（否则抛）；总量数值数与维度核对；各减数维度/数值数逐一核对（不一致明确报错）；逐格点相减；结果非有限 → 抛「差分网格包含非有限数值」；warnings 去重合并+生成说明。
- `sampleGrid`（`:293-325`）：分数坐标 wrap 周期（`value-floor`）；八角点三线性。
- `downsampleGrid`（`:330-365`）：最大边 ≤256 直接返回 `downsampled:false`；否则按比例缩（每维 ≥2），`sampleGrid` 重采样+warning。
- `gridSlice`（`:370-408`）：index 钳制；三轴向剖面输出 width/height/Float32Array。

## 4. 调用者与调用链

出向：`../types/cslab`、`../types/cslab-vesta-types`（3 类型）、`./cslab-crystal`（cellBasis）、`./cslab-poscar`（parsePoscar）（`:12-19`）。入向（检索=符号名+模块名，全冻结树）：

- `parseCube`/`parseChgcar`/`parseLocpot`：`apps/electron/src/main/lib/cslab/cslab-science.ts:33-35,104-106`（main 产品链）+ 本批测试。
- `downsampleGrid`：`cslab-science.ts:30,108`、`apps/electron/src/renderer/lib/webgpu/webgpu-isosurface.ts:11,108`、`renderer/workers/cslab-crystallography.worker.ts:16,98`（renderer 产品链）。
- `sampleGrid`：`cslab-isosurface.ts:9,274`（共享内部链）+ 测试。
- `computeDifferentialGrid`：**仅测试**（产品零调用）；`gridSlice`：**全树零调用**。
- `CsLabVolumeParseError`：测试断言+内部 23 处抛出。
- 产品入口：main（cslab-science）+ renderer（webgpu-isosurface/worker）；preload/core/cli 无。
- 测试：`cslab-volume.test.ts`（本批 8 test）；`downsampleGrid`/`gridSlice` 无测试覆盖。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数（文本进网格出）。

## 6. 分支、失败、取消与恢复

抛 `CsLabVolumeParseError`：行数/头/网格/体素上限/数值不足/差分维度不一致/非有限结果；warning 3 类（多数据集/PAW 段忽略/降采样）。无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；约束即口径（`:218`）：差分绝不静默截断补零。

## 8. 修改影响面

- `readNumbers` 词法兼容（指数/符号/噪声跳过）是 CHGCAR 解析可靠性关键。
- 差分/降采样语义影响科学工具展示。
- 测试：本批 8 test（`downsampleGrid`/`gridSlice` 缺口）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-volume.test.ts`（本批，187 行/8 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 64M/256 双上限 | 已证实 | `:29-30,120-121,165-166` |
| 差分维度 fail-closed（不截断不补零） | 已证实 | `:218,236-251` |
| PAW 段忽略声明 | 已证实 | `:186` |
| `computeDifferentialGrid` 仅测试、`gridSlice` 全树零调用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| `downsampleGrid`/`gridSlice` 无测试 | 已证实 | 测试清单核对 |
| 真实 CHGCAR/Cube 语料 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2 | 21-408 | covered |
| Cube/VASP 解析 | §3 | 93-192 | covered（8 test 锚） |
| 差分 | §3 | 221-281 | covered（仅测试） |
| 采样/降采样/剖面 | §3 | 293-408 | covered（后两无测试） |
