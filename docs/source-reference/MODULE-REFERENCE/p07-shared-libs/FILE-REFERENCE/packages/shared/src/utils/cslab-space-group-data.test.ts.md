---
path: packages/shared/src/utils/cslab-space-group-data.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e15ba799873f5db335a0da935fff56281e20655
sha256: 7e557dc5170b490d2d80e3260a7e237cc41479390dc0507fe177bd47d3493175
lines: 48
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-space-group-data.test.ts

## 1. 测试目标

空间群数据（`packages/shared/src/utils/cslab-space-group-data.test.ts:9`）：230 群完整性、闭包展开阶数=一般位置多重度、H-M 符号容错查找。被测 `CSLAB_SPACE_GROUPS`/`findSpaceGroupByNumber`/`findSpaceGroupByHm` + `generateSpaceGroupOperations`（cslab-symmetry）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 10-16 | 内置数据 230 个编号连续无重复 | — | 长度/集合大小/min-max 断言 | 独立 |
| 2 | 18-40 | 抽查 10 群闭包展开操作数=多重度 | `{1:1,2:2,14:4,62:8,136:16,221:48,225:192,227:192,229:96,230:96}` | `generateSpaceGroupOperations(seed)` | 独立 |
| 3 | 42-47 | H-M 大小写/空格差异 → 同群 | `'P 21/c'/'P2_1/c'/'p21/c'` | `findSpaceGroupByHm` | 独立 |

## 3. 真实断言

- `:11-15` toHaveLength(230)、`Set(numbers).size` toBe 230、min toBe 1、max toBe 230。
- `:32-38`（10 群逐个）：seed not.toBeNull、`operations.length` toBe order 且 toBe `seed.order`、`Set(ids).size` toBe length（操作 id 无重复）。
- `:43-46` 三种写法均 toBe 14、`Fd-3m` toBe 227。

## 4. 未覆盖与脆弱点

- 仅抽查 10/230 群（其余群阶数未验证）。
- `findSpaceGroupByNumber` 的越界/null 路径未锚。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、230 群完整性断言 | 已证实 | `:10-16` |
| 闭包阶数=order（10 群） | 已证实 | `:18-40` |
| H-M 归一化容错 | 已证实 | `:42-47` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| CSLAB_SPACE_GROUPS 完整性 | §2/§3 | 1 | covered |
| 闭包展开（10 群） | §2/§3 | 2 | covered（抽样） |
| findSpaceGroupByHm 容错 | §2/§3 | 3 | covered |
| 全 230 群阶数/越界 | §4 | — | unknown |
