---
path: packages/shared/src/utils/cslab-poscar.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f8d1e98c9548f358223e101fe2af7b93f1aa6e5a
sha256: 1579bb1df2a982dc5c7f7b71e37200d0a6d8edff9edb6bd3dcf49ea107139aff
lines: 68
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-poscar.test.ts

## 1. 测试目标

POSCAR 解析（`packages/shared/src/utils/cslab-poscar.test.ts:40`）：Direct 硅晶胞/原子、Direct vs Cartesian 一致性、VASP4 无元素行 warning。被测 `parsePoscar`。夹具：内联硅金刚石 POSCAR 文本（`directPoscar`/`cartesianPoscar` 工厂，`:16-38`，立方 5.431Å、8 原子分数坐标）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 41-48 | Direct 硅 → 晶胞与 8 原子正确 | `directPoscar()` | `parsePoscar` | 独立 |
| 2 | 50-60 | Direct 与 Cartesian 同结构 → 分数坐标一致 | 双工厂 | `parsePoscar`×2 逐轴比对 | 独立 |
| 3 | 62-67 | VASP4 无元素行 → 元素未知+warning | 内联 2 原子文本 | `parsePoscar` | 独立 |

## 3. 真实断言

- `:43-47` `cell.a` toBeCloseTo(5.431, 6)、`alpha` toBeCloseTo(90, 6)、atoms 长度 8、全 Si、`warnings` 长度 0。
- `:53-58` Cartesian atoms 长度相等；逐原子逐轴 toBeCloseTo(…, 6)。
- `:65-66` atoms 长度 2、`warnings.some(includes('VASP 4'))` toBe true。

## 4. 未覆盖与脆弱点

- 负 scale 目标体积、Selective dynamics、缺坐标抛错分支未测。
- Cartesian 用 `toFixed(8)` 生成文本（`:36`），容差 6 位——轻微舍入敏感（照实记录）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、内联夹具 | 已证实 | 全文 |
| 双模式一致性断言 | 已证实 | `:50-60` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| Direct 主链 | §2/§3 | 1 | covered |
| Cartesian 转换 | §2/§3 | 2 | covered |
| VASP4 分流 | §2/§3 | 3 | covered |
| 负 scale/Selective/抛错 | §4 | — | unknown |
