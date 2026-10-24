---
path: packages/benchmark-multihop/src/metrics.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a769416abf96931320d4b0c1f5f19bb747cd9b9e
sha256: 4e7a64575abdbc1ce2427bc6277162c4649022e684ad59aa1f46a172b3e6aed9
lines: 299
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/metrics.ts

## 1. 结论与边界

MultiHop-RAG 评测**指标计算**（纯函数）。检索层严格对齐官方口径（Hit@4/10、MRR、MAP@10，`packages/benchmark-multihop/src/metrics.ts:4-7`）；问答层为模型无关离线代理（严格/加权覆盖率、Full Evidence Recall），「真正的问答准确率需大模型作答后判定，离线运行器不编造该数值」（`:9-15`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `normalizeText` | 导出函数 | 19-21 | `(text): string` | 小写+剔除非字母数字（保留 CJK `\u4e00-\u9fff`） |
| `RetrievalScore` | 导出接口 | 26-35 | `{hitAt4, hitAt10, mrr, mapAt10, recallAt4, recallAt10}` | 单题检索指标 |
| `scoreRetrieval` | 导出函数 | 43-84 | `(rankedDocIds, goldDocIds): RetrievalScore` | 官方口径计算 |
| `mean`/`median` | 导出函数 | 87-99 | `(values): number` | 空数组返 0 |
| `computeNullRefusalFlags` | 导出函数 | 112-115 | `(nullTopScores, referenceTopScores): boolean[]` | 拒答判定（自校准） |
| `CoverageKeyUnit` | 导出接口 | 221-226 | `{tokens, weight, raw}` | 关键信息单元 |
| `extractKeyUnits` | 导出函数 | 229-262 | `(answer): CoverageKeyUnit[]` | 四类加权单元抽取 |
| `isAnswerCovered` | 导出函数 | 265-269 | `(answer, evidenceText): boolean` | 严格口径整串包含 |
| `AnswerCoverage` | 导出接口 | 272-277 | `{strict, token}` | 双口径 |
| `computeAnswerCoverage` | 导出函数 | 286-299 | `(answer, evidenceText): AnswerCoverage` | 双口径计算 |

内部：`toHalfWidth`（`:120-124`）、`MONTH_INDEX/MONTH_WORDS`（`:127-133`）、`COVERAGE_STOP_WORDS`（`:136-145`，中英虚词）、`pad2`（`:148`）、`canonicalizeDates`（`:153-168`，3 种日期写法→YYYYMMDD）、`normalizeNumbers`（`:171-182`，百分比/数量级展开/千分位）、`lemmatize`（`:188-197`，轻量词形还原，答案与证据同套变换 `:186`）、`coverageTokens`（`:200-218`，中文 bigram）。

## 3. 内部逻辑与关键流程

- `scoreRetrieval`（`:43-84`）：空金标全 0（`:45-47`）；遍历 Top-10——命中置 hit、首个相关 rank→MRR、累计精度→MAP@10（除以 `min(|gold|,10)`，`:75-80`）、`seenGold` 去重计 Recall@4/10 分子（`:67-71`）。
- `computeNullRefusalFlags`（`:112-115`）：阈值=非 null 查询 top-1 分**中位数**；`score<=0 || score < threshold` 判正确拒答（**等于阈值判误召回**——严格小于，测试锚定）。
- `extractKeyUnits`（`:229-262`）：四类——日期 YYYYMMDD（权重 3）、数字/金额（≥4 位或带小数点，权重 3）、命名实体（首字母大写正则、排除月份词，权重 3）、其余实词（权重 1）；token 集去重（`:233-240`）。
- `computeAnswerCoverage`（`:286-299`）：strict=归一化整串包含；token=加权召回（单元 tokens **全部命中**才计权重，`:296`）；无单元时 token 回退 strict。

## 4. 调用者与调用链

入向：`packages/benchmark-multihop/src/evaluator.ts:8`（computeAnswerCoverage/computeNullRefusalFlags/mean/normalizeText/scoreRetrieval）；`dataset.test.ts:7`（normalizeText）；`metrics.test.ts:6-15`（8 个符号）。出向：无 import（纯函数）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

无 throw；边界：空金标/空数组/空答案（`isAnswerCovered` 空归一化返回 false，`:267`）均有防御分支。

## 7. 权限与权威状态

无权限分支；指标口径权威=文件头注释（`:4-15`）与官方 MultiHop-RAG 对齐声明。

## 8. 修改影响面

改口径影响 evaluator 聚合、report 展示、metrics.test 22 用例锚点；`normalizeText` 被 dataset.test 共用。

## 9. 测试证据

直接测试 `packages/benchmark-multihop/src/metrics.test.ts`（201 行、8 describe、22 用例；NOT_RUN）：normalizeText 4 断言（`:19-22`）；scoreRetrieval 9 用例（`:27-92`，含排名 1/2/5、双金标 MAP=(1+2/3)/2、空金标、Recall@4<@10、去重、Top-10 外不计）；isAnswerCovered 2（`:97-102`）；mean/median（`:108-117`）；computeNullRefusalFlags 4（`:123-140`，含「等于中位数判误召回」:133-135、空参考集:138-140）；extractKeyUnits 3（`:146-163`，YYYYMMDD/实体权重 3/1.4 billion→1400000000）；computeAnswerCoverage 5（`:169-199`，散落覆盖/跨写法数字/日期等价）。未覆盖：`canonicalizeDates` 的 `D Month YYYY` 分支、`lemmatize` 全分支、中文 bigram。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出+计算公式 | 已证实 | `:19-299` |
| 拒答阈值=中位数、严格小于 | 已证实 | `:112-115` + test:133-135 |
| 加权口径权重 3/3/3/1 与全命中计分 | 已证实 | `:221-226/:296` |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 10 导出 | §2/§3 | 19-299 | covered |
| 内部归一化工具 | §2 | 120-218 | covered |
| 测试断言 | §9 | test:17-200 | covered |
| 部分内部分支/运行 | §9/§10 | — | partial/unknown（NOT_RUN） |
