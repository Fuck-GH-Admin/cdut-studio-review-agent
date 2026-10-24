---
path: packages/benchmark-multihop/src/evaluator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 86f62cb5c586c2f9b711ccf9313545877cd2136a
sha256: 856cdbc01011378affe18cf9968f959c218520cade69d0bb81fcae5108808f96
lines: 328
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/evaluator.ts

## 1. 结论与边界

MultiHop-RAG **评测执行引擎**（运行时代码）：编排「语料注入 → 双引擎检索 → 指标统计」产出结构化报告（`packages/benchmark-multihop/src/evaluator.ts:1-6`）。检索/问答口径见 `metrics.ts`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状/签名 | 说明 |
| --- | --- | --- | --- | --- |
| `ProgressEvent` | 导出接口 | 20-27 | `{phase, engine, engineIndex, engineCount, completed, total}` | 进度事件 |
| `EvaluationOptions` | 导出接口 | 30-35 | `{engines, topK, concurrency, onProgress?}` | 选项 |
| `DEFAULT_EVALUATION_OPTIONS` | 导出常量 | 38-42 | `{engines:['classic','graphrag'], topK:10, concurrency:4}` | 默认 |
| `runEvaluation` | 导出异步函数 | 254-328 | `(runner, dataset, options): Promise<EvaluationReport>` | 主入口 |

内部：`buildTitleKeyIndex`（`:45-51`，normalizeText(title)→key）、`resolveGoldKeys`（`:54-61`）、`buildEvidenceAudit`（`:69-95`）、`mapWithConcurrency`（`:98-116`，共享 cursor 分发）、`evaluateQuery`（`:119-215`）、`summarize`（`:218-249`）。

## 3. 内部逻辑与关键流程

- `evaluateQuery`（`:119-215`）：`isNullQuery = 题型 null 或 goldKeys 空`（`:128`）；`runner.search` 计 latencyMs；`topScore=max(items.score, 0)`（`:133`）；文档级去重（按 documentId）映射回语料 key（`:136-143`）；null query 返回全 null 指标+`topScore`（`:145-166`）；正常题 `scoreRetrieval` + `computeAnswerCoverage(answer, 全部 matchedExcerpt 拼接)` + `fullEvidenceRecall`（`:168-191`）；**异常降级**：catch 后非 null 题指标记 0/false、`error` 记消息（`:192-214`）。
- `summarize`（`:218-249`）：scored=非 null 且 hitAt10 非 null；`computeNullRefusalFlags(null.topScore, scored.topScore)` 判拒答并回写 `item.refusalCorrect`（`:223-229`）；聚合均值 + `falseRecallRate = 1-refusalRate`（无 null 时 0，`:246`）。
- `runEvaluation`（`:254-328`）：`runner.createSession()` → 进度事件「正在注入语料并建立索引」→ `runner.ingest(corpus→{key,title,content})` 建 `docIdToKey`（`:271-275`）→ 金标解析 → 逐引擎 `mapWithConcurrency` 评测+进度回调 → `summarize` → 组报告（含 `buildEvidenceAudit`）→ **finally `runner.reset(sessionId)`**（`:325-327`）。
- `buildEvidenceAudit`（`:69-95`）：非 null 查询证据标题解析成功率审计（未解析样例 ≤20，`:82-83`）——注释 `:66-67`：解析失败会系统性抬高指标，必须自证。

## 4. 调用者与调用链

入向：`packages/benchmark-multihop/src/server.ts:18`（`DEFAULT_EVALUATION_OPTIONS`/`runEvaluation`）。出向：`./metrics`（5 函数，`:8`）、`./runner` 类型（`:9`）、`./types`（`:10-17`）。

## 5. 数据 I/O、读写与副作用

无直接 I/O；经 `BenchmarkRunner` HTTP 调主程序评测服务（createSession/ingest/search/reset）；`onProgress` 回调；`summarize` 会**回写** `refusalCorrect` 到结果对象（副作用-内存）。

## 6. 分支、失败、取消与恢复

- 单题异常降级不中断全评（`:192-214`）；会话回收 finally 保证（`:325-327`）；`ingest` 抛错则整个 runEvaluation 抛出（无 catch）。
- 无取消（options 无 signal）；重跑即重建会话。

## 7. 权限与权威状态

无权限分支（评测程序）；指标口径权威=metrics.ts；金标权威=dataset evidence 标题回溯（`buildTitleKeyIndex`）。

## 8. 修改影响面

改流程影响 server 的 `/api/run`、report 输入；`EvaluationReport` 形状由 types.ts 约束。

## 9. 测试证据

无专属测试（冻结树 glob `**/evaluator*test*` 零命中）；间接：metrics.test 覆盖被调指标函数。NOT_RUN；真实 runner 链路未验证。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+全流程与降级分支 | 已证实 | `:20-328` |
| null 拒答回写+审计动机 | 已证实 | `:223-229/:66-67` |
| finally reset 会话回收 | 已证实 | `:325-327` |
| 真实主程序评测服务行为 | 未知 | NOT_RUN（runner 依赖外部服务） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| runEvaluation/evaluateQuery/summarize/audit | §2/§3 | 45-328 | covered |
| 并发分发/降级/回收 | §3/§6 | 98-116/192-214/325-327 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
