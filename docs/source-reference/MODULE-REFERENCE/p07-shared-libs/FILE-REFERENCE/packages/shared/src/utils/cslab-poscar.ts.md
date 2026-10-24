---
path: packages/shared/src/utils/cslab-poscar.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3682969f7b487dfc25ced60d49af162fdb6fa1bc
sha256: a7036d67cbe1246c9dafe3c0388c1a3f48e6bee487659ee62f68d558583e3190
lines: 184
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-poscar.ts

## 1. 结论与边界

POSCAR/CONTCAR 解析器（纯函数，`packages/shared/src/utils/cslab-poscar.ts:1-6`）：兼容 VASP 5（元素行）/VASP 4（无元素行）、Direct/Cartesian、Selective dynamics、**负缩放因子（目标体积）**。缺基本结构抛 `CsLabPoscarParseError`。

边界：空间群恒 P1（`:178-180`，POSCAR 无对称信息）；Selective 标志忽略（warning）；VASP 4 元素未知（PXRD 结构因子不可用，warning `:106`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabPoscarParseError` | class | 12-17 | `extends Error` | |
| `parsePoscar` | function | 50-184 | `(text) => CsLabStructureParseResult` | 唯一函数 |

内部：`assertVector`（`:19-24`）、`lengthOf/angleBetween/determinant`（`:26-43`）、`isNumericToken`（`:45-47`）。

## 3. 内部逻辑与关键流程

`parsePoscar`（`:50-184`）：

1. `:52-55` 行数 ≥8、scale 有限非零（否则抛）。
2. `:57-71` 三晶格矢量（`assertVector`）；`|det|<1e-12` → 抛「晶格体积为零」。
3. `:73-76` **负 scale** → `effectiveScale=cbrt(|scale|/rawVolume)`（目标体积语义）；三矢量缩放。
4. `:78-88` cell 六参数（长度/夹角由矢量算）、volume 由 `cellVolume` 回填、spaceGroup 恒 P1。
5. `:91-108` 元素行判定（line5 含非数字 token → VASP 5；否则 VASP 4 warning+counts=行5）。
6. `:110-114` counts 校验（负/非数抛、总和 0 抛）。
7. `:116-129` Selective 行跳过（`s` 开头）；坐标模式行必须 D/C 开头（否则抛 `:125-127`）。
8. `:131-168` 逐元素逐原子：空行抛、坐标 `assertVector`；Direct 直用、Cartesian 先乘 effectiveScale 再 `cartesianToFractional`（转换失败抛）；label=`元素+序号`（VASP 4 用 `X<n>`，`:135`）。
9. `:170-173` warnings：Selective 忽略、元素行与数量行长度不齐（按较短对齐）。
10. `:175-183` 返回 `format:'poscar'`、spaceGroupNumber:1、symmetryOperations:[]。

## 4. 调用者与调用链

出向：`../types/cslab`/`../types/cslab-vesta-types` 类型、`./cslab-crystal`（cartesianToFractional/cellVolume）（`:8-10`）。入向（检索=符号名+模块名，全冻结树）：`packages/shared/src/utils/cslab-analysis.ts:18,43`（`parseStructureText` poscar 分支）、`packages/shared/src/utils/cslab-volume.ts:19,160`——均为 **utils 内部间接**，无直接产品 import（main/preload/renderer/core/cli 全无直引）；`CsLabPoscarParseError` 零外部 catch/instanceof。测试 `cslab-poscar.test.ts`（本批，3 test）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

抛 `CsLabPoscarParseError` 6 处（行数/scale/体积零/数量/模式行/坐标缺失/转换失败）；warning 4 类（VASP4/Selective/长度不齐）。无异步/取消。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。空间群恒 P1 是诚实降级（不伪造对称，与 cslab-cif 红线同源）。

## 8. 修改影响面

- 元素行判定启发式（`:93`：含非数字即元素行）影响 VASP4/5 分流。
- 负 scale 目标体积语义（`:73`）改动影响晶胞数值。
- 测试：`cslab-poscar.test.ts`（本批）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-poscar.test.ts`（本批，68 行；断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| VASP4/5 双兼容+负 scale 目标体积 | 已证实 | `:73-108` |
| 空间群恒 P1（诚实降级） | 已证实 | `:178-180` |
| 6 类抛错+4 类 warning | 已证实 | `:52-173` |
| Cartesian 先缩放再转换 | 已证实 | `:149-156` |
| 生产 caller（cslab-analysis 链） | 已证实 | `cslab-analysis.ts:43` |
| 真实 VASP 语料覆盖 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 12-50 | covered |
| 负 scale/体积校验 | §3 | 70-76 | covered |
| VASP4/5 分流 | §3 | 91-108 | covered |
| Selective/模式行/原子循环 | §3 | 116-168 | covered |
