---
path: packages/shared/src/types/cslab-vesta-types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 928c82268daa2150de1f37fbe4515fe7353f5bfe
sha256: d8706d8f0011f7e9c226edae2d878e12b633f1b92d6cec25d03b2a41244eb86b
lines: 239
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/cslab-vesta-types.ts

## 1. 结论与边界

CSLab **晶体学与体数据契约**（VESTA 级工作台，`:1-5`）：结构文件解析/空间群/对称操作/晶体分析/PXRD/多面体/体数据/等值面。"只定义数据类型，不包含运行时逻辑；主进程、渲染进程与 Worker 共用"——注意 `Float32Array`/`Uint32Array`（`:212`/`:221-222`）意味着**跨进程/Worker 传输契约**。

不做的事：不做解析/对称展开/等值面算法（`analyze-crystal`/`simulate-pxrd`/`get-volume-grid` 通道侧）。

## 2. 导出与关键符号

27 个导出（全类型）：

| 族 | 符号（行） | 要点 |
| --- | --- | --- |
| 格式/晶系 | `CsLabStructureFormat:10`（cif/poscar/xyz）、`CsLabVolumeFormat:13`（cube/chgcar/locpot）、`CsLabCrystalSystem:15-22`（7 系）、`CsLabLatticeCentering:24`（P/A/B/C/I/F/R）、`CsLabSpaceGroupSource:26`（cif/table/assumed-p1） |
| 空间群 | `CsLabSpaceGroupSeed:29-39`（生成元种子：`hm` 用 `_` 表下标 `:31`、`order` 自校验 `:35`、`generators` 1-5 条 xyz 运行时闭包展开 `:37`）、`CsLabSymmetryOperation:42-47`（整数旋转矩阵+分数平移）、`CsLabSpaceGroupInfo:49-56` |
| 原子/结构 | `CsLabCrystalAtom:58-70`（分数坐标/occupancy/bIso/uIso/wyckoff/cartesian?）、`CsLabCifDocument:73-82`（**尚未对称展开** `:72`）、`CsLabStructureParseResult:85-93`（POSAR/XYZ 同构最小集）、`CsLabCrystalStructure:96-104`（已完成空间群判定、原子仍是输入位点 `:95`） |
| 分析 | `CsLabWyckoffSite:106-113`、`CsLabCrystalAnalysis:115-124`（atomCount/expandedAtomCount/formula/cellVolume）、`CsLabSupercellRequest/Result:126-137` |
| PXRD | `CsLabPeakProfile:139`（**与 origin-types 的 `CsLabPeakProfileName:124` 同值不同名**）、`CsLabPxrdOptions:141-152`（wavelength/2θ 范围/fwhm/eta/stepDeg/zeroShift）、`CsLabPxrdPeak:154-164`（hkl/d/2θ/multiplicity/结构因子/强度）、`CsLabPxrdPattern:166-172` |
| 配位/体数据 | `CsLabPolyhedron:174-188`（vertices/faces/畸变度）、`CsLabNeighborOptions:190-194`、`CsLabVolumeAsset:196-203`、`CsLabVolumeGrid:205-217`（`values: Float32Array` z-major 展开 `:212`、体素步进矢量 `:210`）、`CsLabIsoMesh:219-226`（`positions/normals: Float32Array`、`indices: Uint32Array`）、`CsLabIsosurfaceResult:228-233`（`backend: 'webgpu'\|'cpu'`）、`CsLabDownsampledGrid:236-239` |

## 3. 内部逻辑与关键流程

纯声明。解析管线语义（类型级）：`CsLabCifDocument`（未展开）→ `CsLabCrystalStructure`（空间群判定完成、原子仍为输入位点）→ `CsLabCrystalAnalysis`（`expandedAtomCount` 对称展开后计数）。`CsLabSpaceGroupSeed.generators` 闭包展开（`:37`）是 230 空间群表的数据驱动设计。

## 4. 调用者与调用链

- `import type { CsLabCrystalCell } from './cslab'`（`:7`，唯一 import；用点 `:74`/`:87`/`:98` 三个结构接口的 `cell` 字段）——**依赖方向**：cslab.ts（中心）→ 本文件（扩展）。
- 消费者：main 科学引擎（`analyze-crystal`/`simulate-pxrd`/`get-volume-grid`，cslab.ts 通道 `:149-153`）、渲染 3D 视窗（`CsLabStructureFocusedEvent`）、Worker（isosurface 计算，`:228` backend 二选一）。
- `packages/shared/src/types/index.ts:117` `export *` 转发；与 cslab.ts 导出名零重叠。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。**TypedArray 契约**（`:212`/`:221-222`）：体素场/网格顶点用二进制大数组——structured clone/Transferable 语义由调用方决定（推断）。

## 6. 分支、失败、取消与恢复

不适用。失败语义：`warnings[]` 贯穿（`:81`/`:92`/`:103`/`:123`/`:171`/`:216`）；`CsLabIsosurfaceResult.backend` 记录计算路径（webgpu/cpu 降级）。

## 7. 权限与权威状态

- 空间群判定权威：`CsLabSpaceGroupInfo.source`（`:55`，cif/table/assumed-p1 三源可审计）；`CsLabSpaceGroupSeed.order` 自校验（`:35`）。
- `assumed-p1` 源是降级假设（推断：低对称兜底）。

## 8. 修改影响面

改字段影响科学引擎/3D 视窗/Worker 协议；`CsLabCrystalCell` 来自 cslab.ts（改它双向影响）；TypedArray 字段改动影响传输性能与序列化。

## 9. 测试证据

无直接测试（检索 `CsLabVolumeGrid`/`CsLabCrystalStructure` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 27 导出全类型、1 import（`CsLabCrystalCell`） | 已证实 | 文件全读 |
| 解析管线三段语义（未展开→判定→分析） | 已证实 | `:72`、`:95` |
| TypedArray 契约 | 已证实 | `:212`、`:221-222` |
| **矛盾**：`CsLabPeakProfile:139` 与 `cslab-origin-types.ts:124` `CsLabPeakProfileName` 同值（gaussian/lorentzian/pseudo_voigt）不同名、未共享别名 | 已证实 | 两文件比对 |
| 230 空间群表数据完整性 | 未知 | 种子数据不在本文件 |
| webgpu/cpu 等值面实际分工 | 未知 | 引擎实现不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 27 导出全量 | §2 | covered |
| 解析管线/族谱 | §3 | covered |
| TypedArray/依赖方向 | §4/§5 | covered |
| 空间群权威 | §7 | covered |
| 矛盾/测试/未知 | §9/§10 | covered |
