---
path: packages/shared/src/utils/cslab-cif.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0758a1c0f59359ee79e2b911402afec65d8fd16e
sha256: 35e722087306ed9e2de1c341828ece4954b264415c6ff4560e65ef3db5c10b1a
lines: 363
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-cif.ts

## 1. 结论与边界

CIF 解析器（纯函数，主/渲染/Worker 共用，`packages/shared/src/utils/cslab-cif.ts:1-10`）：支持引号字符串、分号多行、`#` 注释、`loop_`、`data_`；晶胞参数、空间群 H-M/编号/Hall、显式对称操作；`_atom_site_*` 位点（分数/笛卡尔坐标、占据率、温度因子、Wyckoff）。**红线**（`:9`）：只解析文件真实存在的信息，不猜测缺失原子、不伪造空间群。

边界：多 data 块只取首个 CifBlock（parseBlock 单块语义）；无对称操作且无空间群时按 P1 + warning（`:344-346`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabCifParseError` | class | 26-31 | `extends Error`（name 定值） | 抛出面 |
| `tokenizeCif` | function | 36-97 | `(text) => string[]` | 词法分析 |
| `normalizeElement` | function | 181-186 | `(raw) => string` | 从 label/type_symbol 提元素符号（首字母大写+余小写） |
| `parseCif` | function | 321-363 | `(text) => CsLabCifDocument` | 主入口 |

内部：`CifLoop/CifBlock`（`:16-24`）、`RESERVED_PREFIXES=['data_','save_','stop_','global_']`（`:33`）、`isTag/isReserved/parseBlock`（`:99-160`）、`parseNumber`（`:162-170`，剥引号+括号不确定度 `(\d+)`）、`pickTag`（`:172-178`，多标签别名取首个非空）、`columnIndex`（`:188-194`）、`buildCell`（`:196-225`）、`parseAtoms`（`:227-301`）、`parseSymmetryOperations`（`:303-318`）。

## 3. 内部逻辑与关键流程

### 3.1 `tokenizeCif`（`:36-97`）

空白跳过；`#` 到行尾注释跳过；`；` 仅在行首（前有 `\n` 或文件起始）开启多行文本块（`\n;` 终止，`:54-71`）；引号串取到配对引号（`:73-81`）；否则取到空白（`:83-93`）。

### 3.2 `parseBlock`（`:108-160`）

保留前缀 token 跳过（`:114-117`）；`loop_` 收集 tag 列（小写化）→ 值序列（遇保留词/loop_/tag 断行）→ 按列宽切行（`:119-143`）；`_tag value` 对入 Map（小写键，`:145-154`）。

### 3.3 `buildCell`（`:196-225`）

先 `parseCifLattice(text)`（cslab-crystal，成功即用）；否则兜底直读 6 个 `_cell_*` 标签（`:200-209`，缺任一抛 `CsLabCifParseError`）；体积按三斜公式（`:210-223`）。

### 3.4 `parseAtoms`（`:227-301`）

定位含 `_atom_site_fract_x` 或 `_atom_site_cartn_x` 的 loop（无则 `[]`）；逐行：label 缺省 `atom-N`、element 经 `normalizeElement`；分数坐标优先，缺则笛卡尔经 `cartesianToFractional` 转换（`:267-275`）；两者皆缺 → warning + 跳过（`:277-280`）；occupancy 缺省 1；`bIso` 缺则由 uIso 换算 `8π²uIso`（`:285`）；wyckoff/multiplicity/siteSymmetry 可选列。

### 3.5 `parseCif`（`:321-363`）

空文本抛；tokenize→parseBlock→buildCell；空间群三源（H-M 别名 3 标签、编号 2 标签、Hall）；对称操作 loop（2 标签任一）；无对称+无空间群 → warning「按 P1 处理」（`:344-346`）；无原子 → warning（`:349`）；占据率≠1 → warning「PXRD 强度将按占据率加权」（`:350-352`）。

## 4. 调用者与调用链

出向：`../types/cslab`（CsLabCrystalCell）、`../types/cslab-vesta-types`（CsLabCifDocument/CsLabCrystalAtom）、`./cslab-crystal`（cartesianToFractional/parseCifLattice）（`:12-14`）。入向（检索=符号名+模块名，全冻结树）：

- `parseCif`：`packages/shared/src/utils/cslab-analysis.ts:17,32`（编排层唯一产品链）、`cslab-polyhedra.test.ts:3,11`（批外）、`cslab-cif.test.ts`（本批）。
- `normalizeElement`：`cslab-xyz.ts:10,31`（批外）+ 本文件 `:257`。
- `tokenizeCif`/`CsLabCifParseError`：仅内部+barrel（零外部引用）。
- 产品链间接：cslab-science（main）/cslab-crystallography.worker（renderer）→ cslab-analysis → parseCif。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数，文本进结构出。

## 6. 分支、失败、取消与恢复

抛 `CsLabCifParseError` 仅两处（空文本 `:322`、晶胞缺失 `:208`）；其余缺失一律 warning 降级（不抛、不猜）。无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即权威口径（`:9`）：不伪造空间群/原子。

## 8. 修改影响面

- 标签别名表（H-M/编号/Hall/对称操作）与 `_atom_site_*` 列索引是解析兼容面。
- `parseCifLattice`（cslab-crystal）优先级高于标签兜底（`:197-198`）。
- 测试：`cslab-cif.test.ts`（本批 3 test）+ `cslab-polyhedra.test.ts`（批外 1 test）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-cif.test.ts`（本批，47 行/3 test，断言见该篇）；间接 `cslab-polyhedra.test.ts`。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（不猜缺失） | 已证实 | `:9,277-280,344-349` |
| bIso=8π²uIso 换算 | 已证实 | `:285` |
| parseNumber 剥不确定度 | 已证实 | `:162-170` |
| 多 data 块单块语义 | 已证实（parseBlock 无块循环） | `:108-160` |
| `tokenizeCif`/`CsLabCifParseError` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实 CIF 语料覆盖 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 26-363 | covered |
| tokenize/parseBlock | §3.1-3.2 | 36-160 | covered |
| buildCell 双路 | §3.3 | 196-225 | covered |
| parseAtoms 坐标双源 | §3.4 | 227-301 | covered（3 test 间接） |
| parseCif 组装 | §3.5 | 321-363 | covered |
