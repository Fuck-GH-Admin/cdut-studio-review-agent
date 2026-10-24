---
path: packages/shared/src/utils/cslab-crystal.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1aa3e8d226e735d1990a061627958ffa0323eeb8
sha256: 7fe31abddbd7ae1951901cd33bea7239f94657fb061dbc8277cddaa5baf80162
lines: 455
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-crystal.ts

## 1. 结论与边界

CSLab **晶体学纯函数**（主/渲染共用，`packages/shared/src/utils/cslab-crystal.ts:1-11`）：CIF 晶胞解析（容忍 `4.5937(3)` 不确定度/引号空间群）、三斜通用 d 与 2θ 换算、实空间→倒易→Miller 法向、2θ 反查 (hkl)（XRD 峰→3D 晶面联动）。不依赖 Mol*/Electron。**红线**（`:10`）：参数不合理返回 null/空数组/NaN，绝不猜测或伪造晶面。

边界：`assignReflections`/`enumerateReflections` 是**几何可能反射**，不含结构因子/强度，仅用于谱图标注，不冒充实测峰位（`:335-336`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CSLAB_XRAY_WAVELENGTHS` | const | 22-26 | `{Cu-Kα:1.5406; Co-Kα:1.78897; Mo-Kα:0.71073}`（Å） | |
| `parseCifLattice` | function | 40-78 | `(text) => CsLabCrystalCell\|null` | 行式 `_tag value` 扫描（首值优先） |
| `cellVolume` | function | 81-96 | → 三斜体积；`inside<=0` → NaN | |
| `dSpacing` | function | 115-142 | `(cell,h,k,l) => number` | (000)→NaN；度规张量求逆 |
| `twoThetaFromD` | function | 145-150 | `(d, λ=Cu-Kα) => number` | λ/2d>1 → NaN（不可衍射） |
| `reciprocalNormal` | function | 184-202 | → 归一化法向 \| null | |
| `cellCenter` | function | 205-214 | → 笛卡尔几何中心 | |
| `cellMaxLength` | function | 217-221 | → max(a,b,c) | |
| `planeBasis` | function | 224-233 | `(normal) => {u,v}` | 平面内正交基 |
| `AssignReflectionsOptions` | interface | 235-240 | `{maxIndex?; toleranceDeg?; wavelengthAngstrom?}` | |
| `assignReflections` | function | 252-293 | `(twoTheta, cell, options?) => CsLabXrdReflection[]` | 按 \|Δ2θ\| 升序候选 |
| `buildMillerPlane` | function | 296-315 | → `CsLabMillerPlane\|null` | Mol* 平面参数 |
| `EnumerateReflectionsOptions` | interface | 317-325 | `{maxIndex?=8; wavelengthAngstrom?; minTwoTheta?=0; maxTwoTheta?=90; limit?=120}` | |
| `enumerateReflections` | function | 338-387 | → 2θ 区间可能反射 | 性能红线见 §3 |
| `CsLabCellBasis` | interface | 389-394 | `{ax;bx;cx;volume}` | |
| `cellBasis` | function | 397-407 | → 标准取向实空间基矢 | |
| `fractionalToCartesian` | function | 410-420 | → Å 坐标 | |
| `cartesianToFractional` | function | 423-435 | → 分数坐标 \| null（奇异晶胞） | |
| `periodicDistance` | function | 438-455 | → 最小镜像距离 | 分数差折叠 [-0.5,0.5] |

内部：`DEG`（`:19`）、`stripNumber`（`:28-37`，剥引号/不确定度/尾部 `;,`）、`invert3`（`:99-112`，伴随矩阵/行列式，`|det|<1e-12` → null）、`realBasis`（`:153-167`，a 沿 x 标准取向）、`cross/normalize`（`:169-181`）、`canonicalKey`（`:242-246`，(hkl)≡(-h-k-l) 方向族）。

## 3. 内部逻辑与关键流程

- `parseCifLattice`（`:40-78`）：逐行正则取 `_tag value`（Map 首值优先）；6 参数缺一/非正 → null；体积校验；spaceGroup 三标签兜底（剥引号）。
- `dSpacing`（`:115-142`）：实空间度规 G → invert3 → `q=(hkl)G⁻¹(hkl)ᵀ` → `1/√q`。
- `assignReflections`（`:252-293`）：maxIndex 钳 [1,12]（默认 6）、容差 ≥0.01（默认 0.35°）；h∈[0,maxIndex]（k/l 对称半空间，`:265-269` 配合 canonicalKey 去重族）；`|θ-2θ|≤容差` 入选；排序 `Δ2θ → 负指数少 → d 大`（`:284-292`，防 (110) 显示成 (1-10)）。
- `enumerateReflections`（`:338-387`）：**性能红线**（`:330-333`）：Bragg 下限 `dMin=λ/(2sin(θmax/2))` 截断扫描立方体（hMax/kMax/lMax=`ceil(边长/dMin)` 钳 maxIndex，`:353-355`）；先 d 区间判定再分配对象；limit 默认 120。
- `periodicDistance`（`:438-455`）：分数差 `value-Math.round(value)` 折叠最小镜像后转笛卡尔求长。

## 4. 调用者与调用链

出向：`../types/cslab`（3 类型，`:13-17`）。入向（检索=符号名+模块名，全冻结树，经 barrel `index.ts:137-158`）：

- **utils 内部**：`cslab-symmetry.ts:20,407,442`（periodicDistance）、`cslab-poscar.ts:10,88,154`、`cslab-xyz.ts:11,62,70`、`cslab-cif.ts:14,197,272`（parseCifLattice/cartesianToFractional）、`cslab-polyhedra.ts:15,88,190,198`、`cslab-volume.ts:18,181`、`cslab-pxrd.ts:22,167,183,303`（XRAY_WAVELENGTHS/dSpacing/enumerateReflections/twoThetaFromD）。
- **renderer**：`CsLabMolstarViewer.tsx:20-24,634-644,456-457`、`CsLabDatasetView.tsx:24-27,202-231`、`CsLabVestaCrystalPane.tsx:21,335,533`、`cslab-molstar-state.ts:19,50`（planeBasis）。
- 测试：`apps/electron/src/main/lib/cslab/cslab-molstar-math.test.ts`（13 test，多处）+ utils 各单测（pxrd/volume/poscar/symmetry）。
- `AssignReflectionsOptions`/`EnumerateReflectionsOptions`/`CsLabCellBasis`：仅内部签名+barrel（零外部引用）。
- **同名碰撞警示**：`cellVolume` 三义（本文件 `:81` 函数 / `cslab-analysis.ts:76` 参数 / `cslab-vesta-types.ts:120` 属性）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯数学/文本解析。

## 6. 分支、失败、取消与恢复

失败形态= null/NaN/`[]`（红线）；`invert3` 奇异兜底；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即权威口径（`:10,335-336`）：几何枚举 ≠ 实测峰位。

## 8. 修改影响面

- 晶面族去重（canonicalKey 半空间扫描）、排序规则影响 XRD 标注显示。
- `realBasis` 标准取向是多面体/对称模块的坐标基准。
- 测试：`cslab-molstar-math.test.ts`（13 test）等。

## 9. 测试证据

本批**无**直接测试；间接 `cslab-molstar-math.test.ts`（批外 13 test）+ utils 单测群。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（null/NaN/空，不伪造） | 已证实 | `:10,57,121,148,257,305` |
| 性能红线（dMin 截断） | 已证实 | `:330-333,350-355` |
| 族去重+排序防负指数 | 已证实 | `:242-246,284-292` |
| 波长常数三项 | 已证实 | `:22-26` |
| 3 接口零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实衍射数据验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 18 导出 | §2 | 22-455 | covered |
| parseCifLattice | §3 | 40-78 | covered |
| dSpacing/2θ | §3 | 115-150 | covered |
| assign/enumerate | §3 | 252-387 | covered |
| 坐标变换/距离 | §3 | 397-455 | covered |
