---
path: packages/shared/src/utils/cslab-symmetry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cc9eade49dc036e64693f37511cdb148cc1ddf95
sha256: 942c480b313066ba40506c4418acd40e261b55e9095f6768b9b35c9ba157a6f8
lines: 484
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-symmetry.ts

## 1. 结论与边界

CSLab **对称性引擎**纯函数（`packages/shared/src/utils/cslab-symmetry.ts:1-9`）：解析 CIF/生成元 xyz 对称操作、生成元**有限群闭包**（支持全 230 空间群）、等价原子展开、位点对称性、系统消光。**红线**（`:8`）：空间群无法判定时降级 P1，并在 source 与 warnings 如实标注。

边界：滑移/螺旋消光由结构因子自然给出（本模块只判**中心化**消光，`:460`）；闭包上限 192（`>192` 抛错防非法生成元，`:287-289`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabSymmetryError` | class | 27-32 | `extends Error` | |
| `parseSymmetryOperationXyz` | function | 105-137 | `(xyz) => CsLabSymmetryOperation\|null` | `-x,y+1/2,-z+1/2` 形态 |
| `composeOperations` | function | 180-198 | 先 right 后 left | |
| `generateSpaceGroupOperations` | function | 256-301 | `(seed\|string[]) => CsLabSymmetryOperation[]` | 闭包+缓存 |
| `detectSpaceGroup` | function | 307-344 | `(cifHm?, cifNumber?, cifOperations?) => CsLabSpaceGroupInfo` | 优先级：显式操作>编号>H-M>P1 |
| `buildCrystalStructure` | function | 346-377 | `(parsed) => CsLabCrystalStructure` | 判群+生成操作 |
| `ExpandAtomsOptions` | interface | 380-385 | `{tolerance?=0.1; includeCentering?}` | |
| `expandAtoms` | function | 388-422 | `(structure, options?) => CsLabCrystalAtom[]` | 周期距离去重 |
| `siteSymmetryOrder` | function | 427-442 | `(structure, fractional, tolerance=0.1) => number` | 保位操作数（≥1） |
| `systematicAbsence` | function | 461-472 | `(h,k,l, spaceGroup) => {extinct; reason?}` | 中心化消光 |
| `cellSignature` | function | 477-481 | 六参数 `|` 拼接（6 位取整） | |
| `CSLAB_SPACE_GROUP_SEEDS` | const | 484 | `= CSLAB_SPACE_GROUPS`（**别名双导出**） | |

内部：`Rotation/Translation`（`:34-35`）、`mod1/roundFraction/operationKey`（`:43-53`，平移 1/12 网格键）、`parseComponent`（`:55-91`，变量/系数/分数平移词法）、`determinant3/multiplyMatrix/inverseRotation`（`:139-176`）、`invertOperation`（`:200-213`）、`fractionLabel/formatOperationXyz`（`:215-252`，操作回写 xyz 字符串）、`operationCache`（`:254`）、`CENTERING_RULES`（`:444-458`，P/I/F/A/B/C/R 七心）。

## 3. 内部逻辑与关键流程

- `parseSymmetryOperationXyz`（`:105-137`）：三分量解析（纯平移分量不合法 → null；解析异常 → null）；旋转行列式必须 ±1（`:132`）。
- `generateSpaceGroupOperations`（`:256-301`）：缓存（seed number/raw 串键）；生成元解析失败抛；种子集=恒等∪生成元∪其逆；BFS 闭包（`composeOperations` 去重），`seen.size>192` 抛「生成元可能非法」。
- `detectSpaceGroup`（`:307-344`）：有显式操作 → source `'cif'`（number/symbol 取 seed 兜底）；查表命中 → `'table'`；否则 **P1 + `'assumed-p1'`**（红线）。
- `buildCrystalStructure`（`:346-377`）：操作来源三级（显式>按 number 查 seed>恒等）；assumed-p1 → warning「对称性相关结果可能不完整」。
- `expandAtoms`（`:388-422`）：逐位点×全操作算像（mod1），`periodicDistance<tolerance` 去重；多像 label 加 `_N` 后缀、`multiplicity=像数`。
- `systematicAbsence`（`:461-472`）：`CENTERING_RULES[centering ?? 'P']`；命中 → `{extinct:true, reason:'X 中心化系统消光'}`。

## 4. 调用者与调用链

出向：`../types/cslab`、`../types/cslab-vesta-types`（7 类型）、`./cslab-crystal`（periodicDistance）、`./cslab-space-group-data`（3 符号）（`:11-25`）。入向（检索=符号名+模块名，全冻结树）：

- `buildCrystalStructure`：`cslab-analysis.ts:21,52`、`cslab-pxrd.test.ts:4,18`、`cslab-polyhedra.test.ts:4,12`、本批 `cslab-symmetry.test.ts:24-25`。
- `expandAtoms`：`cslab-pxrd.ts:28,180`、`cslab-analysis.ts:22,91,108`、`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:17,82,88`（唯一产品直引）+ 测试 3 处。
- `siteSymmetryOrder`：`cslab-analysis.ts:23,97`；`systematicAbsence`：`cslab-pxrd.ts:28,198`+测试。
- **仅测试/内部**：`parseSymmetryOperationXyz`/`composeOperations`/`detectSpaceGroup`/`generateSpaceGroupOperations`（测试断言+内部互调）。
- **零外部引用**：`CsLabSymmetryError`、`ExpandAtomsOptions`、`cellSignature`（全树零）、`CSLAB_SPACE_GROUP_SEEDS`（全树零——与 `CSLAB_SPACE_GROUPS` 同对象别名双导出）。
- 产品入口：renderer（仅 worker 的 expandAtoms）；main 仅经 cslab-analysis 间接；preload/core/cli 无。
- 测试：本批 `cslab-symmetry.test.ts`（7 test）+ `cslab-space-group-data.test.ts`(3)/`cslab-pxrd.test.ts`(3)/`cslab-polyhedra.test.ts`(1) 间接。

## 5. 数据 I/O、读写与副作用

内存缓存 `operationCache`（模块级 Map，`:254`）；无 I/O。

## 6. 分支、失败、取消与恢复

抛 `CsLabSymmetryError`：解析失败/不可逆/生成元非法/闭包超 192；P1 降级=红线受控恢复（`:8,341-343,370-372`）；无异步。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:8`）：降级须 source+warnings 如实标注。

## 8. 修改影响面

- 判群优先级/闭包键（1/12 网格）/去重容差影响 PXRD/多面体全链。
- `CENTERING_RULES` 七心口径是消光契约。
- 测试 4 文件 14 test。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-symmetry.test.ts`（本批，106 行/7 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（P1 降级+如实标注） | 已证实 | `:8,341-343,370-372` |
| 闭包 ≤192 防护 | 已证实 | `:287-289` |
| 判群优先级四级 | 已证实 | `:307-344` |
| 中心化七心消光 | 已证实 | `:444-472` |
| 4 导出零外部引用（含 SEEDS 别名） | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 全 230 群闭包正确性 | 未知 | 抽样 10 群，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 导出 | §2 | 27-484 | covered |
| 解析/闭包 | §3 | 105-301 | covered |
| 判群/构建 | §3 | 307-377 | covered |
| 展开/位点/消光 | §3 | 388-472 | covered |
