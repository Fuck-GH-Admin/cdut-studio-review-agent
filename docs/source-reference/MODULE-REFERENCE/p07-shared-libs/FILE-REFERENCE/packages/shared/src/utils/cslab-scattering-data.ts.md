---
path: packages/shared/src/utils/cslab-scattering-data.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 53442a72b6385d1e7175f7985b6dee388fc0af22
sha256: 6a7c54d0c6ea9c1fb6716af49d36d17c44a2dbe0a8f34fda6d8ff9cc269544e5
lines: 316
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-scattering-data.ts

## 1. 结论与边界

CSLab **原子散射数据**（中性原子 Cromer-Mann 系数与原子质量，`packages/shared/src/utils/cslab-scattering-data.ts:1-7`）：来源 **ESRF DABAX f0_InterTables.dat**（International Tables for X-Ray Crystallography, 1995, vol C, p.500-502）；系数顺序 `[a1,a2,a3,a4,c,b1,b2,b3,b4]`（`:6`）。316 行纯数据文件、零逻辑、零 import。

边界：数据正确性依赖来源声明（静态抄录，运行时不再校验）；元素覆盖面见 §3。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabCromerMann` | type | 9 | `readonly [number×9]` | 9 元组系数 |
| `CSLAB_ATOMIC_NUMBERS` | const | 11-112 | `Readonly<Record<string, number>>` | 元素→原子序数 |
| `CSLAB_ATOMIC_MASSES` | const | 114-215 | `Readonly<Record<string, number>>` | 元素→原子质量 |
| `CSLAB_CROMER_MANN` | const | 217-316 | `Readonly<Record<string, CsLabCromerMann>>` | 元素→9 系数 |

## 3. 内部逻辑与关键流程

本文件不适用（纯数据）——结构事实（机械计数核实）：`CSLAB_ATOMIC_NUMBERS` **100 条**（H:1 … Fm:100，`:11-112`）；`CSLAB_ATOMIC_MASSES` **100 条**（同元素集 H:1.008 … Fm:257，`:114-215`）；`CSLAB_CROMER_MANN` **98 条**（H … Cf，`:217-316`）。

## 4. 调用者与调用链

出向：无。入向（检索=符号名+模块名，全冻结树）：

- `CSLAB_ATOMIC_NUMBERS`：`packages/shared/src/utils/cslab-pxrd.ts:25,39`（形状因子原子序数回退）。
- `CSLAB_ATOMIC_MASSES`：`packages/shared/src/utils/cslab-analysis.ts:16,81`（密度计算）。
- `CSLAB_CROMER_MANN`：`cslab-pxrd.ts:26,37`。
- `CsLabCromerMann` 类型：仅自用+barrel（零外部引用）。
- 产品入口：无直接引用（全部经 cslab-pxrd/cslab-analysis 间接）；core/cli/preload 无。
- 测试：无专属测试；经 `cslab-pxrd.test.ts`（3 test）间接覆盖。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯常量数据。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：无代码分支。

## 7. 权限与权威状态

本文件不适用（无权限代码）；数据权威=ESRF DABAX/IToXC 1995 来源声明（`:4-5`，静态抄录）。

## 8. 修改影响面

数据错误直接影响 PXRD 形状因子与密度计算（cslab-pxrd/cslab-analysis 全链）。

## 9. 测试证据

无专属测试；间接 `cslab-pxrd.test.ts`（3 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三表条目数 100/100/98 | 已证实（机械计数+边界行核对） | `:11-316` |
| 系数顺序声明 | 已证实 | `:6` |
| 来源声明（ESRF DABAX） | 已证实（注释） | `:4-5` |
| 逐系数抄录正确性 | 未知 | 未对照原表 |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 9-316 | covered |
| 数据正确性 | §10 | — | unknown |
