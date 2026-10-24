---
path: packages/shared/src/utils/cslab-analysis.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 434aaaba0df94f427e295c3eebf8ad2379891ad9
sha256: 9871bb77e38e81e2d3745e98bf528b91216b3ec963071eac3f6e9b2f87d09117
lines: 133
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-analysis.ts

## 1. 结论与边界

CSLab 结构分析**编排纯函数**（`packages/shared/src/utils/cslab-analysis.ts:1-6`）：把 CIF/POSCAR/XYZ 解析、空间群判定、等价原子展开、Wyckoff 与密度计算收敛到单一入口，主进程与 Worker 共用。薄编排层：解析/对称性计算全部委托同包模块（`cslab-cif`/`cslab-poscar`/`cslab-xyz`/`cslab-symmetry`）。

边界：不做可视化（cslab-canvas）；密度缺质量即 undefined 不硬算（`:73,82`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `parseStructureText` | function | 27-45 | `(text, format: CsLabStructureFormat) => CsLabStructureParseResult` | cif 走 `parseCif` 字段映射，poscar/xyz 直通 |
| `buildStructureFromText` | function | 48-53 | → `buildCrystalStructure(parseStructureText(...))` | |
| `formatCrystalFormula` | function | 56-71 | `(atoms) => string` | 首现顺序；占据率两位小数（整数则整数）；1 省略；空格分隔 |
| `computeCrystalDensity` | function | 74-87 | `(atoms, cellVolume) => number\|undefined` | g/cm³ |
| `analyzeCrystalStructure` | function | 104-124 | `(structure, tolerance?) => CsLabCrystalAnalysis` | |
| `analyzeCrystalText` | function | 127-133 | → 一键 | |

内部：`buildWyckoffSites`（`:89-101`，逐原子 `expandAtoms` 单原子展开求 multiplicity + `siteSymmetryOrder`）。

## 3. 内部逻辑与关键流程

- `parseStructureText`（`:27-45`）：cif 分支显式映射 6 字段（`:33-41`）；poscar/xyz 直接委托。
- `formatCrystalFormula`（`:56-71`）：按元素累加占据率（非法占据率按 1，`:61`）；`|count-round|<0.01` 取整否则两位小数（`:67`）；`rounded===1` 省略数字（`:68`）。
- `computeCrystalDensity`（`:74-87`）：`cellVolume>0` 否则 undefined；逐原子查 `CSLAB_ATOMIC_MASSES`，缺 → undefined（`:82`）；`mass/(0.602214076×volume)`（`:85-86`，Å³→cm³ + N_A 换算）。
- `analyzeCrystalStructure`（`:104-124`）：`expandAtoms(structure,{tolerance})`；展开 0 原子 → warning；密度 undefined → warning；formula 用**展开后**原子（`:118`）而 atomCount 用原始（`:117`）。

## 4. 调用者与调用链

出向：`../types/cslab-vesta-types`（6 类型）、`./cslab-scattering-data`（CSLAB_ATOMIC_MASSES）、`./cslab-cif`（parseCif）、`./cslab-poscar`、`./cslab-xyz`、`./cslab-symmetry`（buildCrystalStructure/expandAtoms/siteSymmetryOrder）（`:8-24`）。入向（检索=符号名+模块名，全冻结树，经 barrel `index.ts:188-194`）：

- `analyzeCrystalText`：`apps/electron/src/main/lib/cslab/cslab-science.ts:28,69`、`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:13,71`。
- `buildStructureFromText`：`cslab-science.ts:29,79`、`cslab-demo-plates.ts:21,251,408`、worker `:15,76,81,87`、`cslab-demo.test.ts:13,119`。
- `parseStructureText`/`computeCrystalDensity`/`formatCrystalFormula`/`analyzeCrystalStructure`：仅模块内部互调+barrel（零外部引用）。
- 同名碰撞警示：`cellVolume` 三义——本文件 `:76` 参数名 / `cslab-crystal.ts:81` 函数 / `cslab-vesta-types.ts:120` 属性。
- 无专属测试；间接 `cslab-science.test.ts`（7 test）、`cslab-demo.test.ts`（7 test）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯编排函数，无 I/O/状态。

## 6. 分支、失败、取消与恢复

无异常路径（解析层抛错由委托模块产生；密度/占据率非法静默降级 undefined/1）；无异步/取消。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

公式/密度口径改动影响 CSLab 分析输出（工具结果展示）；`parseStructureText` cif 字段映射与 `cslab-cif` 的 `CsLabCifDocument` 形状耦合。测试：解析层 `cslab-cif.test.ts`（本批）；对称层批外。

## 9. 测试证据

本批**无**直接测试（cslab-cif.test 覆盖 `parseCif`，间接支撑 `parseStructureText` cif 分支）。外部覆盖见 UNVERIFIED 补记。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 编排委托结构（5 模块） | 已证实 | `:8-24` |
| 公式规则（首现序/两位小数/1 省略） | 已证实 | `:56-71` |
| 密度换算与缺质量 fail-safe | 已证实 | `:74-87` |
| atomCount 原始 vs formula 展开后 | 已证实 | `:117-118` |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 + 1 内部 | §2 | 27-133 | covered |
| cif 映射 | §3 | 31-42 | covered（cslab-cif.test 间接） |
| 公式/密度 | §3 | 56-87 | covered（无直接测试） |
| 分析组装 | §3 | 104-124 | covered |
