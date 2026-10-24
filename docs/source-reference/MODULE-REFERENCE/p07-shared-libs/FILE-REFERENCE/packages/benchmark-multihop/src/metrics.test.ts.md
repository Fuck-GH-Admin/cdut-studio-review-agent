---
path: packages/benchmark-multihop/src/metrics.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e7dc2fa4760546c2b3b27982b859d4b56dd1f9f7
sha256: 3a9598eec16b161463499c45f2f1115bfe5d215ceed338b37b44dcc9490b6ff0
lines: 201
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/metrics.test.ts

## 1. 测试目标

指标计算器单元测试（文件头 `packages/benchmark-multihop/src/metrics.test.ts:1-3`）：Hit@k/MRR/MAP@10 与官方口径一致 + 拒答判定 + 双口径覆盖率。纯函数断言，无 mock/夹具。

## 2. 用例清单

8 describe、22 test：

- `normalizeText`（`:17`）1 用例 `:18`。
- `scoreRetrieval`（`:26`）9 用例：`:27`（rank1 满分）、`:32`（rank2）、`:40`（rank5）、`:48`（双金标 MAP）、`:56`（未命中）、`:61`（空金标）、`:72`（Recall@4<@10）、`:81`（去重）、`:87`（Top-10 外不计）。
- `isAnswerCovered`（`:95`）2 用例 `:96/:101`。
- `mean`（`:106`）1、`median`（`:113`）1。
- `computeNullRefusalFlags`（`:121`）4 用例：`:122`（零分拒答）、`:127`（低于中位拒/高于误）、`:133`（**等于中位数判误召回**）、`:138`（空参考集）。
- `extractKeyUnits`（`:144`）3 用例：`:145`（日期）、`:152`（实体）、`:161`（数量级展开）。
- `computeAnswerCoverage`（`:167`）5 用例：`:168`（整串双命中）、`:174`（散落覆盖 strict false/token 1）、`:183`（1.4 billion≈1,400,000,000）、`:188`（缺失实体 token<1）、`:197`（日期等价）。

## 3. 真实断言（关键）

- `:29` 全指标对象 `toEqual`；`:36-37` `mrr`/`mapAt10` `toBeCloseTo(0.5, 6)`；`:53` `mapAt10` `toBeCloseTo((1+2/3)/2, 6)`；`:75-78` recall 0.5/1、map `(1+2/5)/2`。
- `:130` `flags` 为 `[true, false]`（1<2 拒、3>2 误）；`:135` `[false]`（2=2 误）；`:140` `[true, false]`。
- `:148-149` `tokens` 为 `['20230312']`、weight 3；`:163` 含 `'1400000000'`。
- `:179-180` `strict` false 且 `token` 为 1；`:194` `token` 小于 1；`:199` `token` 为 1。

## 4. 未覆盖与脆弱点

未覆盖：`canonicalizeDates` D Month YYYY 分支、`lemmatize` 各后缀、中文 bigram、`normalizeNumbers` 千分位独立断言。`toBeCloseTo(…,6)` 精度锚定浮点行为。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 22 用例行号与断言文本 | 已证实 | `:17-200` 逐条核对 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| scoreRetrieval 全口径 | §3 | test:27-92 | covered |
| 拒答 4 分支 | §3 | test:122-140 | covered |
| 覆盖率双口径 | §3 | test:145-199 | covered |
| 归一化内部分支 | §4 | — | partial |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
