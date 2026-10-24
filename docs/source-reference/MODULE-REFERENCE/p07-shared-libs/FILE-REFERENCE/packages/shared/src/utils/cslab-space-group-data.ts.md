---
path: packages/shared/src/utils/cslab-space-group-data.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4a01d2e784e064c9e4c6df25df4d78f56f64a8dc
sha256: d69b89345afc11987e51c45e092ed202e572bb036ef1db5552b9782368b61d26
lines: 263
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-space-group-data.ts

## 1. 结论与边界

CSLab **空间群数据**（由 spglib spg_database.c 的 Hall 设置与对称操作生成，`packages/shared/src/utils/cslab-space-group-data.ts:1-8`）：每群只存标准 Hall 设置的**生成元字符串**，运行时闭包展开；`order` 为一般位置操作数（自校验用）；数据文件纯数据无逻辑（避免运行时依赖外部晶体学库）。

边界：不含对称操作全集（展开由 `cslab-symmetry.generateSpaceGroupOperations`）；非选择（仅标准 Hall 设置）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CSLAB_SPACE_GROUPS` | const | 12-243 | `readonly CsLabSpaceGroupSeed[]`（230 条） | `{number;hm;crystalSystem;centering;order;generators[]}` |
| `findSpaceGroupByNumber` | function | 257-259 | `(number) => CsLabSpaceGroupSeed\|null` | |
| `findSpaceGroupByHm` | function | 261-263 | `(symbol) => CsLabSpaceGroupSeed\|null` | |

内部：`BY_NUMBER`/`BY_HM` Map（`:245,255`）、`normalizeHm`（`:248-253`：去空格/下划线、统一 Unicode 减号 `−–—`→`-`、小写）。

## 3. 内部逻辑与关键流程

230 条种子数据（`:12-243`，三斜→立方七晶系、P/A/C/F/I 心）；两个查表 Map 模块加载期构建（`:245,255`）；查找 O(1)，miss → null。

## 4. 调用者与调用链

出向：类型 `../types/cslab-vesta-types`（CsLabSpaceGroupSeed，`:10`）。入向（检索=符号名+模块名，全冻结树）：

- `CSLAB_SPACE_GROUPS`：`packages/shared/src/utils/cslab-symmetry.ts:22,484`（`CSLAB_SPACE_GROUP_SEEDS` 别名再导出）+ 内部 `:245,255`。
- `findSpaceGroupByNumber`：`cslab-symmetry.ts:24,312,335,360`。
- `findSpaceGroupByHm`：`cslab-symmetry.ts:23,313`；测试 `cslab-symmetry.test.ts:12,29,101`、`cslab-pxrd.test.ts:5,22`、`cslab-space-group-data.test.ts`（本批）。
- 产品入口：无直接引用（经 `cslab-symmetry` 间接进入 main/worker 对称链）；core/cli/preload 无。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯数据+纯查表。

## 6. 分支、失败、取消与恢复

无异常路径（miss → null）；无异步。

## 7. 权限与权威状态

本文件不适用（无权限代码）；数据权威=spglib 生成来源声明（`:2`，静态生成，运行时不再校验）。

## 8. 修改影响面

数据错误会波及对称展开/PXRD 系统消光全链；`order` 是自校验锚（测试断言闭包阶数=order）。测试：`cslab-space-group-data.test.ts`（本批 3 test）+ `cslab-symmetry.test.ts`（7 test）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-space-group-data.test.ts`（本批，48 行/3 test：230 完整性、10 群闭包阶数、H-M 容错）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 230 条种子+生成元存储 | 已证实 | `:12-243` |
| H-M 归一化（空格/下划线/Unicode 减号） | 已证实 | `:248-253` |
| 查表 O(1)、miss → null | 已证实 | `:245-263` |
| 数据源自 spglib 声明 | 已证实（注释） | `:2` |
| 数据正确性（逐群对照 spglib） | 未知 | 静态数据，NOT_RUN |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | 12-263 | covered |
| 230 数据条目 | §3 | 12-243 | covered（10 群抽样验证） |
| 查表/归一化 | §2-§3 | 245-263 | covered |
