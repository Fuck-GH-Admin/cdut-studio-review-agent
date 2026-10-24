---
path: packages/shared/src/utils/cslab-polyhedra.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d4d95b64de14e617e86bc017a896025742936f8
sha256: a7dfd4a16a0f2a94923f4a119e0092adeee48cdb8285e2f086b4232d5c37b49a
lines: 36
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-polyhedra.test.ts

## 1. 测试目标

配位多面体（`packages/shared/src/utils/cslab-polyhedra.test.ts:9`）：金红石 TiO₂ 的 Ti-O 配位数=6。被测 `buildPolyhedra`（经 `parseCif`+`buildCrystalStructure`+`expandAtoms` 全链）。夹具：真实 `demo-data/cdut-science-rutile/rutile-tio2.cif`（`:7`，批外数据）。

## 2. 用例清单

共 **1 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 10-35 | 金红石 Ti-O 近邻 → 每个 Ti 配位数 6 | 读 CIF→结构→展开；`{centerElement:'Ti',neighborElements:['O'],cutoff:2.2}` | `buildPolyhedra` | 独立 |

## 3. 真实断言

- `:27` `polyhedra.length` toBeGreaterThanOrEqual(2)。
- `:28-34`（前 2 个逐个）：`coordinationNumber` toBe 6、`volume` toBeGreaterThan 0、`faces.length` ≥6、`meanBondLength` toBeGreaterThan 1.7 且 toBeLessThan 2.2。

## 4. 未覆盖与脆弱点

- 依赖真实数据文件（同 cslab-cif.test）。
- 仅前 2 个多面体断言（其余不检查）。
- `buildNeighborList` 直接无断言；凸包 faces 索引合法性、畸变度数值未锚。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 test、真实 CIF 链 | 已证实 | 全文 |
| 配位数 6+键长区间断言 | 已证实 | `:29-33` |
| 测试通过与否 | 未知 | NOT_RUN |
| demo 数据真实性 | 未知 | 批外文件 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| buildPolyhedra 主链 | §2/§3 | 1 | covered |
| buildNeighborList 独立面 | §4 | — | unknown |
