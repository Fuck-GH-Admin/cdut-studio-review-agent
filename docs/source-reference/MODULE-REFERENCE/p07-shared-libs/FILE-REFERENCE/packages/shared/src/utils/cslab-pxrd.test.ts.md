---
path: packages/shared/src/utils/cslab-pxrd.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a6d749c2e3b77d19508c27c5eab282d709446916
sha256: 22c383778c5e5fb61ab7bb6819d053adf4d87fd211978a739a181049de506458
lines: 60
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-pxrd.test.ts

## 1. 测试目标

PXRD 模拟（`packages/shared/src/utils/cslab-pxrd.test.ts:29`）：硅金刚石 Cu Kα 峰位与 **NIST SRM 640** 对标、未知元素形状因子回退、谱线曲线完整性。被测 `simulatePxrd`/`atomicFormFactor`；夹具 `siliconStructure()`（`:17-27`：Fd-3m、单 Si 原子经 `buildCrystalStructure` 展开）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 30-45 | 硅 Cu Kα → 前 6 允许峰位与 NIST 一致 | λ=1.5406、20-95°、fwhm 0.05、maxIndex 8 | `simulatePxrd` | 独立 |
| 2 | 47-51 | 未知元素 → 回退并标记 | `'Xx', 0.2` | `atomicFormFactor` | 独立 |
| 3 | 53-59 | 谱线曲线点数与峰表非空 | 默认 λ、20-90° | `simulatePxrd` | 独立 |

## 3. 真实断言

- `:38-44` `relativeIntensity>=1` 前 6 峰 vs `[28.44,47.30,56.12,69.13,76.38,88.03]`，逐峰 `|actual-expected|<0.05`（度）。
- `:49-50` `missingCoefficients` toBe true、`value` toBe 0。
- `:55-58` curve.x 长度 >100、x/y 等长、peaks 非空、`wavelengthAngstrom` toBeCloseTo(1.5406, 6)。

## 4. 未覆盖与脆弱点

- 仅硅一种结构；强度/多重性/LP 因子数值无独立锚（仅峰位）。
- `atomicFormFactor` 正常元素（有系数）分支未直接断言。
- NIST 对标为静态数值比对（±0.05°），数据来源在测试内联（照实记录）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、NIST 峰位对标 | 已证实 | `:39-44` |
| 未知元素 fail-safe | 已证实 | `:47-51` |
| 测试通过与否 | 未知 | NOT_RUN |
| NIST SRM 640 数值权威性 | 未知 | 内联常量 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| simulatePxrd 峰位 | §2/§3 | 1 | covered |
| atomicFormFactor 缺系数 | §2/§3 | 2 | covered |
| 曲线输出 | §2/§3 | 3 | covered |
| 强度/系数正常面 | §4 | — | unknown |
