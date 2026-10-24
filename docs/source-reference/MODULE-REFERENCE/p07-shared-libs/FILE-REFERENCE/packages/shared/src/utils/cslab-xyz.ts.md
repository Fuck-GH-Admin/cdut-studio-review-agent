---
path: packages/shared/src/utils/cslab-xyz.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f1833f4bfa41bc3b8174ccadd75136e7e60b5a22
sha256: 1939200803fbffd5343d51f6b0f33c143e75bb192c6ade183d3bb91f6a8ee0af
lines: 92
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-xyz.ts

## 1. 结论与边界

XYZ 结构段解析（纯函数，`packages/shared/src/utils/cslab-xyz.ts:1-6`）：XYZ 不携带晶胞——为支持三维显示，用原子笛卡尔**包围盒 + 5 Å 留白**构造正交晶胞并明确 warning；**该近似不得用于 PXRD 或空间群判定**（红线 `:5`）。

边界：格式假设（首行原子数、第二行注释、元素+x y z 四列）；空间群恒 P1（与 poscar 同口径诚实降级）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabXyzParseError` | class | 13-18 | `extends Error` | |
| `parseXyz` | function | 20-92 | `(text) => CsLabStructureParseResult` | 唯一函数 |

## 3. 内部逻辑与关键流程

`parseXyz`（`:20-92`）：

1. `:22-24` 首行原子数（非法/≤0 抛「XYZ 原子数量非法」）。
2. `:27-39` 逐原子取 `lines[2+i]`（token<4 抛「坐标不完整」；元素经 `normalizeElement`；x/y/z 非有限抛「坐标非法」）。
3. `:41-50` 包围盒 min/max。
4. `:52-63` 正交晶胞：边长=`max-min+2×5`（最小 1），90/90/90，P1，volume 由 `cellVolume` 回填。
5. `:65-76` 平移 +5 后 `cartesianToFractional`（失败抛「坐标转换失败」）；label=`元素+序号`、保留 cartesian、occupancy 1。
6. `:78` **恒 warning**：「XYZ 不含晶胞信息，已使用包围盒正交晶胞近似；不可用于 PXRD 或空间群判定」。
7. `:80-91` 返回 `format:'xyz'`、spaceGroupNumber:1、symmetryOperations:[]。

## 4. 调用者与调用链

出向：`../types/cslab`/`../types/cslab-vesta-types` 类型、`./cslab-cif`（normalizeElement）、`./cslab-crystal`（cartesianToFractional/cellVolume）（`:8-11`）。入向（检索=符号名+模块名，全冻结树）：`packages/shared/src/utils/cslab-analysis.ts:19,44`（`parseStructureText` xyz 分支，**唯一调用**）；`CsLabXyzParseError` 零外部 catch。无直接产品引用（经 cslab-analysis 间接）；**无任何测试**（`\bparseXyz\b` 无 `*.test.ts` 命中）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

抛 `CsLabXyzParseError` 4 处（数量/坐标不完整/坐标非法/转换失败）；warning 恒 1 条（`:78`）。无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:5`）：近似晶胞不得外推 PXRD/空间群。

## 8. 修改影响面

- 包围盒留白 5 Å（`:52`）与最小边长 1 影响显示坐标。
- 测试：**无**（测试缺口，照实记录）。

## 9. 测试证据

无任何测试文件引用。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（近似晶胞+恒 warning） | 已证实 | `:5,78` |
| 4 处 fail-closed | 已证实 | `:24,31,38,71` |
| 唯一调用 cslab-analysis | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| `CsLabXyzParseError` 零外部 catch | 已证实（同上） | 同上 |
| **零测试** | 已证实 | 全树无 .test 命中 |
| 真实 XYZ 语料 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 13-20 | covered |
| 解析主链 | §3 | 20-92 | covered |
| 测试锚 | §9 | — | unknown（零测试） |
