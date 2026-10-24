---
path: packages/benchmark-multihop/src/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e1404386e2189c10df0f4a8d4e66f0acdf29969a
sha256: d4d2c672f4b907da0dd80d029d9b8a54aeb2e7a8c060536f7a407d45d8e85edf
lines: 156
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/types.ts

## 1. 结论与边界

MultiHop-RAG 评测的**纯类型契约文件**（零运行时代码、零副作用）。与官方数据集（Hugging Face `yixuantt/MultiHopRAG`）字段同构：查询集 `MultiHopRAG.json`（query/answer/question_type/evidence_list）、语料集 `corpus.json`（title/body/author/published_at/source/category/url）；「独立评测程序私有契约，绝不依赖主程序内部类型」（`packages/benchmark-multihop/src/types.ts:1-9`）。

## 2. 导出与关键符号

全部为类型导出（13 项）：

| 符号 | 行 | 形状 | 说明 |
| --- | --- | --- | --- |
| `MultiHopQuestionType` | 12 | `'inference'\|'comparison'\|'temporal'\|'null'` | 四大题型 |
| `MultiHopEvidence` | 15-26 | `{fact, source, title, published_at, author}` | 证据事实 |
| `MultiHopQuery` | 29-36 | 含 `evidence_list`（null query 空数组） | 单条查询 |
| `MultiHopCorpusDoc` | 39-48 | 含 `key`（稳定标识） | 语料文档 |
| `MultiHopDataset` | 51-60 | `{origin, label, embedded, corpus, queries}` | 完整数据集 |
| `QueryEvaluation` | 65-100 | 单题明细（hit/mrr/map/recall/coverage/refusal/topScore/latencyMs/error?） | 评测明细 |
| `EngineSummary` | 103-128 | 引擎聚合（scoredQueries/nullQueries/各指标/avgLatencyMs） | 聚合指标 |
| `EvidenceAudit` | 131-142 | `{totalEvidence, resolvedEvidence, resolutionRate, queriesWithPartialGold, unresolvedSamples[≤20]}` | 金标解析审计 |
| `EvaluationReport` | 145-156 | `{datasetOrigin/Label, totalQueries, corpusSize, engines, perEngineResults, evidenceAudit, startedAt, finishedAt}` | 完整报告 |

## 3. 内部逻辑与关键流程

无（纯类型）。语义要点：`QueryEvaluation` 中 null query 的检索指标/覆盖率恒为 `null` 不参评（`:75-96` 注释逐字段说明）；`refusalCorrect` 非 null query 恒 null（`:95`）；`EngineSummary.refusalRate` 无 null query 时为 0、展示层据 `nullQueries` 判 N/A（`:123`）；`topScore` 无结果为 0（`:93`）。

## 4. 调用者与调用链

入向：`types.ts` 被本包全部源码引用——`dataset.ts:13`、`dataset-loader.ts:13`、`evaluator.ts:10-17`、`report.ts:7`、`server.ts:21`、`metrics.test.ts`（间接）等。出向：无 import。

## 5. 数据 I/O、读写与副作用

无（编译期擦除）。

## 6. 分支、失败、取消与恢复

不适用（纯类型，依据：本文件无函数体/无 throw/无控制流）。

## 7. 权限与权威状态

无权限分支（纯类型）。

## 8. 修改影响面

改字段影响 dataset/dataset-loader/evaluator/report/server 全链 + 指标口径注释（`:75-96/:113-126`）；`MultiHopCorpusDoc.key` 是金标回溯的稳定标识（`evaluator.ts:45-61` 依赖）。

## 9. 测试证据

无专属测试（类型擦除无断言）；间接：`metrics.test.ts`/`dataset.test.ts` 通过使用方类型 indirection 覆盖形状。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 类型导出与语义注释 | 已证实 | `packages/benchmark-multihop/src/types.ts:12-156` |
| 零运行时代码 | 已证实 | 全文件仅 type/interface |
| 与官方字段同构 | 推断 | `:4-6` 注释声明（官方 schema 未比对） |
| 运行行为 | 不适用/未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 状态 |
| --- | --- | --- |
| 全部 13 类型 | §2/§3 | covered |
| 运行验证 | §10 | 不适用（纯类型） |
