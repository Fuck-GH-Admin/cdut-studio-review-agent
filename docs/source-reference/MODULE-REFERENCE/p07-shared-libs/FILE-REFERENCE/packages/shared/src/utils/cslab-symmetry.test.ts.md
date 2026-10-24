---
path: packages/shared/src/utils/cslab-symmetry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 72f049fd6160abfca4de7b32a338760f3c65ef58
sha256: 37d91c3fce7d358562ff185b875ed5103068a57f46b07f6ff9ad4443b90ad068
lines: 106
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-symmetry.test.ts

## 1. 测试目标

对称性引擎（`packages/shared/src/utils/cslab-symmetry.test.ts:36`）：三结构展开（硅/金红石/钛酸锶）、操作复合逆元、未识别群降级 P1、F 中心系统消光、生成元闭包唯一性。被测 `buildCrystalStructure`/`expandAtoms`/`composeOperations`/`detectSpaceGroup`/`generateSpaceGroupOperations`/`parseSymmetryOperationXyz`/`systematicAbsence`。夹具：`CUBIC`（5.431 立方）+ `structure()` 工厂（`:24-34`）。

## 2. 用例清单

共 **7 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | 37-45 | 硅 Fd-3m 单点 → 8 金刚石原子 | Si1 (0,0,0) | operations 192、expanded 8、全 multiplicity 8 |
| 2 | 47-65 | 金红石 P4_2/mnm → Ti2O4 共 6 | Ti1+O1 | operations 16、Ti 2、O 4 |
| 3 | 67-75 | 钛酸锶 Pm-3m → Sr1Ti1O3 共 5 | 3 位点 | expanded 5 |
| 4 | 77-86 | 操作×逆操作 → 恒等 | `parseSymmetryOperationXyz`×3 | `composed.translation` 12 倍取整 toEqual [0,0,0] |
| 5 | 88-92 | 未识别群 → 降级 P1 且 source 明确 | `'not-a-space-group'` | number 1、source `'assumed-p1'` |
| 6 | 94-98 | F 中心系统消光 | Fm-3m 225 | `systematicAbsence(1,1,0)` extinct true、(2,0,0) false |
| 7 | 100-105 | 生成元闭包 ≤192 且全唯一 | Ia-3d | 长度 ≤192、id 集合大小=长度 |

## 3. 真实断言

（逐条见 §2 表；关键锚）：`:41-44` 192/8/全 8；`:61-64` 16/2/4；`:74` 5；`:85` 12 倍取整恒等；`:90-91` `'assumed-p1'`；`:96-97` 消光二分；`:103-104` ≤192+唯一。

## 4. 未覆盖与脆弱点

- `detectSpaceGroup` 的显式对称操作路径（source 非 assumed-p1）未锚。
- `systematicAbsence` 其它心（A/C/I/B）未测。
- 用例 4 的平移取整容差（12 倍）是分数 1/12 网格假设。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 test/1 describe、三结构锚 | 已证实 | 全文 |
| P1 降级 source 语义 | 已证实 | `:88-92` |
| 闭包唯一性 | 已证实 | `:100-105` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| buildCrystalStructure/expandAtoms | §2/§3 | 1-3 | covered |
| composeOperations | §2/§3 | 4 | covered |
| detectSpaceGroup 降级 | §2/§3 | 5 | covered |
| systematicAbsence（F） | §2/§3 | 6 | covered（单心） |
| generateSpaceGroupOperations | §2/§3 | 7 | covered |
